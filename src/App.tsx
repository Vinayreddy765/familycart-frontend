import { useState } from "react";
import { Header } from "./components/Header";
import { PlanHeader } from "./components/PlanHeader";
import { HeroInput } from "./components/HeroInput";
import { ShoppingList } from "./components/ShoppingList";
import { HouseholdMemory } from "./components/HouseholdMemory";
import { ActivityFeed } from "./components/ActivityFeed";
import { PurchaseDialog } from "./components/PurchaseDialog";
import { CreatePlanDialog } from "./components/CreatePlanDialog";
import { useAppData } from "./hooks/useAppData";
import type { ShoppingItem } from "./types";
import { createItem } from "./api/client";

export default function App() {
  const {
    plan, items, suggestions, activities,
    loading, errors,
    persona, setPersona,
    handleAddText,
    handlePurchase,
    handleDeleteItem,
    handleUpdateItem,
    handleCreatePlan,
    refreshAll,
    clearAddError,
  } = useAppData();

  // Purchase dialog state
  const [purchaseTarget, setPurchaseTarget] = useState<ShoppingItem | null>(null);
  // Create plan dialog state
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  // ── Add suggestion to current plan ────────────────────────────────────────
  async function handleAddSuggestion(
    name: string,
    qty: number | null,
    unit: string | null,
  ) {
    if (!plan) { setShowCreatePlan(true); return; }
    try {
      await createItem({
        name,
        quantity: qty,
        unit,
        status: "NEEDED",
        addedBy: persona,
        shoppingPlanId: plan.id,
      });
      await refreshAll();
    } catch { /* non-critical */ }
  }

  // ── Update item quantity wrapper ───────────────────────────────────────────
  async function handleUpdateQty(
    id: string,
    qty: number | null,
    unit: string | null,
  ) {
    await handleUpdateItem(id, { quantity: qty, unit });
  }

  return (
    <div className="min-h-screen bg-parchment font-sans">
      <Header persona={persona} onPersonaChange={setPersona} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Load error */}
        {errors.load && (
          <div className="mb-6 bg-rust-50 border border-rust-200 rounded-xl px-4 py-3 text-sm text-rust-700">
            {errors.load}
          </div>
        )}

        {/* Plan header */}
        <div className="mb-6">
          <PlanHeader
            plan={plan}
            items={items}
            persona={persona}
            onCreatePlan={() => setShowCreatePlan(true)}
          />
        </div>

        {/* Hero input */}
        <div className="mb-10">
          <HeroInput
            persona={persona}
            planTitle={plan?.title}
            onSubmit={handleAddText}
            error={errors.add}
            onClearError={clearAddError}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Shopping list */}
          <div className="lg:col-span-2">
            <ShoppingList
              items={items}
              loading={loading.items}
              onPurchaseClick={setPurchaseTarget}
              onDelete={handleDeleteItem}
              onUpdateQty={handleUpdateQty}
            />
          </div>

          {/* Right — Memory + Activity */}
          <div className="space-y-8">
            <HouseholdMemory
              suggestions={suggestions}
              loading={loading.suggestions}
              onAddSuggestion={handleAddSuggestion}
            />
            <ActivityFeed
              activities={activities}
              loading={loading.activity}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal-100 mt-16 py-6 text-center text-xs text-charcoal-400">
        FamilyCart · A shared memory for what your family needs ·{" "}
        <span className="text-charcoal-300">Powered by Amazon Bedrock</span>
      </footer>

      {/* Purchase dialog */}
      <PurchaseDialog
        item={purchaseTarget}
        onConfirm={async (qty, unit) => {
          if (!purchaseTarget) return;
          await handlePurchase(purchaseTarget.id, qty, unit);
        }}
        onClose={() => setPurchaseTarget(null)}
      />

      {/* Create plan dialog */}
      <CreatePlanDialog
        open={showCreatePlan}
        onClose={() => setShowCreatePlan(false)}
        onCreate={handleCreatePlan}
      />
    </div>
  );
}
