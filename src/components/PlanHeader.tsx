import { CalendarDays, User, ShoppingCart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { ShoppingPlan, ShoppingItem, Persona } from "../types";

interface PlanHeaderProps {
  plan: ShoppingPlan | null;
  items: ShoppingItem[];
  persona: Persona;
  onCreatePlan: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function PlanHeader({ plan, items, persona, onCreatePlan }: PlanHeaderProps) {
  const active  = items.filter(i => i.status !== "BOUGHT" && i.status !== "PARTIALLY_BOUGHT");
  const bought  = items.filter(i => i.status === "BOUGHT" || i.status === "PARTIALLY_BOUGHT");
  const total   = items.length;
  const pct     = total > 0 ? Math.round((bought.length / total) * 100) : 0;

  if (!plan) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal-100 p-6 text-center">
        <ShoppingCart className="w-8 h-8 text-charcoal-300 mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-medium text-charcoal-700 mb-1">No shopping plan yet</p>
        <p className="text-sm text-charcoal-400 mb-4">Create a plan to start your family's shopping list.</p>
        <button onClick={onCreatePlan}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors">
          <Plus className="w-4 h-4" />
          Create shopping plan
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Plan title */}
          <h2 className="font-semibold text-charcoal-900 text-base leading-tight truncate">
            {plan.title ?? `Shopping – ${plan.shoppingDate}`}
          </h2>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            <span className="text-xs text-charcoal-500 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatDate(plan.shoppingDate)}
            </span>
            <span className="text-xs text-charcoal-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              {persona === plan.assignedTo ? "Your shopping" : `${plan.assignedTo}'s shopping`}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border
          ${plan.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200"
          : plan.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-charcoal-50 text-charcoal-500 border-charcoal-200"}`}>
          {plan.status === "COMPLETED" ? "Done" : plan.status === "IN_PROGRESS" ? "In progress" : "Planned"}
        </span>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-charcoal-400">
              {active.length === 0
                ? "All items picked up 🎉"
                : `${active.length} item${active.length === 1 ? "" : "s"} remaining`}
            </p>
            <span className="text-xs text-charcoal-400 tabular-nums">{bought.length}/{total}</span>
          </div>
          <div className="w-full h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-green-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }} />
          </div>
        </div>
      )}
    </div>
  );
}
