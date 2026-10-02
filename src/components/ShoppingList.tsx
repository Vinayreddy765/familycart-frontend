import { useState, forwardRef, useRef, useEffect } from "react";
import {
  AlertTriangle, ShoppingCart, CheckCircle2, Clock, User,
  MoreVertical, Trash2, Pencil, X, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShoppingItem, ItemStatus, ItemPriority } from "../types";
import { ItemCardSkeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function qtyLabel(q: number | null | undefined, u: string | null | undefined): string {
  if (q === null || q === undefined) return "";
  return `${q}${u ? " " + u : ""}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ItemStatus }) {
  if (status === "LOW")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-rust-700 bg-rust-50 border border-rust-200 px-2 py-0.5 rounded-full">
        <AlertTriangle className="w-3 h-3" />Running low
      </span>
    );
  if (status === "NEEDED")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <ShoppingCart className="w-3 h-3" />Needed
      </span>
    );
  if (status === "PARTIALLY_BOUGHT")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        Partial
      </span>
    );
  return null;
}

function PriorityPip({ priority }: { priority: ItemPriority }) {
  const map: Record<ItemPriority, { label: string; className: string }> = {
    HIGH:   { label: "High priority",   className: "bg-rust-400" },
    MEDIUM: { label: "Medium priority", className: "bg-amber-400" },
    LOW:    { label: "Low priority",    className: "bg-charcoal-200" },
  };
  const { label, className } = map[priority];
  return <span title={label} aria-label={label} className={`w-2 h-2 rounded-full flex-shrink-0 mt-[5px] ${className}`} />;
}

// ─── Three-dot menu ───────────────────────────────────────────────────────────

interface ItemMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

function ItemMenu({ onEdit, onDelete }: ItemMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button onClick={() => setOpen(o => !o)} aria-label="Item options" aria-expanded={open}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
        <MoreVertical className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl border border-charcoal-100 shadow-md py-1 overflow-hidden">
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors text-left">
              <Pencil className="w-3.5 h-3.5 text-charcoal-400" />Edit quantity
            </button>
            <button onClick={() => { setOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rust-600 hover:bg-rust-50 transition-colors text-left">
              <Trash2 className="w-3.5 h-3.5" />Remove item
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Inline quantity editor ───────────────────────────────────────────────────

interface QuantityEditorProps {
  item: ShoppingItem;
  onSave: (qty: number | null, unit: string | null) => Promise<void>;
  onCancel: () => void;
}

function QuantityEditor({ item, onSave, onCancel }: QuantityEditorProps) {
  const [qty, setQty] = useState(item.quantity !== null ? String(item.quantity) : "");
  const [unit, setUnit] = useState(item.unit ?? "");
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    const parsed = qty.trim() === "" ? null : parseFloat(qty);
    await onSave(parsed ?? null, unit.trim() || null);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
      <input type="number" min="0" step="any" value={qty} onChange={e => setQty(e.target.value)}
        placeholder="qty" autoFocus
        className="w-16 border border-charcoal-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-600" />
      <input type="text" value={unit} onChange={e => setUnit(e.target.value)}
        placeholder="unit"
        className="w-16 border border-charcoal-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-600" />
      <button onClick={handleSave} disabled={busy} aria-label="Save"
        className="w-6 h-6 flex items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
        {busy ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3 h-3" />}
      </button>
      <button onClick={onCancel} aria-label="Cancel"
        className="w-6 h-6 flex items-center justify-center rounded-lg border border-charcoal-200 text-charcoal-500 hover:bg-charcoal-50">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

interface DeleteConfirmProps {
  name: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

function DeleteConfirm({ name, onConfirm, onCancel }: DeleteConfirmProps) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-2 flex-wrap">
      <p className="text-xs text-charcoal-600 flex-1">Remove <strong>{name}</strong>?</p>
      <button onClick={async () => { setBusy(true); await onConfirm(); }} disabled={busy}
        className="text-xs font-medium text-rust-600 hover:text-rust-700 underline disabled:opacity-50">
        {busy ? "Removing…" : "Yes, remove"}
      </button>
      <button onClick={onCancel} className="text-xs text-charcoal-400 hover:text-charcoal-600">Cancel</button>
    </div>
  );
}

// ─── Circular checkbox ────────────────────────────────────────────────────────

function ItemCheckbox({ checked, partial, loading, disabled, label, onChange }: {
  checked: boolean; partial: boolean; loading: boolean; disabled: boolean; label: string; onChange: () => void;
}) {
  return (
    <button role="checkbox" aria-checked={checked} aria-label={label} onClick={onChange}
      disabled={disabled}
      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
        transition-all duration-200 mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2
        ${checked ? "bg-green-600 border-green-600"
          : partial ? "bg-amber-400 border-amber-400"
          : "bg-white border-charcoal-300 hover:border-green-500"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      {loading
        ? <span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
        : (checked || partial)
          ? <svg viewBox="0 0 10 8" className="w-2.5 h-2 text-white" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          : null}
    </button>
  );
}

// ─── Single item row ──────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ShoppingItem;
  onPurchaseClick: (item: ShoppingItem) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateQty: (id: string, qty: number | null, unit: string | null) => Promise<void>;
}

const ItemRow = forwardRef<HTMLDivElement, ItemRowProps>(
  function ItemRow({ item, onPurchaseClick, onDelete, onUpdateQty }, ref) {
    const [editing, setEditing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [deleteErr, setDeleteErr] = useState<string | null>(null);

    const isBought  = item.status === "BOUGHT";
    const isPartial = item.status === "PARTIALLY_BOUGHT";
    const isDone    = isBought || isPartial;

    return (
      <motion.div ref={ref} layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: isDone ? 0.55 : 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.22 } }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden">
        <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-colors
          ${isDone ? "bg-charcoal-50/60 border-charcoal-100" : "bg-white border-charcoal-100 hover:border-charcoal-200"}`}>

          {/* Checkbox */}
          <ItemCheckbox
            checked={isBought} partial={isPartial}
            loading={false} disabled={isDone}
            label={isDone ? `${item.name} — ${item.status.toLowerCase()}` : `Mark ${item.name} as purchased`}
            onChange={() => !isDone && onPurchaseClick(item)} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              {/* Name + priority */}
              <div className="flex items-start gap-2 min-w-0">
                <PriorityPip priority={item.priority} />
                <div className="min-w-0">
                  <p className={`font-medium text-sm leading-snug ${isDone ? "line-through text-charcoal-400" : "text-charcoal-900"}`}>
                    {item.name}
                  </p>
                  {/* Quantity line */}
                  {!editing && (
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      {item.quantity !== null ? (
                        isDone && item.boughtQuantity !== null
                          ? <>
                              <span className="text-green-600 font-medium">{qtyLabel(item.boughtQuantity, item.boughtUnit)}</span>
                              {item.boughtQuantity !== item.quantity && (
                                <span className="text-charcoal-400"> / needed {qtyLabel(item.quantity, item.unit)}</span>
                              )}
                            </>
                          : qtyLabel(item.quantity, item.unit)
                      ) : (
                        <span className="text-charcoal-300 italic">No quantity set</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {!isDone && <StatusBadge status={item.status} />}
                {!isDone && (
                  <ItemMenu
                    onEdit={() => { setConfirming(false); setEditing(e => !e); }}
                    onDelete={() => { setEditing(false); setConfirming(c => !c); }} />
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              {!isDone ? (
                <>
                  <span className="text-xs text-charcoal-400 flex items-center gap-1">
                    <User className="w-3 h-3" />Added by {item.addedBy}
                  </span>
                  <span className="text-xs text-charcoal-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{relativeTime(item.createdAt)}
                  </span>
                </>
              ) : (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs text-charcoal-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {isBought ? "Bought" : "Partially bought"}
                  {item.boughtBy ? ` by ${item.boughtBy}` : ""}
                  {item.boughtAt ? <span className="text-charcoal-300 ml-1">· {relativeTime(item.boughtAt)}</span> : null}
                </motion.span>
              )}
            </div>

            {/* Inline editors */}
            <AnimatePresence>
              {editing && !isDone && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}>
                  <QuantityEditor item={item}
                    onSave={async (qty, unit) => { await onUpdateQty(item.id, qty, unit); setEditing(false); }}
                    onCancel={() => setEditing(false)} />
                </motion.div>
              )}
              {confirming && !isDone && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}>
                  {deleteErr && <p className="text-xs text-rust-600 mt-1">{deleteErr}</p>}
                  <DeleteConfirm name={item.name}
                    onConfirm={async () => {
                      try { await onDelete(item.id); }
                      catch (e) { setDeleteErr(e instanceof Error ? e.message : "Failed"); }
                    }}
                    onCancel={() => setConfirming(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }
);

// ─── Shopping list section ────────────────────────────────────────────────────

interface ShoppingListProps {
  items: ShoppingItem[];
  loading: boolean;
  onPurchaseClick: (item: ShoppingItem) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateQty: (id: string, qty: number | null, unit: string | null) => Promise<void>;
}

export function ShoppingList({ items, loading, onPurchaseClick, onDelete, onUpdateQty }: ShoppingListProps) {
  const active  = items.filter(i => i.status !== "BOUGHT");
  const bought  = items.filter(i => i.status === "BOUGHT");

  return (
    <section aria-label="Shopping list">
      {loading ? (
        <div className="space-y-2.5" aria-busy="true">
          {[1, 2, 3, 4, 5, 6].map(n => <ItemCardSkeleton key={n} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-charcoal-100">
          <EmptyState type="items" />
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {active.map(item => (
              <ItemRow key={item.id} item={item}
                onPurchaseClick={onPurchaseClick}
                onDelete={onDelete}
                onUpdateQty={onUpdateQty} />
            ))}
          </AnimatePresence>

          {bought.length > 0 && (
            <div className="mt-3 pt-3 border-t border-charcoal-100">
              <p className="text-xs font-medium text-charcoal-400 mb-2 px-1">
                Picked up ({bought.length})
              </p>
              <div className="space-y-2">
                <AnimatePresence>
                  {bought.map(item => (
                    <ItemRow key={item.id} item={item}
                      onPurchaseClick={onPurchaseClick}
                      onDelete={onDelete}
                      onUpdateQty={onUpdateQty} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
