import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RegretToBufferProps {
  transactionMerchant?: string;
  transactionAmount?: number;
  onDismiss: () => void;
  onTransfer: (amount: number) => void;
}

export const RegretToBuffer = ({ 
  transactionMerchant = "that purchase",
  transactionAmount = 45.00,
  onDismiss,
  onTransfer 
}: RegretToBufferProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [transferred, setTransferred] = useState(false);

  const suggestedAmounts = [5, 10, 20];

  const handleTransfer = () => {
    if (selectedAmount) {
      setTransferred(true);
      setTimeout(() => {
        onTransfer(selectedAmount);
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="sphere-card p-5 bg-gradient-to-br from-card to-primary-muted/20 border-primary/20"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">A moment to reflect</span>
          </div>
          <button 
            onClick={onDismiss}
            className="p-1 rounded hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {!transferred ? (
          <>
            <p className="text-foreground mb-4">
              Feeling a bit uncertain about {transactionMerchant}? 
              <span className="text-muted-foreground"> Setting aside a small amount can help close this out.</span>
            </p>

            <div className="flex items-center gap-2 mb-4">
              {suggestedAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`
                    flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${selectedAmount === amount
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="flex-1"
              >
                Not now
              </Button>
              <Button
                size="sm"
                onClick={handleTransfer}
                disabled={!selectedAmount}
                className="flex-1 gap-2"
              >
                Set aside
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3"
            >
              <Sparkles className="w-6 h-6 text-success" />
            </motion.div>
            <p className="font-medium text-foreground">
              ${selectedAmount} moved to your buffer
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This moment is closed. You're doing great.
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default RegretToBuffer;
