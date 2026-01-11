import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingDown, Calendar, DollarSign, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DebtPayoffCalculatorProps {
  balance: number;
  apr: number;
  minPayment: number;
  lenderName: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCurrencyDetailed = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Calculate months to payoff and total interest
const calculatePayoff = (balance: number, apr: number, monthlyPayment: number) => {
  if (monthlyPayment <= 0) return { months: Infinity, totalInterest: Infinity };

  // If payment covers full balance, it's 1 month with first month's interest
  if (monthlyPayment >= balance) {
    const monthlyRate = apr / 100 / 12;
    const firstMonthInterest = balance * monthlyRate;
    return { months: 1, totalInterest: firstMonthInterest };
  }

  const monthlyRate = apr / 100 / 12;
  let remaining = balance;
  let months = 0;
  let totalInterest = 0;
  const maxMonths = 600; // 50 years max to prevent infinite loops

  // Check if payment covers at least the interest
  const minRequired = remaining * monthlyRate;
  if (monthlyPayment <= minRequired) {
    return { months: Infinity, totalInterest: Infinity };
  }

  while (remaining > 0 && months < maxMonths) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining = remaining + interest - monthlyPayment;
    months++;

    if (remaining < 0) remaining = 0;
  }

  return { months, totalInterest };
};

const formatTimespan = (months: number) => {
  if (months === Infinity) return "Never";
  if (months < 1) return "Less than 1 month";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
  }
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
  return `${years}y ${remainingMonths}m`;
};

export const DebtPayoffCalculator = ({ balance, apr, minPayment, lenderName }: DebtPayoffCalculatorProps) => {
  const [customPayment, setCustomPayment] = useState(minPayment * 2);

  // Calculate scenarios
  const scenarios = useMemo(() => {
    const minResult = calculatePayoff(balance, apr, minPayment);
    const doubleResult = calculatePayoff(balance, apr, minPayment * 2);
    const customResult = calculatePayoff(balance, apr, customPayment);

    return {
      minimum: { payment: minPayment, ...minResult },
      double: { payment: minPayment * 2, ...doubleResult },
      custom: { payment: customPayment, ...customResult },
    };
  }, [balance, apr, minPayment, customPayment]);

  // Calculate savings compared to minimum payment
  const savingsVsMinimum = scenarios.minimum.totalInterest - scenarios.custom.totalInterest;
  const timeSavedMonths = scenarios.minimum.months - scenarios.custom.months;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Calculator className="w-4 h-4" />
          Payoff Calculator
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1 rounded-full hover:bg-secondary transition-colors">
              <Info className="w-4 h-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-sm" side="top">
            <p className="text-muted-foreground">
              See how different payment amounts affect your payoff timeline. Paying more than the minimum can save you
              significant money on interest!
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {/* Preset Scenarios */}
      <div className="grid grid-cols-2 gap-3">
        {/* Minimum Payment */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Minimum Payment</div>
          <div className="font-semibold text-foreground">{formatCurrency(scenarios.minimum.payment)}/mo</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Payoff:</span>
              <span className="font-medium text-foreground">{formatTimespan(scenarios.minimum.months)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Interest:</span>
              <span className="font-medium text-destructive">{formatCurrency(scenarios.minimum.totalInterest)}</span>
            </div>
          </div>
        </div>

        {/* Double Payment */}
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="text-xs text-muted-foreground mb-1">Double Payment</div>
          <div className="font-semibold text-foreground">{formatCurrency(scenarios.double.payment)}/mo</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Payoff:</span>
              <span className="font-medium text-success">{formatTimespan(scenarios.double.months)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Interest:</span>
              <span className="font-medium text-foreground">{formatCurrency(scenarios.double.totalInterest)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Payment Slider */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Custom Payment</Label>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">$</span>
            <Input
              type="number"
              value={customPayment}
              onChange={(e) => setCustomPayment(Math.max(minPayment, Number(e.target.value)))}
              className="w-24 h-8 text-right"
              min={minPayment}
              step={10}
            />
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
        </div>

        <Slider
          value={[customPayment]}
          onValueChange={([value]) => setCustomPayment(value)}
          min={minPayment}
          max={balance}
          step={5}
          className="w-full"
        />

        <div className="text-xs text-muted-foreground flex justify-between">
          <span>Min: {formatCurrency(minPayment)}</span>
          <span>Max: {formatCurrency(balance)}</span>
        </div>

        {/* Custom Result */}
        <motion.div
          key={customPayment}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-4 pt-3 border-t border-border"
        >
          <div>
            <div className="text-xs text-muted-foreground">Time to payoff</div>
            <div className="text-lg font-bold text-foreground font-display">
              {formatTimespan(scenarios.custom.months)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total interest</div>
            <div className="text-lg font-bold text-foreground font-display">
              {formatCurrency(scenarios.custom.totalInterest)}
            </div>
          </div>
        </motion.div>

        {/* Savings Badge */}
        {savingsVsMinimum > 0 && timeSavedMonths > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success text-xs"
          >
            <TrendingDown className="w-4 h-4" />
            <span>
              Save <strong>{formatCurrencyDetailed(savingsVsMinimum)}</strong> in interest and pay off{" "}
              <strong>{formatTimespan(timeSavedMonths)}</strong> faster!
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DebtPayoffCalculator;
