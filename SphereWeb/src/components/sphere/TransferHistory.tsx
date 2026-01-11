import { motion } from 'framer-motion';
import { ArrowRight, Clock, CheckCircle2, XCircle, Loader2, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Bank logo component with brand colors
const BankLogo = ({ institutionName, size = 'sm' }: { institutionName: string; size?: 'sm' | 'md' }) => {
  const name = institutionName.toLowerCase();
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-[8px]' : 'w-8 h-8 text-xs';
  
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

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
};

export const TransferHistory = () => {
  const { user } = useAuth();

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          from_account:linked_accounts!transfers_from_account_id_fkey(institution_name, account_name),
          to_account:linked_accounts!transfers_to_account_id_fkey(institution_name, account_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sphere-card p-6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="sphere-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground font-display">Transfer History</h3>
      </div>

      {transfers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No transfers yet</p>
          <p className="text-sm">Your inter-bank transfers will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((transfer, index) => {
            const status = statusConfig[transfer.status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={transfer.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BankLogo institutionName={transfer.from_account?.institution_name || ''} />
                    <span className="font-medium">{transfer.from_account?.institution_name}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <BankLogo institutionName={transfer.to_account?.institution_name || ''} />
                    <span className="font-medium">{transfer.to_account?.institution_name}</span>
                  </div>
                  <span className="font-bold text-foreground font-display">
                    {formatCurrency(Number(transfer.amount))}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {format(new Date(transfer.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                    <StatusIcon className={`w-3 h-3 ${transfer.status === 'processing' ? 'animate-spin' : ''}`} />
                    {status.label}
                  </span>
                </div>

                {transfer.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    "{transfer.notes}"
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default TransferHistory;
