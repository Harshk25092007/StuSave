export interface StudentExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface StudentBudget {
  Food: number;
  Textbooks: number;
  Rent: number;
  Transit: number;
  Social: number;
  Other: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  notes?: string;
}

export interface SavingsSuggestion {
  title: string;
  description: string;
  potentialSavings: string;
}

export interface BudgetAdjustment {
  category: string;
  currentLimit: number;
  suggestedLimit: number;
  reason: string;
}

export interface AdvisorResponse {
  generalStatus: string;
  summaryAdvice: string;
  savingsSuggestions: SavingsSuggestion[];
  suggestedBudgetAdjustments: BudgetAdjustment[];
  chatResponse: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  username: string;
  studentId: string;
  passwordHash: string;
}

export const STUDENT_CATEGORIES = [
  "Food",
  "Textbooks",
  "Rent",
  "Transit",
  "Social",
  "Other"
] as const;
