import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarDays } from "lucide-react";
import type { ShoppingPlan } from "../types";

interface CreatePlanDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (shoppingDate: string, assignedTo: string, title?: string) => Promise<ShoppingPlan>;
}

const PERSONAS = ["Mom", "Grandpa", "Dad", "Family"];

function nextWednesday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (3 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function CreatePlanDialog({ open, onClose, onCreate }: CreatePlanDialogProps) {
  const [date, setDate]         = useState(nextWednesday());
  const [assignedTo, setAssignedTo] = useState("Grandpa");
  const [title, setTitle]       = useState("");
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState<string | null>(null);

  async function handleCreate() {
    if (!date) { setErr("Please select a shopping date."); return; }
    setBusy(true);
    setErr(null);
    try {
      await onCreate(date, assignedTo, title.trim() || undefined);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create plan.");
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-900/40 z-40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div role="dialog" aria-modal="true" aria-labelledby="create-plan-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 bottom-6 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-sm bg-white rounded-2xl shadow-xl border border-charcoal-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-green-700" />
                <h2 id="create-plan-title" className="font-semibold text-charcoal-900">New shopping plan</h2>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-charcoal-400 hover:text-charcoal-600 p-1 -mr-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-charcoal-700 block mb-1.5">Shopping date</span>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full border border-charcoal-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-charcoal-700 block mb-1.5">Who's shopping?</span>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                  className="w-full border border-charcoal-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600">
                  {PERSONAS.map(p => <option key={p}>{p}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-charcoal-700 block mb-1.5">Title <span className="font-normal text-charcoal-400">(optional)</span></span>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder={`${assignedTo}'s shopping`}
                  className="w-full border border-charcoal-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
              </label>
            </div>

            {err && <p className="text-xs text-rust-600 mt-3">{err}</p>}

            <div className="flex gap-2 mt-5">
              <button onClick={onClose} disabled={busy}
                className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50">
                {busy ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Create plan"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
