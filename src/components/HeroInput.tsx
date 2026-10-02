import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Persona, ShoppingItem, ParseResult } from "../types";

interface HeroInputProps {
  persona: Persona;
  planTitle?: string;
  onSubmit: (text: string, forceAdd?: boolean) => Promise<ParseResult>;
  error: string | null;
  onClearError: () => void;
}

type Phase = "idle" | "processing" | "revealed";

const GREETINGS: Record<Persona, string> = {
  Mom: "Good morning, Mom",
  Grandpa: "Good morning, Grandpa",
};

const PLACEHOLDERS = [
  "We're almost out of rice and need 5 kilos…",
  "Get 2 packs of detergent and 1 litre of oil…",
  "Running low on soap, and we need vegetables…",
  "Need milk 4 litres and 2 kg of wheat…",
];

function qtyLabel(item: ShoppingItem): string {
  if (item.quantity === null || item.quantity === undefined) return "";
  return ` · ${item.quantity}${item.unit ? " " + item.unit : ""}`;
}

export function HeroInput({ persona, planTitle, onSubmit, error, onClearError }: HeroInputProps) {
  const [text, setText]     = useState("");
  const [phase, setPhase]   = useState<Phase>("idle");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [, setPendingDuplicates] = useState<string[]>([]);
  const [lastText, setLastText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  async function submit(txt: string, force = false) {
    onClearError();
    setPhase("processing");
    setResult(null);
    setPendingDuplicates([]);
    try {
      const res = await onSubmit(txt, force);
      setResult(res);
      setPhase("revealed");
      setText("");
      setTimeout(() => { setPhase("idle"); setResult(null); setPendingDuplicates([]); }, 5000);
    } catch {
      setPhase("idle");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || phase === "processing") return;
    setLastText(trimmed);
    await submit(trimmed, false);
  }

  async function handleForceAdd() {
    await submit(lastText, true);
  }

  const canSubmit = text.trim().length > 0 && phase === "idle";
  const duplicates = result?.duplicates ?? [];

  return (
    <section aria-label="Add items to shopping plan" className="w-full">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-semibold text-charcoal-900 mb-1">{GREETINGS[persona]}</h1>
        <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed max-w-lg">
          {planTitle
            ? `Tell FamilyCart what you noticed — items will be added to ${planTitle}.`
            : "Tell FamilyCart what you noticed at home."}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <textarea ref={textareaRef} value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder={PLACEHOLDERS[0]}
            disabled={phase === "processing"}
            aria-label="Describe what you noticed at home"
            rows={2}
            className="w-full resize-none px-5 pt-4 pb-3 text-sm sm:text-base text-charcoal-900 placeholder-charcoal-300 bg-transparent outline-none leading-relaxed disabled:opacity-60 min-h-[60px] max-h-48" />
          <div className="flex items-center justify-between px-4 py-3 border-t border-charcoal-50 bg-charcoal-50/40">
            <p className="text-xs text-charcoal-400 select-none hidden sm:block">Enter to add · Shift+Enter for new line</p>
            <button type="submit" disabled={!canSubmit} aria-label="Add items"
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-700 text-white hover:bg-green-800 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2">
              <Send className="w-3.5 h-3.5" />Add
            </button>
          </div>
        </form>

        {/* Processing / revealed state */}
        <AnimatePresence>
          {phase !== "idle" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="border-t border-charcoal-100">
                {phase === "processing" && (
                  <div className="flex items-center gap-3 px-5 py-4">
                    <Loader2 className="w-5 h-5 text-green-700 animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-charcoal-700">FamilyCart is remembering…</p>
                      <p className="text-xs text-charcoal-400 mt-0.5">Asking AI to find the items in your message</p>
                    </div>
                  </div>
                )}

                {phase === "revealed" && result && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }} className="px-5 py-4 space-y-3">
                    {/* Added items */}
                    {result.items.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <p className="text-sm font-medium text-charcoal-700">
                            {result.items.length === 1 ? "1 item added" : `${result.items.length} items added`}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.items.map(item => (
                            <motion.span key={item.id}
                              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-800 border border-green-200 px-2.5 py-1 rounded-full">
                              <Sparkles className="w-3 h-3" />
                              {item.name}{qtyLabel(item as unknown as ShoppingItem)}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Duplicates */}
                    {duplicates.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-amber-800">Already on this week's list:</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {duplicates.map(d => (
                            <span key={d.name} className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-medium">
                              {d.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setPendingDuplicates([]); setPhase("idle"); setResult(null); }}
                            className="text-xs text-amber-700 underline">Keep existing</button>
                          <span className="text-amber-400 text-xs">·</span>
                          <button onClick={handleForceAdd}
                            className="text-xs text-amber-700 underline font-medium">Add anyway</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-rust-100">
              <div className="flex items-start gap-2 px-5 py-3 bg-rust-50">
                <p className="text-sm text-rust-700 flex-1">{error}</p>
                <button onClick={onClearError} className="text-rust-400 hover:text-rust-600 text-xs underline flex-shrink-0">Dismiss</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
