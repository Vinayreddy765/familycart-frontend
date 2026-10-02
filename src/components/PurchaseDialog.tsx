import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart } from "lucide-react";
import type { ShoppingItem } from "../types";

interface PurchaseDialogProps {
  item: ShoppingItem | null;
  onConfirm: (boughtQty: number | null, boughtUnit: string | null) => Promise<void>;
  onClose: () => void;
}

export function PurchaseDialog({ item, onConfirm, onClose }: PurchaseDialogProps) {
  const [qty, setQty]   = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setQty(item.quantity !== null ? String(item.quantity) : "");
      setErr(null);
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [item]);

  async function handleConfirm() {
    if (!item) return;
    setBusy(true);
    setErr(null);
    const parsed = qty.trim() === "" ? null : parseFloat(qty);
    if (qty.trim() !== "" && (isNaN(parsed!) || parsed! <= 0)) {
      setErr("Enter a valid quantity.");
      setBusy(false);
      return;
    }
    try {
      await onConfirm(parsed, item.unit);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed. Try again.");
      setBusy(false);
    }
  }

  const isPartial = item?.quantity !== null && qty.trim() !== "" &&
    parseFloat(qty) < (item?.quantity ?? 0);

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-900/40 z-40 backdrop-blur-sm"
            onClick={onClose} aria-hidden="true" />

          {/* Dialog */}
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="purchase-dialog-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-4 bottom-6 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-sm bg-white rounded-2xl shadow-xl border border-charcoal-100 p-6">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p id="purchase-dialog-title" className="font-semibold text-charcoal-900">
                  {item.name}
                </p>
                {item.quantity !== null && (
                  <p className="text-sm text-charcoal-500 mt-0.5">
                    Needed: {item.quantity} {item.unit}
                  </p>
                )}
              </div>
              <button onClick={onClose} aria-label="Close"
                className="text-charcoal-400 hover:text-charcoal-600 transition-colors p-1 -mt-1 -mr-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quantity input */}
            <label className="block mb-4">
              <span className="text-sm font-medium text-charcoal-700 block mb-1.5">
                How much did you buy?
              </span>
              <div className="flex items-center gap-2">
                <input ref={inputRef} type="number" min="0" step="any"
                  value={qty} onChange={e => setQty(e.target.value)}
                  placeholder={item.quantity !== null ? String(item.quantity) : "0"}
                  onKeyDown={e => { if (e.key === "Enter") handleConfirm(); }}
                  className="flex-1 border border-charcoal-200 rounded-xl px-3 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
                {item.unit && (
                  <span className="text-sm text-charcoal-500 font-medium min-w-[3rem]">{item.unit}</span>
                )}
              </div>
            </label>

            {/* Partial warning */}
            <AnimatePresence>
              {isPartial && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                  This is less than needed — item will be marked <strong>Partially Bought</strong>.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Error */}
            {err && <p className="text-xs text-rust-600 mb-3">{err}</p>}

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={onClose} disabled={busy}
                className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleConfirm} disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50">
                {busy
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><ShoppingCart className="w-4 h-4" />{isPartial ? "Mark partial" : "Confirm purchase"}</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
