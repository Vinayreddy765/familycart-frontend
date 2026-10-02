/**
 * FamilyCart API Client
 * Single source of truth for all backend calls. No fetch() outside this file.
 */

import type {
  ShoppingPlan,
  ShoppingItem,
  PurchaseHistory,
  Suggestion,
  ActivityEntry,
  ParseResult,
} from "../types";

// ─── Config ───────────────────────────────────────────────────────────────────

export const API_BASE_URL = "https://1zx35msqt2.execute-api.us-east-1.amazonaws.com";
export const FAMILY_ID    = "demo-family";

// ─── HTTP helper ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let body: Record<string, unknown> = {};
    try { body = await res.json(); } catch { /* ignore */ }
    throw new ApiError(
      res.status,
      (body.message as string) || (body.error as string) || res.statusText,
      body.code as string | undefined,
    );
  }

  return res.json() as Promise<T>;
}

// ─── Shopping Plans ───────────────────────────────────────────────────────────

export async function getShoppingPlans(): Promise<ShoppingPlan[]> {
  const d = await apiFetch<{ plans: ShoppingPlan[] }>(
    `/shopping-plans?familyId=${FAMILY_ID}`,
  );
  return d.plans ?? [];
}

export async function createShoppingPlan(input: {
  shoppingDate: string;
  assignedTo: string;
  title?: string;
}): Promise<ShoppingPlan> {
  const d = await apiFetch<{ plan: ShoppingPlan }>("/shopping-plans", {
    method: "POST",
    body: JSON.stringify({ ...input, familyId: FAMILY_ID }),
  });
  return d.plan;
}

export async function updateShoppingPlan(
  id: string,
  updates: Partial<Pick<ShoppingPlan, "status" | "assignedTo" | "shoppingDate" | "title">>,
): Promise<ShoppingPlan> {
  const d = await apiFetch<{ plan: ShoppingPlan }>(`/shopping-plans/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...updates, familyId: FAMILY_ID }),
  });
  return d.plan;
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getItems(shoppingPlanId?: string): Promise<ShoppingItem[]> {
  const qs = shoppingPlanId
    ? `familyId=${FAMILY_ID}&shoppingPlanId=${shoppingPlanId}`
    : `familyId=${FAMILY_ID}`;
  const d = await apiFetch<{ items: ShoppingItem[] }>(`/items?${qs}`);
  return d.items ?? [];
}

export async function createItem(input: {
  name: string;
  quantity?: number | null;
  unit?: string | null;
  status?: string;
  priority?: string;
  shoppingPlanId?: string;
  addedBy: string;
}): Promise<ShoppingItem> {
  const d = await apiFetch<{ item: ShoppingItem }>("/items", {
    method: "POST",
    body: JSON.stringify({ ...input, familyId: FAMILY_ID }),
  });
  return d.item;
}

export async function updateItem(
  id: string,
  updates: Partial<Pick<ShoppingItem, "name" | "quantity" | "unit" | "status" | "priority">>,
  editedBy: string,
): Promise<ShoppingItem> {
  const d = await apiFetch<{ item: ShoppingItem }>(`/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...updates, familyId: FAMILY_ID, editedBy }),
  });
  return d.item;
}

export async function deleteItem(id: string, removedBy: string): Promise<void> {
  await apiFetch<unknown>(`/items/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ familyId: FAMILY_ID, removedBy }),
  });
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export interface PurchaseInput {
  boughtQuantity?: number | null;
  boughtUnit?: string | null;
  purchasedBy: string;
}

export interface PurchaseResult {
  item: ShoppingItem;
  status: "BOUGHT" | "PARTIALLY_BOUGHT";
  historyEntry: PurchaseHistory;
}

export async function purchaseItem(
  id: string,
  input: PurchaseInput,
): Promise<PurchaseResult> {
  const d = await apiFetch<PurchaseResult>(`/items/${id}/purchase`, {
    method: "POST",
    body: JSON.stringify({ ...input, familyId: FAMILY_ID }),
  });
  return d;
}

// ─── AI Parse ─────────────────────────────────────────────────────────────────

export async function parseAndAddItems(
  text: string,
  addedBy: string,
  shoppingPlanId?: string,
  forceAdd = false,
): Promise<ParseResult> {
  const d = await apiFetch<ParseResult>("/ai/parse", {
    method: "POST",
    body: JSON.stringify({
      text,
      familyId: FAMILY_ID,
      addedBy,
      shoppingPlanId,
      forceAdd,
    }),
  });
  return d;
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function getHistory(itemName?: string): Promise<PurchaseHistory[]> {
  const qs = itemName
    ? `familyId=${FAMILY_ID}&itemName=${encodeURIComponent(itemName)}`
    : `familyId=${FAMILY_ID}`;
  const d = await apiFetch<{ history: PurchaseHistory[] }>(`/history?${qs}`);
  return d.history ?? [];
}

// ─── Suggestions ──────────────────────────────────────────────────────────────

export async function getSuggestions(): Promise<{
  suggestions: Suggestion[];
  activePlanId: string | null;
}> {
  return apiFetch(`/suggestions?familyId=${FAMILY_ID}`);
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export async function getActivity(): Promise<ActivityEntry[]> {
  const d = await apiFetch<{ activities: ActivityEntry[] }>(
    `/activity?familyId=${FAMILY_ID}`,
  );
  return d.activities ?? [];
}
