-- Create profiles table with extended preferences
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  -- Sphere-specific preferences
  default_buffer_amount NUMERIC DEFAULT 200,
  round_up_enabled BOOLEAN DEFAULT true,
  round_up_multiplier INTEGER DEFAULT 1,
  smart_round_up BOOLEAN DEFAULT true,
  default_vault_id TEXT DEFAULT 'rainy-day',
  balance_visibility_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Savings vaults table
CREATE TABLE public.savings_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💰',
  balance NUMERIC DEFAULT 0 NOT NULL,
  color TEXT DEFAULT 'from-blue-400 to-blue-500',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.savings_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vaults"
  ON public.savings_vaults FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vaults"
  ON public.savings_vaults FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaults"
  ON public.savings_vaults FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaults"
  ON public.savings_vaults FOR DELETE
  USING (auth.uid() = user_id);

-- Linked accounts table (for Plaid-connected accounts)
CREATE TABLE public.linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plaid_item_id TEXT,
  plaid_a_t TEXT,
  institution_name TEXT NOT NULL,
  institution_id TEXT,
  account_type TEXT NOT NULL,
  account_subtype TEXT,
  account_name TEXT NOT NULL,
  mask TEXT,
  available_balance NUMERIC,
  current_balance NUMERIC,
  currency TEXT DEFAULT 'USD',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
  ON public.linked_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON public.linked_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.linked_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.linked_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.linked_accounts(id) ON DELETE SET NULL,
  plaid_transaction_id TEXT,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  merchant_name TEXT,
  category TEXT,
  subcategory TEXT,
  pending BOOLEAN DEFAULT false,
  payment_channel TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create default vaults for new users
CREATE OR REPLACE FUNCTION public.create_default_vaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.savings_vaults (user_id, name, icon, balance, color, description)
  VALUES
    (NEW.id, 'Rainy Day', '☔', 0, 'from-blue-400 to-blue-500', 'For unexpected moments'),
    (NEW.id, 'Bill Cushion', '📋', 0, 'from-emerald-400 to-emerald-500', 'Extra padding for bills'),
    (NEW.id, 'Weekend Buffer', '☕', 0, 'from-amber-400 to-amber-500', 'Guilt-free weekend spending');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_vaults
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_vaults();