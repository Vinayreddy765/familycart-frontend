/**
 * useAppData — single top-level data hook.
 * Loads shopping plan, items, suggestions, and activity.
 * Provides all mutation handlers used by App.tsx.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  ShoppingPlan,
  ShoppingItem,
  Suggestion,
  ActivityEntry,
  Persona,
  ParseResult,
} from "../types";
import {
  getShoppingPlans,
  createShoppingPlan,
  getItems,
  deleteItem,
  purchaseItem,
  parseAndAddItems,
  getSuggestions,
  getActivity,
  updateItem,
} from "../api/client";

// ─── State shape ──────────────────────────────────────────────────────────────

export interface AppData {
  plan: ShoppingPlan | null;
  allPlans: ShoppingPlan[];
  items: ShoppingItem[];
  suggestions: Suggestion[];
  activities: ActivityEntry[];
  activePlanId: string | null;

  loading: {
    initial: boolean;
    items: boolean;
    suggestions: boolean;
    activity: boolean;
  };

  errors: {
    load: string | null;
    add: string | null;
  };

  // Mutations
  refreshAll: () => Promise<void>;
  handleAddText: (text: string, forceAdd?: boolean) => Promise<ParseResult>;
  handlePurchase: (id: string, boughtQty: number | null, boughtUnit: string | null) => Promise<void>;
  handleDeleteItem: (id: string) => Promise<void>;
  handleUpdateItem: (id: string, updates: Partial<Pick<ShoppingItem, "name" | "quantity" | "unit" | "status" | "priority">>) => Promise<void>;
  handleCreatePlan: (shoppingDate: string, assignedTo: string, title?: string) => Promise<ShoppingPlan>;
  clearAddError: () => void;
  clearLoadError: () => void;
  persona: Persona;
  setPersona: (p: Persona) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppData(): AppData {
  const [persona, setPersona] = useState<Persona>("Mom");

  const [allPlans, setAllPlans]   = useState<ShoppingPlan[]>([]);
  const [plan, setPlan]           = useState<ShoppingPlan | null>(null);
  const [items, setItems]         = useState<ShoppingItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activities, setActivities]   = useState<ActivityEntry[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const [loading, setLoading] = useState({
    initial: true,
    items: true,
    suggestions: true,
    activity: true,
  });
  const [errors, setErrors] = useState<{ load: string | null; add: string | null }>({
    load: null,
    add: null,
  });

  // Keep persona in a ref so callbacks don't go stale
  const personaRef = useRef(persona);
  useEffect(() => { personaRef.current = persona; }, [persona]);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(l => ({ ...l, initial: true, items: true, suggestions: true, activity: true }));
    setErrors({ load: null, add: null });

    const [plansRes, suggestionsRes, activityRes] = await Promise.allSettled([
      getShoppingPlans(),
      getSuggestions(),
      getActivity(),
    ]);

    // Plans
    let activePlan: ShoppingPlan | null = null;
    if (plansRes.status === "fulfilled") {
      const plans = plansRes.value;
      setAllPlans(plans);
      activePlan = plans.find(p => p.status !== "COMPLETED") ?? plans[0] ?? null;
      setPlan(activePlan);
    } else {
      setErrors(e => ({ ...e, load: "Couldn't load shopping plans. Check your connection." }));
    }

    // Items for active plan
    if (activePlan) {
      try {
        const fetchedItems = await getItems(activePlan.id);
        setItems(fetchedItems);
      } catch {
        setErrors(e => ({ ...e, load: "Couldn't load shopping items." }));
      }
    } else {
      setItems([]);
    }

    // Suggestions
    if (suggestionsRes.status === "fulfilled") {
      setSuggestions(suggestionsRes.value.suggestions);
      setActivePlanId(suggestionsRes.value.activePlanId);
    }

    // Activity
    if (activityRes.status === "fulfilled") {
      setActivities(activityRes.value);
    }

    setLoading({ initial: false, items: false, suggestions: false, activity: false });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Refresh all sections after a mutation ──────────────────────────────────

  const refreshAll = useCallback(async () => {
    const [plansRes, suggestionsRes, activityRes] = await Promise.allSettled([
      getShoppingPlans(),
      getSuggestions(),
      getActivity(),
    ]);

    let currentPlan: ShoppingPlan | null = null;
    if (plansRes.status === "fulfilled") {
      const plans = plansRes.value;
      setAllPlans(plans);
      currentPlan = plans.find(p => p.status !== "COMPLETED") ?? plans[0] ?? null;
      setPlan(currentPlan);
    }

    if (currentPlan) {
      try {
        const fetchedItems = await getItems(currentPlan.id);
        setItems(fetchedItems);
      } catch { /* keep existing items */ }
    }

    if (suggestionsRes.status === "fulfilled") {
      setSuggestions(suggestionsRes.value.suggestions);
      setActivePlanId(suggestionsRes.value.activePlanId);
    }
    if (activityRes.status === "fulfilled") setActivities(activityRes.value);
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const handleAddText = useCallback(async (
    text: string,
    forceAdd = false,
  ): Promise<ParseResult> => {
    try {
      const result = await parseAndAddItems(
        text,
        personaRef.current,
        plan?.id,
        forceAdd,
      );
      await refreshAll();
      return result;
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : "Couldn't add items. Try again.";
      setErrors(e => ({ ...e, add: msg }));
      throw err;
    }
  }, [plan?.id, refreshAll]);

  const handlePurchase = useCallback(async (
    id: string,
    boughtQty: number | null,
    boughtUnit: string | null,
  ): Promise<void> => {
    // Optimistic update
    const prev = items;
    setItems(current =>
      current.map(item =>
        item.id === id
          ? {
              ...item,
              status: (boughtQty !== null && item.quantity !== null && boughtQty < item.quantity)
                ? "PARTIALLY_BOUGHT" as const
                : "BOUGHT" as const,
              boughtQuantity: boughtQty,
              boughtUnit: boughtUnit ?? item.unit,
              boughtBy: personaRef.current,
            }
          : item,
      ),
    );

    try {
      await purchaseItem(id, {
        boughtQuantity: boughtQty,
        boughtUnit: boughtUnit ?? undefined,
        purchasedBy: personaRef.current,
      });
      await refreshAll();
    } catch (err) {
      setItems(prev); // revert
      throw err;
    }
  }, [items, refreshAll]);

  const handleDeleteItem = useCallback(async (id: string): Promise<void> => {
    const prev = items;
    // Optimistic removal
    setItems(current => current.filter(i => i.id !== id));
    try {
      await deleteItem(id, personaRef.current);
      await refreshAll();
    } catch (err) {
      setItems(prev); // revert
      throw err;
    }
  }, [items, refreshAll]);

  const handleUpdateItem = useCallback(async (
    id: string,
    updates: Partial<Pick<ShoppingItem, "name" | "quantity" | "unit" | "status" | "priority">>,
  ): Promise<void> => {
    const prev = items;
    setItems(current =>
      current.map(item => item.id === id ? { ...item, ...updates } : item),
    );
    try {
      await updateItem(id, updates, personaRef.current);
      await refreshAll();
    } catch (err) {
      setItems(prev);
      throw err;
    }
  }, [items, refreshAll]);

  const handleCreatePlan = useCallback(async (
    shoppingDate: string,
    assignedTo: string,
    title?: string,
  ): Promise<ShoppingPlan> => {
    const newPlan = await createShoppingPlan({ shoppingDate, assignedTo, title });
    await refreshAll();
    return newPlan;
  }, [refreshAll]);

  return {
    plan, allPlans, items, suggestions, activities, activePlanId,
    loading, errors,
    refreshAll,
    handleAddText, handlePurchase, handleDeleteItem, handleUpdateItem, handleCreatePlan,
    clearAddError:  () => setErrors(e => ({ ...e, add: null })),
    clearLoadError: () => setErrors(e => ({ ...e, load: null })),
    persona, setPersona,
  };
}
