import { ShoppingCart, Sparkles, ActivitySquare } from "lucide-react";

interface EmptyStateProps { type: "items" | "suggestions" | "activity" }

const configs = {
  items: {
    Icon: ShoppingCart,
    heading: "Your list is clear",
    body: "Tell FamilyCart what you noticed at home and it will add items here.",
    hint: 'Try: "We\'re almost out of rice and need 5 kg"',
  },
  suggestions: {
    Icon: Sparkles,
    heading: "No patterns yet",
    body: "As Grandpa marks items as purchased, FamilyCart builds a memory of your household's recurring needs.",
    hint: null,
  },
  activity: {
    Icon: ActivitySquare,
    heading: "No activity yet",
    body: "When family members add or buy items, the timeline appears here.",
    hint: null,
  },
};

export function EmptyState({ type }: EmptyStateProps) {
  const { Icon, heading, body, hint } = configs[type];
  return (
    <div className="flex flex-col items-center text-center py-10 px-6 gap-3">
      <div className="w-12 h-12 rounded-full bg-charcoal-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-charcoal-400" strokeWidth={1.5} />
      </div>
      <p className="font-semibold text-charcoal-700 text-sm">{heading}</p>
      <p className="text-charcoal-400 text-sm leading-relaxed max-w-xs">{body}</p>
      {hint && <p className="text-xs text-charcoal-300 italic mt-1">{hint}</p>}
    </div>
  );
}
