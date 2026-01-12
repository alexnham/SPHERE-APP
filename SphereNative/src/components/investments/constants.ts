import { investmentAccounts } from '../../lib/mockData';

// Calculate portfolio totals
export const portfolioValue = investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);
export const totalContributions = investmentAccounts.reduce((sum, acc) => sum + acc.contributions, 0);
export const totalGain = portfolioValue - totalContributions;
export const gainPercent = (totalGain / totalContributions) * 100;
export const isPositive = totalGain >= 0;

// Generate 12-month performance data
export const generatePerformanceData = () => {
  const data: number[] = [];
  let value = totalContributions;
  for (let i = 12; i >= 0; i--) {
    const monthlyChange = (Math.random() * 0.06 - 0.02) + 0.015;
    value = value * (1 + monthlyChange);
    data.push(Math.round(value));
  }
  data[data.length - 1] = Math.round(portfolioValue);
  return data;
};

export const performanceData = generatePerformanceData();

// Asset allocation data
export const allocations = [
  { name: 'US Stocks', value: 55, color: '#10b981' },
  { name: 'International', value: 20, color: '#14b8a6' },
  { name: 'Bonds', value: 15, color: '#6b7280' },
  { name: 'Real Estate', value: 10, color: '#f59e0b' },
];

// Projection calculation
export const calculateProjection = (years: number, monthlyContribution: number = 500) => {
  const annualReturn = 0.07;
  const monthlyReturn = annualReturn / 12;
  const months = years * 12;

  let futureValue = portfolioValue;
  for (let i = 0; i < months; i++) {
    futureValue = futureValue * (1 + monthlyReturn) + monthlyContribution;
  }
  return futureValue;
};

export const fiveYearProjection = calculateProjection(5);
export const tenYearProjection = calculateProjection(10);