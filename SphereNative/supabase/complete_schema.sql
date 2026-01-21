-- Complete Supabase Schema for Plaid Integration with All Sphere Features
-- Run this in your Supabase SQL Editor
-- This includes all tables, policies, indexes, triggers, and functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (in correct order due to dependencies)
-- Note: Using IF EXISTS to avoid errors if tables don't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_user_profile_created_create_vaults ON user_profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_default_vaults() CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS liabilities CASCADE;
DROP TABLE IF EXISTS savings_vaults CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS recurring_transactions CASCADE;
DROP TABLE IF EXISTS plaid_items CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;

-- ============================================================================
-- INSTITUTIONS TABLE
-- ============================================================================
CREATE TABLE institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country_codes TEXT[],
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    onboarded BOOLEAN DEFAULT FALSE,
    -- Sphere-specific preferences
    default_buffer_amount NUMERIC(12, 2) DEFAULT 200,
    round_up_enabled BOOLEAN DEFAULT true,
    round_up_multiplier INTEGER DEFAULT 1,
    smart_round_up BOOLEAN DEFAULT true,
    default_vault_id UUID, -- Will be set after vaults are created
    balance_visibility_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLAID ITEMS TABLE (stores access tokens)
-- ============================================================================
CREATE TABLE plaid_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plaid_item_id TEXT UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    institution_id TEXT REFERENCES institutions(id),
    institution_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACCOUNTS TABLE (bank accounts from Plaid)
-- ============================================================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plaid_account_id TEXT UNIQUE NOT NULL,
    item_id UUID NOT NULL REFERENCES plaid_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    official_name TEXT,
    type TEXT NOT NULL,
    subtype TEXT,
    current_balance DECIMAL(12, 2),
    available_balance DECIMAL(12, 2),
    currency TEXT DEFAULT 'CAD',
    mask TEXT, -- Last 4 digits
    icon TEXT DEFAULT '🏦',
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RECURRING TRANSACTIONS TABLE (created before transactions due to FK dependency)
-- ============================================================================
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stream_id TEXT UNIQUE NOT NULL,
    description TEXT,
    merchant_name TEXT,
    category TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    frequency TEXT, -- WEEKLY, MONTHLY, etc.
    average_amount DECIMAL(12, 2),
    last_amount DECIMAL(12, 2),
    last_date DATE,
    first_date DATE,
    next_expected_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plaid_transaction_id TEXT UNIQUE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    merchant_name TEXT,
    primary_category TEXT,
    name TEXT,
    category TEXT[],
    subcategory TEXT,
    pending BOOLEAN DEFAULT FALSE,
    payment_channel TEXT,
    recurring_stream_id TEXT REFERENCES recurring_transactions(stream_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LIABILITIES/DEBTS TABLE
-- ============================================================================
CREATE TABLE liabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plaid_account_id TEXT UNIQUE, -- If linked via Plaid
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL, -- Reference to account if it exists
    name TEXT NOT NULL,
    lender TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit_card', 'loan', 'bnpl', 'mortgage', 'student_loan', 'auto_loan', 'personal_loan')),
    current_balance NUMERIC(12, 2) NOT NULL,
    credit_limit NUMERIC(12, 2), -- For credit cards
    statement_balance NUMERIC(12, 2),
    minimum_payment NUMERIC(12, 2),
    due_date DATE,
    apr NUMERIC(5, 2), -- Annual percentage rate
    late_fee NUMERIC(12, 2),
    status TEXT DEFAULT 'current' CHECK (status IN ('current', 'due_soon', 'overdue')),
    icon TEXT DEFAULT '💳',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- SAVINGS VAULTS TABLE
-- ============================================================================
CREATE TABLE savings_vaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '💰',
    balance NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    color TEXT DEFAULT 'from-blue-400 to-blue-500',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TRANSFERS TABLE (inter-bank transfers)
-- ============================================================================
CREATE TABLE transfers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT different_accounts CHECK (from_account_id != to_account_id),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- ============================================================================
-- BUDGETS TABLE
-- ============================================================================
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    period TEXT DEFAULT 'monthly', -- monthly, weekly, yearly
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_plaid_items_user_id ON plaid_items(user_id);
CREATE INDEX idx_plaid_items_status ON plaid_items(status);
CREATE INDEX idx_accounts_item_id ON accounts(item_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_recurring_stream_id ON transactions(recurring_stream_id);
CREATE INDEX idx_transactions_pending ON transactions(pending);
CREATE INDEX idx_liabilities_user_id ON liabilities(user_id);
CREATE INDEX idx_liabilities_status ON liabilities(status);
CREATE INDEX idx_liabilities_due_date ON liabilities(due_date);
CREATE INDEX idx_liabilities_type ON liabilities(type);
CREATE INDEX idx_savings_vaults_user_id ON savings_vaults(user_id);
CREATE INDEX idx_transfers_user_id ON transfers(user_id);
CREATE INDEX idx_transfers_created_at ON transfers(created_at DESC);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(user_id, next_expected_date);
CREATE INDEX idx_recurring_transactions_is_active ON recurring_transactions(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - ENABLE
-- ============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - USER_PROFILES
-- ============================================================================
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- ============================================================================
-- RLS POLICIES - PLAID_ITEMS
-- ============================================================================
CREATE POLICY "Users can view their own plaid items"
    ON plaid_items FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own plaid items"
    ON plaid_items FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own plaid items"
    ON plaid_items FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own plaid items"
    ON plaid_items FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - ACCOUNTS
-- ============================================================================
CREATE POLICY "Users can view their own accounts"
    ON accounts FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own accounts"
    ON accounts FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own accounts"
    ON accounts FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own accounts"
    ON accounts FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - TRANSACTIONS
-- ============================================================================
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - LIABILITIES
-- ============================================================================
CREATE POLICY "Users can manage their own liabilities"
    ON liabilities FOR ALL
    USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - SAVINGS_VAULTS
-- ============================================================================
CREATE POLICY "Users can view their own vaults"
    ON savings_vaults FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own vaults"
    ON savings_vaults FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own vaults"
    ON savings_vaults FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own vaults"
    ON savings_vaults FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - TRANSFERS
-- ============================================================================
CREATE POLICY "Users can view their own transfers"
    ON transfers FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transfers"
    ON transfers FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transfers"
    ON transfers FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - BUDGETS
-- ============================================================================
CREATE POLICY "Users can manage their own budgets"
    ON budgets FOR ALL
    USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - RECURRING_TRANSACTIONS
-- ============================================================================
CREATE POLICY "Users can view their own recurring transactions"
    ON recurring_transactions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own recurring transactions"
    ON recurring_transactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own recurring transactions"
    ON recurring_transactions FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create default savings vaults for new users
CREATE OR REPLACE FUNCTION create_default_vaults()
RETURNS TRIGGER AS $$
DECLARE
    rainy_day_id UUID;
BEGIN
    -- Create default vaults
    INSERT INTO savings_vaults (user_id, name, icon, balance, color, description)
    VALUES
        (NEW.id, 'Rainy Day', '☔', 0, 'from-blue-400 to-blue-500', 'For unexpected moments')
    RETURNING id INTO rainy_day_id;
    
    INSERT INTO savings_vaults (user_id, name, icon, balance, color, description)
    VALUES
        (NEW.id, 'Bill Cushion', '📋', 0, 'from-emerald-400 to-emerald-500', 'Extra padding for bills'),
        (NEW.id, 'Weekend Buffer', '☕', 0, 'from-amber-400 to-amber-500', 'Guilt-free weekend spending');
    
    -- Set default vault ID in user profile (use NEW directly to avoid potential timing issues)
    -- Note: Since trigger fires AFTER INSERT, we can safely update
    UPDATE user_profiles 
    SET default_vault_id = rainy_day_id 
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger to create default vaults when user profile is created
CREATE TRIGGER on_user_profile_created_create_vaults
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_vaults();

-- Triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plaid_items_updated_at
    BEFORE UPDATE ON plaid_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_liabilities_updated_at
    BEFORE UPDATE ON liabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_vaults_updated_at
    BEFORE UPDATE ON savings_vaults
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at
    BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for key tables (if using Supabase Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE savings_vaults;
ALTER PUBLICATION supabase_realtime ADD TABLE liabilities;

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Ensure default_vault_id references savings_vaults
ALTER TABLE user_profiles
    ADD CONSTRAINT fk_default_vault
    FOREIGN KEY (default_vault_id) 
    REFERENCES savings_vaults(id) 
    ON DELETE SET NULL;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Schema migration completed successfully!';
    RAISE NOTICE 'All tables, indexes, policies, triggers, and functions have been created.';
END $$;
