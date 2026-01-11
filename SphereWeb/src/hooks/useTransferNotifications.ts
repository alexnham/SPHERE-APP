import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const useTransferNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('transfer-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transfers',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newStatus = payload.new.status;
          const oldStatus = payload.old.status;
          const amount = Number(payload.new.amount);

          // Only notify on meaningful status changes
          if (newStatus === oldStatus) return;

          // Invalidate queries to refresh UI
          queryClient.invalidateQueries({ queryKey: ['transfers'] });
          queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });

          // Show appropriate toast based on new status
          if (newStatus === 'completed') {
            toast({
              title: '✅ Transfer Completed',
              description: `Your ${formatCurrency(amount)} transfer has been completed successfully.`,
            });
          } else if (newStatus === 'failed') {
            toast({
              title: '❌ Transfer Failed',
              description: `Your ${formatCurrency(amount)} transfer could not be completed.`,
              variant: 'destructive',
            });
          } else if (newStatus === 'processing' && oldStatus === 'pending') {
            toast({
              title: '🔄 Transfer Processing',
              description: `Your ${formatCurrency(amount)} transfer is now being processed.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, queryClient]);
};

export default useTransferNotifications;
