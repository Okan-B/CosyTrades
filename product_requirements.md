# Product Requirements Document (PRD) - CosyTrades

## 1. Executive Summary
**CosyTrades** is a desktop-first "trading room" for the discretionary swing trader. It is a calm, personal space for journaling, reflection, and process—distinct from a broker's execution platform. The core philosophy is "Calm over Hype" and "Process over Outcome." The app features **Jarvis**, an in-app AI coach, and a **Canvas** system that allows users to fully customize their trading environment.

## 2. User Personas
- **The Discretionary Swing Trader**: Holds positions for days/weeks. Uses technical analysis but relies on judgment. Struggles with discipline (FOMO, revenge trading). Needs a "home base" for their trading business that encourages clarity over noise.

## 3. Functional Requirements

### 3.1. The Canvas (Core UI)
The entire UI is a "Canvas" that the user can rearrange and save.
- **Customizable Layouts**: Users can drag-and-drop widgets (Watchlist, Today Summary, Journal, etc.) to create their perfect setup.
- **Canvas Management**:
    - Create, rename, and delete Canvases (e.g., "Daily Swing", "Weekend Review").
    - Switch between Canvases instantly.
    - "Reset to Original" option for the default layout.
- **Community Gallery**:
    - **Share**: Publish layouts to the community.
    - **Explore**: Browse and import layouts from other users.
    - **Import**: Clone a community layout into personal Canvases.

### 3.2. Data & Management
- **Watchlist**:
    - Manage lists of tickers.
    - "Interest" tracking (stocks with notes/activity).
- **Trade Management**:
    - **Manual Entry**: Log trades with symbol, side, qty, price, date.
    - **Import**: CSV import (Trading212 MVP) -> Supabase.
- **Journaling**:
    - **Rich Text**: Block-based editing (BlockNote/Tiptap).
    - **Entry Types**: Pre-trade, Post-trade, Daily, Weekly.
    - **Linking**: Associate entries with specific trades or days.

### 3.3. Jarvis (The AI Coach)
- **Context Awareness**: Jarvis "lives" in the app and sees what the user sees (Trades, Journal, Watchlist, Active Canvas).
- **Interaction Modes**:
    - **Planning**: Active on Trade Add/Detail screens.
    - **Reflection**: Active on Journal/Review screens.
- **Capabilities (Phased)**:
    - **v1 (Text-Only)**: Chat grounded in user data. "What do you notice about this trade?"
    - **v2 (Agentic)**: Can perform soft actions like navigation (`open MSFT detail`) or creating journal entries.

## 4. Technical Constraints & Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS.
- **Layout Engine**: Grid/Flex-based drag-and-drop system.
- **Backend**: Supabase (PostgreSQL + Auth).
- **AI**: Anthropic Claude 3.5 Sonnet (via API/Proxy).

## 5. Implementation Phases

### Phase 1: Data Foundation & Auth
- **Goal**: Move from mock state to real multi-user app with persistent data.
- **Deliverables**:
    - Supabase Auth (Email/Password).
    - Database Tables: `users`, `trades`, `journal_entries`, `watchlist_items`, `canvases`.
    - Replace local Watchlist state with Supabase CRUD.
    - Connect "Today" dashboard to real data (basic counts).

### Phase 2: Core Journaling + Jarvis v1
- **Goal**: Enable full trade logging and basic AI coaching.
- **Deliverables**:
    - **Trade Flow**: "Add Trade" modal, Trade Detail view.
    - **Journaling**: Create entries (Pre/Post/Daily) with rich text.
    - **Jarvis v1**: Chat interface connected to LLM. Context includes user summary, recent trades, and active notes. No tools yet.

### Phase 3: Personal Canvas
- **Goal**: Make the UI truly personal; allow layout customization.
- **Deliverables**:
    - **Widget System**: Define grid widgets (Today Card, Watchlist, Journal Prompt, etc.).
    - **Layout Editor**: Drag-and-drop + Resizing.
    - **Persistence**: Save `config` JSON to `canvases` table. Load user's default canvas on login.

### Phase 4: Canvas Management
- **Goal**: Multiple layouts for different workflows.
- **Deliverables**:
    - **Switcher UI**: Dropdown/Sidebar to switch Canvases.
    - **Actions**: Duplicate, Rename, Delete, Set Default.
    - **Safety**: Protected "Original" layout.

### Phase 5: Community Canvas Gallery
- **Goal**: Share and discover layouts.
- **Deliverables**:
    - **Public Canvases**: `is_public` flag in DB.
    - **Explorer**: Browse real public canvases (Filter/Sort).
    - **Import**: Clone public canvas -> new personal canvas.

### Phase 6: Jarvis v2 (Agentic)
- **Goal**: Deep context and proactive assistance.
- **Deliverables**:
    - **Context Builder**: Richer context (Active Canvas metadata, specific widget visibility).
    - **Soft Tools**: `navigate()`, `create_journal_entry()`, `update_setting()`.
    - **Guardrails**: No external execution; advice only.
