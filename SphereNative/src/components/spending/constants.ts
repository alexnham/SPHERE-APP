import { categoryColors } from '../../lib/mockData';

export const budgetData = {
  spent: 2847,
  budget: 4000,
  categories: [
    { name: 'Groceries', spent: 423, budget: 500, color: categoryColors['Groceries'] || '#22c55e', icon: '🥑' },
    { name: 'Shopping', spent: 287, budget: 300, color: categoryColors['Shopping'] || '#ec4899', icon: '🛍️' },
    { name: 'Coffee', spent: 72, budget: 80, color: categoryColors['Coffee'] || '#8B4513', icon: '☕' },
    { name: 'Transport', spent: 134, budget: 150, color: categoryColors['Transport'] || '#3b82f6', icon: '🚗' },
    { name: 'Dining', spent: 234, budget: 250, color: categoryColors['Dining'] || '#f97316', icon: '🍽️' },
    { name: 'Gas', spent: 98, budget: 120, color: categoryColors['Gas'] || '#6b7280', icon: '⛽' },
    { name: 'Health', spent: 89, budget: 100, color: categoryColors['Health'] || '#ec4899', icon: '💊' },
    { name: 'Tech', spent: 187, budget: 200, color: categoryColors['Tech'] || '#06b6d4', icon: '💻' },
  ],
};

export const weeklySpendingData = [
  { week: 'Week 1', spending: 687 },
  { week: 'Week 2', spending: 823 },
  { week: 'Week 3', spending: 592 },
  { week: 'Week 4', spending: 745 },
];