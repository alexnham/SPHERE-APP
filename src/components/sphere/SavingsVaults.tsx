import { useState } from 'react';
import { motion } from 'framer-motion';
import { Umbrella, Info, Sparkles, Settings2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const SavingsVaults = () => {
  const [balance, setBalance] = useState(485);
  const [roundUpEnabled, setRoundUpEnabled] = useState(true);
  const [smartRoundUp, setSmartRoundUp] = useState(true);
  const [roundUpMultiplier, setRoundUpMultiplier] = useState([1]);

  const handleQuickTransfer = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="sphere-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center">
            <Umbrella className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Rainy Day Buffer</span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[250px] text-sm" side="bottom" align="start">
              <p>
                Your emergency cushion for unexpected expenses. This buffer protects your budget when life throws surprises your way.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <RoundUpSettings
          roundUpEnabled={roundUpEnabled}
          setRoundUpEnabled={setRoundUpEnabled}
          smartRoundUp={smartRoundUp}
          setSmartRoundUp={setSmartRoundUp}
          roundUpMultiplier={roundUpMultiplier}
          setRoundUpMultiplier={setRoundUpMultiplier}
        />
      </div>

      <div className="mb-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-3xl font-bold text-foreground tracking-tight"
        >
          {formatCurrency(balance)}
        </motion.div>
      </div>

      {/* Quick add buttons */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">Quick add:</span>
        {[5, 10, 20].map(amount => (
          <button
            key={amount}
            onClick={() => handleQuickTransfer(amount)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            +${amount}
          </button>
        ))}
      </div>

      {/* Round-up status */}
      {roundUpEnabled && (
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-gentle" />
            <span className="text-xs font-medium">
              Round-ups {smartRoundUp ? '(smart)' : ''} active
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-success cursor-help">
                <Sparkles className="w-3 h-3" />
                <span className="text-xs font-medium">+$12</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Round-ups added this week</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </motion.div>
  );
};

interface RoundUpSettingsProps {
  roundUpEnabled: boolean;
  setRoundUpEnabled: (value: boolean) => void;
  smartRoundUp: boolean;
  setSmartRoundUp: (value: boolean) => void;
  roundUpMultiplier: number[];
  setRoundUpMultiplier: (value: number[]) => void;
}

const RoundUpSettings = ({
  roundUpEnabled,
  setRoundUpEnabled,
  smartRoundUp,
  setSmartRoundUp,
  roundUpMultiplier,
  setRoundUpMultiplier,
}: RoundUpSettingsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Round-Up Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Enable round-ups */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enable Round-Ups</p>
              <p className="text-sm text-muted-foreground">
                Automatically round up purchases to save
              </p>
            </div>
            <Switch
              checked={roundUpEnabled}
              onCheckedChange={setRoundUpEnabled}
            />
          </div>

          {roundUpEnabled && (
            <>
              {/* Smart round-up */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Smart Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Only round up on stable spending days
                  </p>
                </div>
                <Switch
                  checked={smartRoundUp}
                  onCheckedChange={setSmartRoundUp}
                />
              </div>

              {/* Multiplier */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-foreground">Round-Up Multiplier</p>
                  <span className="text-sm text-primary font-medium">{roundUpMultiplier[0]}x</span>
                </div>
                <Slider
                  value={roundUpMultiplier}
                  onValueChange={setRoundUpMultiplier}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1x (normal)</span>
                  <span>5x (boost)</span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavingsVaults;
