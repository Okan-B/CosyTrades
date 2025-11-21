# Technology Stack

## Frontend
- **Framework**: Next.js 14 (App Router)
    - *Why*: Industry standard, robust routing, server-side rendering for performance.
- **Language**: TypeScript
    - *Why*: Type safety is critical for financial data handling.
- **Styling**: Tailwind CSS
    - *Why*: Rapid development, easy to implement the "Calm" design system (custom colors/fonts).
- **Layout Engine**: React Grid Layout (or similar)
    - *Why*: Essential for the drag-and-drop "Canvas" widget system.
- **State Management**: React Context / Hooks (Zustand if complex)
    - *Why*: Keep it simple for MVP.
- **Icons**: Lucide React
    - *Why*: Clean, consistent, lightweight.
- **Rich Text Editor**: BlockNote (or Tiptap)
    - *Why*: Provides the "Notion-like" block-based editing experience required for the Notes/Watchlist features.

## Backend / Database
- **Platform**: Supabase (PostgreSQL)
    - *Why*: Open source, relational data (perfect for trades/journals), built-in Auth (future proofing).
- **Auth**: Supabase Auth (Email/Password)
    - *Why*: Secure, easy to implement.
- **API**: Next.js API Routes (Serverless)
    - *Why*: Unified codebase with frontend.

## AI / Intelligence
- **Model**: Anthropic Claude 3.5 Sonnet
    - *Why*: Best-in-class reasoning and coding capabilities.
- **Integration**: Vercel AI SDK (optional) or direct API calls.
    - *Why*: Streamlined streaming responses for "Jarvis".

## Deployment
- **Host**: Vercel
    - *Why*: Native Next.js support, zero config.
