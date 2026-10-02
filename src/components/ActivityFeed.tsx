import { ShoppingCart, Plus, Trash2, Pencil, Activity } from "lucide-react";
import { motion } from "framer-motion";
import type { ActivityEntry } from "../types";
import { ActivitySkeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ActionIcon({ action }: { action: string }) {
  if (action === "bought")
    return <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center flex-shrink-0"><ShoppingCart className="w-3.5 h-3.5 text-green-700" /></div>;
  if (action === "removed")
    return <div className="w-8 h-8 rounded-full bg-rust-100 border border-rust-200 flex items-center justify-center flex-shrink-0"><Trash2 className="w-3.5 h-3.5 text-rust-600" /></div>;
  if (action === "edited")
    return <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0"><Pencil className="w-3.5 h-3.5 text-amber-700" /></div>;
  return <div className="w-8 h-8 rounded-full bg-charcoal-100 border border-charcoal-200 flex items-center justify-center flex-shrink-0"><Plus className="w-3.5 h-3.5 text-charcoal-600" /></div>;
}

function activityLine(entry: ActivityEntry): string {
  const verb = entry.action === "bought" ? "bought"
    : entry.action === "removed" ? "removed"
    : entry.action === "edited" ? "updated"
    : "added";
  const qty = entry.quantity !== null && entry.quantity !== undefined
    ? ` — ${entry.quantity}${entry.unit ? " " + entry.unit : ""}`
    : "";
  return `${entry.userName} ${verb}${entry.itemName ? ` ${entry.itemName}${qty}` : ""}`;
}

export function ActivityFeed({ activities, loading }: { activities: ActivityEntry[]; loading: boolean }) {
  return (
    <section aria-label="Family activity">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-charcoal-500" strokeWidth={1.5} />
        <h2 className="font-semibold text-charcoal-900">Family Activity</h2>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-charcoal-100 divide-y divide-charcoal-50">
          {[1, 2, 3].map(n => <div key={n} className="p-4"><ActivitySkeleton /></div>)}
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-xl border border-charcoal-100"><EmptyState type="activity" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-charcoal-100 divide-y divide-charcoal-50 overflow-hidden">
          {activities.map((entry, i) => (
            <motion.div key={entry.id}
              initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="flex items-start gap-3 p-4">
              <ActionIcon action={entry.action} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-charcoal-800 leading-snug">{activityLine(entry)}</p>
                <p className="text-xs text-charcoal-400 mt-0.5">{relativeTime(entry.timestamp)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
