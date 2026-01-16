import { categoryColors } from '../../lib/mockData';

export const budgetData = {
  spent: 2847,
  budget: 4000,
  categories: [
    { name: 'Groceries', spent: 423, budget: 500, color: categoryColors['Groceries'] || '#22c55e', icon: 'shopping-cart' },
    { name: 'Shopping', spent: 287, budget: 300, color: categoryColors['Shopping'] || '#ec4899', icon: 'shopping-bag' },
    { name: 'Coffee', spent: 72, budget: 80, color: categoryColors['Coffee'] || '#8B4513', icon: 'coffee' },
    { name: 'Transport', spent: 134, budget: 150, color: categoryColors['Transport'] || '#3b82f6', icon: 'car' },
    { name: 'Dining', spent: 234, budget: 250, color: categoryColors['Dining'] || '#f97316', icon: 'utensils' },
    { name: 'Gas', spent: 98, budget: 120, color: categoryColors['Gas'] || '#6b7280', icon: 'fuel' },
    { name: 'Health', spent: 89, budget: 100, color: categoryColors['Health'] || '#ec4899', icon: 'pill' },
    { name: 'Tech', spent: 187, budget: 200, color: categoryColors['Tech'] || '#06b6d4', icon: 'laptop' },
  ],
};

export const weeklySpendingData = [
  { week: 'Week 1', spending: 687 },
  { week: 'Week 2', spending: 823 },
  { week: 'Week 3', spending: 592 },
  { week: 'Week 4', spending: 745 },
];