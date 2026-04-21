export const EXPENSE_CATEGORIES = [
  { id: 'Housing' },
  { id: 'Food' },
  { id: 'Transport' },
  { id: 'Shopping' },
  { id: 'Health' },
  { id: 'Education' },
  { id: 'Entertainment' },
  { id: 'Bills' },
  { id: 'Utilities' },
  { id: 'Other' },
];

export const INCOME_CATEGORIES = [
  { id: 'Salary' },
  { id: 'Freelancing' },
  { id: 'Investments' },
  { id: 'Gift' },
  { id: 'Other' },
];

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  PORTFOLIO: 'portfolio',
  TAX: 'Tax',
  SUBSCRIPTION: 'Subscription',
  SHARED: 'Shared',
};

export const TYPE_COLORS = {
  income: 'bg-success/10 text-success',
  portfolio: 'bg-secondary/10 text-secondary',
  Tax: 'bg-warning/10 text-warning',
  Subscription: 'bg-primary/10 text-primary',
  Shared: 'bg-tertiary/10 text-tertiary',
  expense: 'bg-error/10 text-error',
};
