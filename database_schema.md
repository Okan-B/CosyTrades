# Database Schema (Supabase / PostgreSQL)

## Tables

### 1. `users`
- `id` (UUID, PK) - Linked to Supabase Auth
- `email` (Text)
- `created_at` (Timestamp)
- `settings` (JSONB) - UI preferences, default risk %, etc.

### 2. `trades` (Raw & Manual)
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `symbol` (Text)
- `direction` (Text) - BUY/SELL
- `quantity` (Decimal)
- `price` (Decimal)
- `timestamp` (Timestamp)
- `fee` (Decimal)
- `currency` (Text)
- `notes` (Text) - Quick notes
- `broker_id` (Text, Optional) - For imported trades

### 3. `journal_entries`
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `trade_id` (UUID, FK, Optional) - Link to specific trade
- `type` (Text) - PRE_TRADE, POST_TRADE, DAILY, WEEKLY
- `date` (Timestamp)
- `content` (JSONB) - Rich text content (BlockNote/Tiptap JSON)
- `tags` (Array)

### 4. `watchlist_items`
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `symbol` (Text)
- `added_at` (Timestamp)
- `notes` (Boolean) - Cached flag if user has notes (optimization)
- `display_order` (Integer)

### 5. `canvases`
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `name` (Text)
- `description` (Text)
- `config` (JSONB) - Layout configuration (widget positions, sizes, visibility)
- `is_default` (Boolean)
- `is_public` (Boolean)
- `tags` (Array) - e.g., ["Swing", "Daily"]
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `cloned_from_id` (UUID, FK, Optional) - If imported from community

## Relationships
- One User -> Many Trades
- One User -> Many Journal Entries
- One User -> Many Watchlist Items
- One User -> Many Canvases
- One Trade -> Many Journal Entries (optional)
