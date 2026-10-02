import { Brain, RefreshCw, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { Suggestion } from "../types";
import { SuggestionSkeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

interface HouseholdMemoryProps {
  suggestions: Suggestion[];
  loading: boolean;
  onAddSuggestion: (name: string, qty: number | null, unit: string | null) => Promise<void>;
}

export function HouseholdMemory({ suggestions, loading, onAddSuggestion }: HouseholdMemoryProps) {
  return (
    <section aria-label="Household memory">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Brain className="w-[18px] h-[18px] text-amber-700" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-semibold text-charcoal-900 leading-snug">Household Memory</h2>
          <p className="text-xs text-charcoal-500 mt-0.5 leading-relaxed">
            What your household buys repeatedly — based on actual purchase history.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => <SuggestionSkeleton key={n} />)}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-white rounded-xl border border-amber-100">
          <EmptyState type="suggestions" />
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <motion.div key={s.name}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className={`bg-white rounded-xl border p-4 transition-colors
                ${s.alreadyOnList ? "border-green-100 bg-green-50/30" : "border-amber-100 hover:border-amber-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Remembered</p>
                    {s.alreadyOnList && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-green-600 font-medium">
                        <Check className="w-3 h-3" />On list
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-charcoal-900 text-sm">
                    {s.name}
                    {s.typicalQuantity !== null && (
                      <span className="text-charcoal-500 font-normal ml-1.5 text-xs">
                        · {s.typicalQuantity}{s.typicalUnit ? " " + s.typicalUnit : ""}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-0.5 leading-relaxed">{s.reason}</p>
                </div>

                {!s.alreadyOnList && (
                  <button onClick={() => onAddSuggestion(s.name, s.typicalQuantity, s.typicalUnit)}
                    aria-label={`Add ${s.name} to list`}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1">
                    <RefreshCw className="w-3 h-3" />Add
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
