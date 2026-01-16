export const debtTypeColors: Record<string, string> = {
  credit_card: '#ec4899',
  student_loan: '#8b5cf6',
  auto_loan: '#3b82f6',
  mortgage: '#10b981',
  personal_loan: '#f59e0b',
  bnpl: '#06b6d4',
  loan: '#3b82f6',
};

export const debtTypeLabels: Record<string, string> = {
  credit_card: 'Credit Card',
  student_loan: 'Student Loan',
  auto_loan: 'Auto Loan',
  mortgage: 'Mortgage',
  personal_loan: 'Personal Loan',
  bnpl: 'Buy Now Pay Later',
  loan: 'Loan',
};

export const debtTypeIconNames: Record<string, string> = {
  credit_card: 'CreditCard',
  student_loan: 'GraduationCap',
  auto_loan: 'Car',
  mortgage: 'Home',
  personal_loan: 'Banknote',
  bnpl: 'ShoppingCart',
  loan: 'FileText',
};

export type SortOption = 'due_date' | 'amount' | 'apr';

export const sortLabels: Record<SortOption, string> = {
  due_date: 'Due Date',
  amount: 'Amount',
  apr: 'Interest Rate',
};