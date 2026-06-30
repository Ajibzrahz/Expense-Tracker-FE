export interface User { _id?: string; id?: string; name: string; email: string; role?: string }
export interface Category { _id: string; name: string; type: "income" | "expense"; user?: string }
export interface Transaction {
  _id: string; amount: number; type: "income" | "expense";
  description?: string; category: string | Category; date: string; createdAt?: string;
}
export interface Budget {
  _id: string; category: string | Category; limit: number;
  period: "monthly" | "weekly" | "daily" | "custom";
  startDate: string; spent: number; percentage: number; endDate: string;
}
export interface Summary { totalIncome: number; totalExpense: number; balance: number; savingsRate: number | string }
