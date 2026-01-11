import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mockDailySpend, mockTransactions } from '@/lib/mockData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';

const formatCurrency = (amount: number) => {
  if (amount === 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getSpendIntensity = (amount: number): string => {
  if (amount === 0) return 'bg-transparent';
  if (amount < 30) return 'bg-success-muted';
  if (amount < 80) return 'bg-primary-muted';
  if (amount < 150) return 'bg-warning-muted';
  return 'bg-destructive-muted';
};

export const SpendingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getSpendForDay = (date: Date) => {
    const spend = mockDailySpend.find(d => isSameDay(d.date, date));
    return spend?.totalSpend || 0;
  };

  const getTransactionsForDay = (date: Date) => {
    return mockTransactions.filter(t => isSameDay(new Date(t.date), date) && t.amount < 0);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const dayTransactions = selectedDate ? getTransactionsForDay(selectedDate) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="sphere-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground font-display">Spending Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-muted-foreground text-center py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map(i => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        {daysInMonth.map(day => {
          const spend = getSpendForDay(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isFuture = day > new Date();
          
          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => !isFuture && setSelectedDate(isSelected ? null : day)}
              whileHover={{ scale: isFuture ? 1 : 1.05 }}
              whileTap={{ scale: isFuture ? 1 : 0.95 }}
              disabled={isFuture}
              className={`
                aspect-square rounded-lg p-1 flex flex-col items-center justify-center
                transition-all duration-200 relative
                ${isFuture ? 'opacity-30 cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-primary/20'}
                ${isSelected ? 'ring-2 ring-primary bg-primary-muted' : getSpendIntensity(spend)}
                ${isToday(day) ? 'ring-2 ring-primary/50' : ''}
              `}
            >
              <span className={`text-xs font-medium ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                {format(day, 'd')}
              </span>
              {spend > 0 && !isFuture && (
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {formatCurrency(spend)}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h4>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 rounded hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {dayTransactions.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dayTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
                    <div>
                      <div className="text-sm font-medium text-foreground">{tx.merchant}</div>
                      <div className="text-xs text-muted-foreground">{tx.category}</div>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No spending recorded this day</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-success-muted" />
            <span>Light</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary-muted" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-warning-muted" />
            <span>Higher</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-destructive-muted" />
            <span>Peak</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpendingCalendar;
