# Sphere Finance API Documentation

Complete API documentation for the Sphere Finance Plaid integration server.

## Base URL
All endpoints are prefixed with `/api/`

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

---

## Endpoints

### 1. User Profile

#### GET `/api/profile`
Get user profile information including default vault.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "display_name": "John",
  "avatar_url": "https://...",
  "onboarded": true,
  "default_buffer_amount": 200,
  "round_up_enabled": true,
  "round_up_multiplier": 1,
  "smart_round_up": true,
  "default_vault_id": "uuid",
  "balance_visibility_hidden": false,
  "default_vault": { ... }
}
```

#### PATCH `/api/profile`
Update user profile.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "display_name": "John",
  "avatar_url": "https://...",
  "onboarded": true,
  "default_buffer_amount": 200,
  "round_up_enabled": true,
  "round_up_multiplier": 1,
  "smart_round_up": true,
  "default_vault_id": "uuid",
  "balance_visibility_hidden": false
}
```

---

### 2. Plaid Link Token

#### POST `/api/create_link_token`
Create a Plaid Link token for connecting bank accounts.

**Response:**
```json
{
  "link_token": "link-token-...",
  "expiration": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/exchange_public_token`
Exchange Plaid public token for access token and sync initial data.

**Request Body:**
```json
{
  "public_token": "public-token-..."
}
```

**Response:**
```json
{
  "success": true,
  "item_id": "uuid",
  "institution_name": "Bank Name"
}
```

---

### 3. Accounts

#### GET `/api/accounts`
Get all connected bank accounts.

**Response:**
```json
[
  {
    "id": "uuid",
    "plaid_account_id": "account-...",
    "name": "Checking Account",
    "official_name": "Premium Checking",
    "type": "depository",
    "subtype": "checking",
    "current_balance": 5000.00,
    "available_balance": 4950.00,
    "currency": "CAD",
    "mask": "0000",
    "icon": "🏦",
    "plaid_items": {
      "institution_name": "Bank Name",
      "status": "active"
    }
  }
]
```

---

### 4. Transactions

#### GET `/api/transactions`
Get transactions with filtering options.

**Query Parameters:**
- `limit` (default: 100)
- `offset` (default: 0)
- `account_id` - Filter by account
- `category` - Filter by primary category
- `pending` - Filter by pending status (true/false)
- `direction` - Filter by transaction direction: `INFLOW` (income/deposits) or `OUTFLOW` (expenses/purchases)
- `start_date` - Filter by posted date from (YYYY-MM-DD)
- `end_date` - Filter by posted date to (YYYY-MM-DD)
- `authorized_start_date` - Filter by authorized date from (YYYY-MM-DD) - useful for budgeting by actual purchase date
- `authorized_end_date` - Filter by authorized date to (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": "uuid",
    "plaid_transaction_id": "tx-...",
    "amount": 50.00,
    "direction": "OUTFLOW",
    "date": "2024-01-15",
    "authorized_date": "2024-01-14",
    "datetime": "2024-01-15T10:30:00Z",
    "authorized_datetime": "2024-01-14T15:45:00Z",
    "merchant_name": "Coffee Shop",
    "name": "COFFEE SHOP",
    "category": ["Food and Drink", "Restaurants"],
    "primary_category": "GENERAL_MERCHANDISE",
    "subcategory": "COFFEE_SHOPS",
    "pending": false,
    "payment_channel": "in_store",
    "account": {
      "id": "uuid",
      "name": "Checking Account",
      "type": "depository",
      "subtype": "checking"
    },
    "recurring_stream": { ... }
  }
]
```

#### PATCH `/api/transactions`
Update transaction metadata (merchant name, category, etc.).

**Request Body:**
```json
{
  "id": "uuid",
  "merchant_name": "Updated Name",
  "category": ["Food and Drink"],
  "primary_category": "GENERAL_MERCHANDISE",
  "subcategory": "COFFEE_SHOPS",
  "name": "Updated Transaction Name"
}
```

---

### 5. Recurring Transactions / Bills

#### GET `/api/recurring_transactions`
Get recurring transactions (bills).

**Query Parameters:**
- `is_active` - Filter by active status (true/false)
- `frequency` - Filter by frequency (WEEKLY, MONTHLY, etc.)

**Response:**
```json
[
  {
    "id": "uuid",
    "stream_id": "stream-...",
    "description": "Netflix Subscription",
    "merchant_name": "Netflix",
    "category": ["General Services"],
    "is_active": true,
    "frequency": "MONTHLY",
    "average_amount": 15.99,
    "last_amount": 15.99,
    "last_date": "2024-01-01",
    "first_date": "2023-01-01",
    "next_expected_date": "2024-02-01",
    "days_until_next": 15,
    "is_overdue": false
  }
]
```

#### PATCH `/api/recurring_transactions`
Update recurring transaction.

**Request Body:**
```json
{
  "id": "uuid",
  "is_active": false,
  "description": "Updated Description"
}
```

#### GET `/api/bills`
Alias for recurring transactions (backward compatibility).

---

### 6. Savings Vaults

#### GET `/api/vaults`
Get all savings vaults for the user.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Rainy Day",
    "icon": "☔",
    "balance": 5000.00,
    "color": "from-blue-400 to-blue-500",
    "description": "For unexpected moments",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/api/vaults`
Create a new savings vault.

**Request Body:**
```json
{
  "name": "Vacation Fund",
  "icon": "🏖️",
  "balance": 0,
  "color": "from-amber-400 to-amber-500",
  "description": "Dream vacation savings"
}
```

#### PATCH `/api/vaults`
Update a savings vault.

**Request Body:**
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "balance": 1000.00,
  "icon": "💰"
}
```

#### DELETE `/api/vaults?id=<vault_id>`
Delete a savings vault.

---

### 7. Liabilities / Debts

#### GET `/api/liabilities`
Get all liabilities (credit cards, loans, etc.).

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Credit Card",
    "lender": "Bank Name",
    "type": "credit_card",
    "current_balance": 1500.00,
    "credit_limit": 5000.00,
    "statement_balance": 1500.00,
    "minimum_payment": 25.00,
    "due_date": "2024-02-15",
    "apr": 19.99,
    "status": "current",
    "icon": "💳",
    "account": {
      "id": "uuid",
      "name": "Credit Card Account"
    }
  }
]
```

#### POST `/api/liabilities`
Create a new liability.

**Request Body:**
```json
{
  "name": "Credit Card",
  "lender": "Bank Name",
  "type": "credit_card",
  "current_balance": 1500.00,
  "credit_limit": 5000.00,
  "statement_balance": 1500.00,
  "minimum_payment": 25.00,
  "due_date": "2024-02-15",
  "apr": 19.99,
  "account_id": "uuid",
  "icon": "💳"
}
```

**Valid Types:** `credit_card`, `loan`, `bnpl`, `mortgage`, `student_loan`, `auto_loan`, `personal_loan`

#### PATCH `/api/liabilities`
Update a liability.

**Request Body:**
```json
{
  "id": "uuid",
  "current_balance": 1400.00,
  "due_date": "2024-02-20"
}
```

#### DELETE `/api/liabilities?id=<liability_id>`
Delete a liability.

---

### 8. Budgets

#### GET `/api/budgets`
Get all budgets with spent amount calculated.

**Query Parameters:**
- `period` - Filter by period (monthly, weekly, yearly)
- `category` - Filter by category

**Response:**
```json
[
  {
    "id": "uuid",
    "category": "GENERAL_MERCHANDISE",
    "amount": 500.00,
    "period": "monthly",
    "start_date": "2024-01-01",
    "end_date": null,
    "spent": 350.00,
    "remaining": 150.00,
    "percentage_used": 70.0
  }
]
```

#### POST `/api/budgets`
Create a new budget.

**Request Body:**
```json
{
  "category": "GENERAL_MERCHANDISE",
  "amount": 500.00,
  "period": "monthly",
  "start_date": "2024-01-01",
  "end_date": null
}
```

**Valid Periods:** `monthly`, `weekly`, `yearly`

#### PATCH `/api/budgets`
Update a budget.

**Request Body:**
```json
{
  "id": "uuid",
  "amount": 600.00
}
```

#### DELETE `/api/budgets?id=<budget_id>`
Delete a budget.

---

### 9. Transfers

#### GET `/api/transfers`
Get all transfers between accounts.

**Query Parameters:**
- `status` - Filter by status (pending, processing, completed, failed)
- `limit` (default: 50)

**Response:**
```json
[
  {
    "id": "uuid",
    "from_account_id": "uuid",
    "to_account_id": "uuid",
    "amount": 1000.00,
    "status": "completed",
    "notes": "Monthly savings transfer",
    "created_at": "2024-01-15T00:00:00Z",
    "completed_at": "2024-01-15T12:00:00Z",
    "from_account": {
      "id": "uuid",
      "name": "Checking Account",
      "type": "depository",
      "mask": "0000"
    },
    "to_account": {
      "id": "uuid",
      "name": "Savings Account",
      "type": "depository",
      "mask": "1111"
    }
  }
]
```

#### POST `/api/transfers`
Create a new transfer.

**Request Body:**
```json
{
  "from_account_id": "uuid",
  "to_account_id": "uuid",
  "amount": 1000.00,
  "notes": "Monthly savings transfer"
}
```

#### PATCH `/api/transfers`
Update transfer status.

**Request Body:**
```json
{
  "id": "uuid",
  "status": "completed"
}
```

**Valid Statuses:** `pending`, `processing`, `completed`, `failed`

---

### 10. Summary / Dashboard

#### GET `/api/summary`
Get financial summary for dashboard.

**Response:**
```json
{
  "totalBalance": 10000.00,
  "totalVaultBalance": 5000.00,
  "totalDebt": 1500.00,
  "netWorth": 13500.00,
  "accountCount": 3,
  "vaultCount": 3,
  "liabilityCount": 1,
  "transactionCount": 150,
  "pendingTransactionCount": 5,
  "overdueLiabilityCount": 0,
  "connectedBanks": 2
}
```

---

### 11. Refresh Data

#### POST `/api/refresh`
Manually trigger a refresh of all Plaid data (accounts, transactions, recurring transactions, liabilities).

**Response:**
```json
{
  "success": true,
  "message": "Data refreshed successfully"
}
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Notes

1. All date fields use ISO 8601 format (YYYY-MM-DD)
2. All monetary amounts are in decimal format (e.g., 1000.00)
3. Default vaults are automatically created when a user profile is created:
   - Rainy Day
   - Bill Cushion
   - Weekend Buffer
4. Transaction syncing pulls last 3 months of data
5. Liabilities are automatically synced from Plaid when available
6. Recurring transactions are automatically detected and linked to individual transactions
