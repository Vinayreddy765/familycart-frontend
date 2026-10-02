// ─── Application types (non-API) ─────────────────────────────────────────────

export type Persona = "Mom" | "Grandpa";

// ─── Domain types (mirror backend) ───────────────────────────────────────────

export type PlanStatus   = "PLANNED" | "IN_PROGRESS" | "COMPLETED";
export type ItemStatus   = "NEEDED" | "LOW" | "PARTIALLY_BOUGHT" | "BOUGHT";
export type ItemPriority = "LOW" | "MEDIUM" | "HIGH";

export interface ShoppingPlan {
  id: string;
  familyId: string;
  shoppingDate: string;      // YYYY-MM-DD
  assignedTo: string;
  title?: string;
  status: PlanStatus;
  createdAt: string;
  completedAt?: string;
}

export interface ShoppingItem {
  id: string;
  familyId: string;
  shoppingPlanId: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  status: ItemStatus;
  priority: ItemPriority;
  addedBy: string;
  createdAt: string;
  boughtQuantity?: number | null;
  boughtUnit?: string | null;
  boughtBy?: string;
  boughtAt?: string;
}

export interface PurchaseHistory {
  id: string;
  familyId: string;
  shoppingPlanId: string;
  itemId: string;
  itemName: string;
  quantity: number | null;
  unit: string | null;
  purchasedBy: string;
  purchasedAt: string;
}

export interface Suggestion {
  name: string;
  typicalQuantity: number | null;
  typicalUnit: string | null;
  purchaseCount: number;
  lastPurchasedAt: string;
  daysSinceLastPurchase: number;
  avgDaysBetweenPurchases: number | null;
  reason: string;
  alreadyOnList: boolean;
}

export interface ActivityEntry {
  id: string;
  familyId: string;
  userName: string;
  action: "added" | "bought" | "removed" | "edited" | string;
  itemName?: string;
  quantity?: number | null;
  unit?: string | null;
  timestamp: string;
}

// ─── AI parse result ──────────────────────────────────────────────────────────

export interface ParsedItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  status: ItemStatus;
  priority: ItemPriority;
}

export interface ParseResult {
  items: ParsedItem[];
  duplicates: Array<{ name: string; existingItem: ShoppingItem }>;
  shoppingPlanId: string;
}
