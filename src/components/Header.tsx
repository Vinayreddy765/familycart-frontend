import { Users } from "lucide-react";
import type { Persona } from "../types";

interface HeaderProps {
  persona: Persona;
  onPersonaChange: (p: Persona) => void;
}

const PERSONAS: Persona[] = ["Mom", "Grandpa"];

export function Header({ persona, onPersonaChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-parchment/90 backdrop-blur-sm border-b border-charcoal-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-white" aria-hidden="true">
              <path d="M3 3h2l.4 2M7 13h10l2-7H5.4M7 13l-1.2-5M7 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold text-charcoal-900 tracking-tight">FamilyCart</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-charcoal-500 bg-charcoal-50 px-2.5 py-1 rounded-full border border-charcoal-100">
            <Users className="w-3 h-3" />
            <span>Demo Family</span>
          </div>

          <div role="group" aria-label="Select persona"
            className="flex items-center bg-charcoal-50 rounded-full p-0.5 border border-charcoal-100">
            {PERSONAS.map((p) => (
              <button key={p} onClick={() => onPersonaChange(p)} aria-pressed={persona === p}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                  ${persona === p ? "bg-white text-charcoal-900 shadow-sm" : "text-charcoal-500 hover:text-charcoal-700"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
