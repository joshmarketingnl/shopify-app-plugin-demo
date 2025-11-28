# UI / UX guidelines (v0.1b)

## Design principles
- Modern, clean, elevated; inspired by WizzyBot but without glassmorphism or heavy gradients.
- Prioritize clarity, whitespace, and readable typography; subtle depth via shadows and rounded corners.
- Fast, responsive interactions; animations should be minimal and purposeful (panel slide, button hover).
- Mobile-first: chat panel and cards must adapt to small screens with touch-friendly targets.

## Palette and typography
- Neutral background (`#f6f7fb` or white), strong text (`#1f2937`), accent color reserved for CTAs (e.g., teal or royal blue).
- Use a purposeful font stack (e.g., "Plus Jakarta Sans", "Inter", or system fallback) with consistent sizes/weights.
- Borders: 1px light neutral; radii 10–14px; shadows soft and short.

## Components
- **Floating button**: circular or pill; accent background; hover scale/opacity; toggles chat panel.
- **Chat panel**: anchored bottom-right by default; slide-up animation; header with shop title/status; close/minimize control.
- **Bubbles**:
  - Assistant: light neutral background, dark text.
  - User: accent background with white text.
  - Notice/error: tinted background with icon/label.
- **Product cards**:
  - Contain image (fixed ratio), title, subtitle/description, price emphasized.
  - Quantity controls (+/–) inline with the price; add-to-cart as primary button.
  - Respect `canModifyCart`: if false, render view-only CTA.
- **Action buttons**: inline chips/buttons for “Show more”, “Checkout”, “View cart”.
- **Inputs**: rounded input area with send button; support Enter to send; disable while awaiting response.

## Responsive behaviors
- On mobile: expand to near-fullscreen height; inputs/buttons at least 44px high; avoid hover-only cues.
- On desktop: maintain comfortable max width for the panel (e.g., 380–420px) and readable line lengths.

## Admin UI tone
- SaaS-like layout: left sidebar navigation; content cards with clear headings; primary action buttons consistent.
- Forms should use grouped sections (Clients/Shops, AI Settings, Developer/Test); include inline help text for tokens/secrets.

## Motion
- Use subtle transitions (150–250ms) for panel open/close, button hover/active, and card elevation changes.
- Avoid gratuitous loaders; favor simple dot or spinner indicators when waiting on AI responses.
