import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDownUp, Loader2, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { mockAccounts } from '@/lib/mockData';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Bank logo component with brand colors
const BankLogo = ({ institutionName, size = 'md' }: { institutionName: string; size?: 'sm' | 'md' }) => {
  const name = institutionName.toLowerCase();
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  
  const getBankStyle = () => {
    if (name.includes('td')) {
      return { bg: 'bg-[#34A853]', text: 'text-white', label: 'TD' };
    }
    if (name.includes('rbc')) {
      return { bg: 'bg-[#0051A5]', text: 'text-[#FECC00]', label: 'RBC' };
    }
    if (name.includes('bmo')) {
      return { bg: 'bg-[#0075BE]', text: 'text-white', label: 'BMO' };
    }
    if (name.includes('scotia')) {
      return { bg: 'bg-[#EC111A]', text: 'text-white', label: 'BNS' };
    }
    if (name.includes('cibc')) {
      return { bg: 'bg-[#C41F3E]', text: 'text-white', label: 'CIBC' };
    }
    if (name.includes('chase')) {
      return { bg: 'bg-[#117ACA]', text: 'text-white', label: 'CH' };
    }
    if (name.includes('fidelity')) {
      return { bg: 'bg-[#4AA74A]', text: 'text-white', label: 'FID' };
    }
    return { bg: 'bg-muted', text: 'text-foreground', label: institutionName.slice(0, 2).toUpperCase() };
  };

  const style = getBankStyle();

  return (
    <div className={`${sizeClasses} ${style.bg} ${style.text} rounded-full flex items-center justify-center font-bold shrink-0`}>
      {style.label}
    </div>
  );
};

// Convert mock accounts to linked account format
const mockLinkedAccounts = mockAccounts
  .filter(acc => acc.type === 'checking' || acc.type === 'savings')
  .map(acc => ({
    id: acc.id,
    institution_name: acc.institution,
    account_name: acc.name,
    account_type: 'depository',
    available_balance: acc.availableBalance,
    current_balance: acc.currentBalance,
  }));

interface TransferMoneyDialogProps {
  trigger?: React.ReactNode;
}

export const TransferMoneyDialog = ({ trigger }: TransferMoneyDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isMockTransferring, setIsMockTransferring] = useState(false);

  // Fetch linked accounts from database
  const { data: dbAccounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['linked-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('linked_accounts')
        .select('*')
        .order('institution_name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Use mock accounts when not logged in or no DB accounts
  const linkedAccounts = user && dbAccounts.length > 0 ? dbAccounts : mockLinkedAccounts;
  const isUsingMockData = !user || dbAccounts.length === 0;

  // Filter accounts that can transfer (checking and savings only)
  const transferableAccounts = linkedAccounts.filter(
    (acc) => acc.account_type === 'depository'
  );

  const fromAccount = transferableAccounts.find((acc) => acc.id === fromAccountId);
  const toAccount = transferableAccounts.find((acc) => acc.id === toAccountId);

  const availableToAccounts = transferableAccounts.filter(
    (acc) => acc.id !== fromAccountId
  );

  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = parsedAmount > 0 && fromAccount && parsedAmount <= (fromAccount.available_balance || 0);
  const canTransfer = fromAccountId && toAccountId && isValidAmount;

  // Calculate new balances after transfer
  const newFromBalance = fromAccount ? (fromAccount.available_balance || 0) - parsedAmount : 0;
  const newToBalance = toAccount ? (toAccount.current_balance || 0) + parsedAmount : 0;

  // Create transfer mutation
  const createTransfer = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('transfers')
        .insert({
          user_id: user.id,
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
          amount: parsedAmount,
          notes: notes || null,
          status: 'processing',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      
      toast({
        title: 'Transfer Initiated',
        description: `${formatCurrency(parsedAmount)} transfer from ${fromAccount?.institution_name} to ${toAccount?.institution_name} is being processed.`,
      });
      
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Transfer Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSwapAccounts = () => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  const handleTransfer = async () => {
    if (!canTransfer) return;
    
    if (isUsingMockData) {
      // Mock transfer for demo
      setIsMockTransferring(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Transfer Initiated (Demo)',
        description: `${formatCurrency(parsedAmount)} transfer from ${fromAccount?.institution_name} to ${toAccount?.institution_name} is being processed.`,
      });
      
      setIsMockTransferring(false);
      resetForm();
      setOpen(false);
    } else {
      createTransfer.mutate();
    }
  };

  const resetForm = () => {
    setFromAccountId('');
    setToAccountId('');
    setAmount('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowDownUp className="w-4 h-4" />
            Transfer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Inter-Bank Transfer
          </DialogTitle>
        </DialogHeader>

        {isLoadingAccounts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : transferableAccounts.length < 2 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>You need at least 2 bank accounts linked to make transfers.</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* From Account */}
            <div className="space-y-2">
              <Label>From Bank</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {transferableAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <BankLogo institutionName={account.institution_name} size="sm" />
                        <span>{account.institution_name}</span>
                        <span className="text-muted-foreground">
                          ({account.account_name})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromAccount && (
                <p className="text-xs text-muted-foreground">
                  Available: {formatCurrency(fromAccount.available_balance || 0)}
                </p>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSwapAccounts}
                disabled={!fromAccountId || !toAccountId}
                className="rounded-full h-10 w-10 bg-secondary hover:bg-secondary/80"
              >
                <ArrowDownUp className="w-4 h-4" />
              </Button>
            </div>

            {/* To Account */}
            <div className="space-y-2">
              <Label>To Bank</Label>
              <Select 
                value={toAccountId} 
                onValueChange={setToAccountId}
                disabled={!fromAccountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {availableToAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <BankLogo institutionName={account.institution_name} size="sm" />
                        <span>{account.institution_name}</span>
                        <span className="text-muted-foreground">
                          ({account.account_name})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
              {fromAccount && parsedAmount > (fromAccount.available_balance || 0) && (
                <p className="text-xs text-destructive">
                  Insufficient funds. Maximum: {formatCurrency(fromAccount.available_balance || 0)}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="e.g., Bill payment, savings transfer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none h-20"
              />
            </div>

            {/* Preview with Balance Updates */}
            <AnimatePresence>
              {canTransfer && fromAccount && toAccount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-secondary/50 p-4 space-y-4"
                >
                  <p className="text-sm font-medium text-foreground">Transfer Preview</p>
                  
                  {/* Transfer Amount */}
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary font-display">
                      {formatCurrency(parsedAmount)}
                    </span>
                  </div>

                  {/* Balance Updates */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* From Account */}
                    <div className="p-3 rounded-lg bg-background/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <BankLogo institutionName={fromAccount.institution_name} size="sm" />
                        <span className="text-xs font-medium truncate">{fromAccount.institution_name}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Current</span>
                          <span>{formatCurrency(fromAccount.available_balance || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">After</span>
                          <span className="text-destructive font-medium">{formatCurrency(newFromBalance)}</span>
                        </div>
                      </div>
                    </div>

                    {/* To Account */}
                    <div className="p-3 rounded-lg bg-background/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <BankLogo institutionName={toAccount.institution_name} size="sm" />
                        <span className="text-xs font-medium truncate">{toAccount.institution_name}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Current</span>
                          <span>{formatCurrency(toAccount.current_balance || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">After</span>
                          <span className="text-success font-medium">{formatCurrency(newToBalance)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Transfers typically complete within 1-3 business days
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              onClick={handleTransfer}
              disabled={!canTransfer || createTransfer.isPending || isMockTransferring}
              className="w-full gap-2"
            >
              {(createTransfer.isPending || isMockTransferring) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Transfer {parsedAmount > 0 ? formatCurrency(parsedAmount) : 'Money'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransferMoneyDialog;
