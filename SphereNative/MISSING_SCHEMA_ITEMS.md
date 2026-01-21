# Missing Schema Items for Plaid Integration

## Critical Missing Tables

### 1. **Savings Vaults** ❌
The app has a savings vaults feature but your schema doesn't include it.

```sql
-- Savings vaults table
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

ALTER TABLE savings_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vaults"
    ON savings_vaults FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own vaults"
    ON savings_vaults FOR ALL
    USING (user_id = auth.uid());

CREATE INDEX idx_savings_vaults_user_id ON savings_vaults(user_id);
```

### 2. **Liabilities/Debts** ❌
The app tracks credit cards, loans, mortgages, etc. but there's no debts table.

```sql
-- Liabilities/Debts table
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

ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own liabilities"
    ON liabilities FOR ALL
    USING (user_id = auth.uid());

CREATE INDEX idx_liabilities_user_id ON liabilities(user_id);
CREATE INDEX idx_liabilities_status ON liabilities(status);
CREATE INDEX idx_liabilities_due_date ON liabilities(due_date);
```

### 3. **Transfers** ❌
The app has inter-bank transfer functionality but no transfers table.

```sql
-- Transfers table
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transfers"
    ON transfers FOR ALL
    USING (user_id = auth.uid());

CREATE INDEX idx_transfers_user_id ON transfers(user_id);
CREATE INDEX idx_transfers_created_at ON transfers(created_at DESC);
CREATE INDEX idx_transfers_status ON transfers(status);
```

## Missing Fields/Features

### 4. **User Profile Preferences** ⚠️
Your schema has `user_profiles` but the existing app has `profiles` with Sphere-specific preferences. You should add:

```sql
-- Add to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS default_buffer_amount NUMERIC(12, 2) DEFAULT 200;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS round_up_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS round_up_multiplier INTEGER DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS smart_round_up BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS default_vault_id UUID REFERENCES savings_vaults(id);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS balance_visibility_hidden BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
```

### 5. **Accounts Table Enhancements** ⚠️
- Your schema uses `accounts` but the existing app uses `linked_accounts` - consider consistency
- Missing `mask` field (last 4 digits)
- Missing `icon` field (emoji/icon representation)
- Missing `last_synced_at` timestamp
- Should reference `plaid_items.id` instead of just storing `plaid_account_id`

```sql
-- Add missing fields to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS mask TEXT; -- Last 4 digits
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🏦';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
```

### 6. **Transactions Table Enhancements** ⚠️
- Missing `subcategory` field (you have `category` array but also need subcategory)
- The `recurring_stream_id` should reference your `recurring_transactions` table

```sql
-- Ensure recurring_stream_id can reference recurring_transactions
ALTER TABLE transactions 
    ADD COLUMN IF NOT EXISTS subcategory TEXT;
```

### 7. **Investment Accounts** ⚠️
Investment accounts might need additional fields if tracked separately:
- `contributions` (total contributed)
- `gain` (realized/unrealized gain)
- `gain_percent` (percentage gain)
- Consider if investments should be in a separate table or just accounts with type='investment'

## Table Naming Consistency

### 8. **Consider Renaming** ⚠️
- Your schema uses `accounts` but existing migrations use `linked_accounts`
- Your schema uses `user_profiles` but existing migrations use `profiles`
- Consider using consistent naming: either rename your tables OR update the app to use new names

## Missing Functions/Triggers

### 9. **Default Vaults Creation** ❌
When a new user is created, create default savings vaults:

```sql
-- Function to create default vaults
CREATE OR REPLACE FUNCTION create_default_vaults()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO savings_vaults (user_id, name, icon, balance, color, description)
    VALUES
        (NEW.id, 'Rainy Day', '☔', 0, 'from-blue-400 to-blue-500', 'For unexpected moments'),
        (NEW.id, 'Bill Cushion', '📋', 0, 'from-emerald-400 to-emerald-500', 'Extra padding for bills'),
        (NEW.id, 'Weekend Buffer', '☕', 0, 'from-amber-400 to-amber-500', 'Guilt-free weekend spending');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (modify your existing handle_new_user function to also create vaults)
-- Or add after user_profiles is created
CREATE TRIGGER on_user_profile_created_create_vaults
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_vaults();
```

## Additional Recommendations

### 10. **Real-time Subscriptions** 📡
Consider enabling realtime for key tables:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
```

### 11. **Index for Recurring Transactions Lookup** 📊
Your recurring_transactions table should index by user_id and next_expected_date:

```sql
CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(user_id, next_expected_date);
```

## Summary Checklist

- [ ] Add `savings_vaults` table
- [ ] Add `liabilities` table  
- [ ] Add `transfers` table
- [ ] Add profile preference fields to `user_profiles`
- [ ] Add missing fields to `accounts` table (mask, icon, last_synced_at)
- [ ] Ensure `transactions.recurring_stream_id` references `recurring_transactions`
- [ ] Create function/trigger for default vaults
- [ ] Consider table naming consistency (`linked_accounts` vs `accounts`, `profiles` vs `user_profiles`)
- [ ] Add realtime subscriptions for key tables
- [ ] Add indexes for performance

## Migration Strategy

1. **Phase 1**: Add missing tables (savings_vaults, liabilities, transfers)
2. **Phase 2**: Add missing fields to existing tables
3. **Phase 3**: Migrate data from old `linked_accounts` to new `accounts` table (if renaming)
4. **Phase 4**: Update application code to use new schema
