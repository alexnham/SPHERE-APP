-- Create transfers table for inter-bank transfer history
CREATE TABLE public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_account_id UUID NOT NULL REFERENCES public.linked_accounts(id) ON DELETE CASCADE,
  to_account_id UUID NOT NULL REFERENCES public.linked_accounts(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT different_accounts CHECK (from_account_id != to_account_id),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Enable RLS
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transfers
CREATE POLICY "Users can view their own transfers"
ON public.transfers FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own transfers
CREATE POLICY "Users can create their own transfers"
ON public.transfers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own transfers (for status changes)
CREATE POLICY "Users can update their own transfers"
ON public.transfers FOR UPDATE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_transfers_user_id ON public.transfers(user_id);
CREATE INDEX idx_transfers_created_at ON public.transfers(created_at DESC);