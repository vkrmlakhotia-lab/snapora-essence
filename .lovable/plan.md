

# Snaporia — Phase 1 Implementation Plan

## Design System
- **Background**: Pure white `#FFFFFF`, soft gray `#F9F9FB` for cards/surfaces
- **Text**: Deep charcoal `#1A1A1A`, muted gray for secondary text
- **Accent**: Deep Navy `#1B2A4A` for primary actions only
- **Typography**: Inter font, generous whitespace, rounded corners (10px)
- **Shadows**: Subtle `box-shadow` for depth, no heavy borders

## 1. Onboarding & Auth (Mock)
- Splash screen with Snaporia logo and tagline
- Single-screen value proposition with elegant imagery
- Mock "Sign in with Google" and "Sign in with Apple" buttons
- Stores auth state locally — gated entry to the app

## 2. Home Screen — "Creations" Gallery
- If empty: elegant empty state with "Create your first masterpiece" CTA
- If projects exist: grid of book cover thumbnails with title, date, status (Draft/Complete)
- Tap to resume editing or reorder completed books

## 3. Photo Upload & Smart Auto-Layout Engine
- Sleek upload interface (tap to select from device)
- Upon photo selection, automatically generates a 1:1 square book layout
- Photos auto-distributed across pages (2-3 photos per spread, varied layouts)
- Instant preview generation

## 4. Distraction-Free Editor
- Full-screen page view with swipe/tap navigation between pages
- Tap a photo → swap or replace it
- Tap a page → choose from layout templates (1-up, 2-up, 3-up grid)
- Drag to reorder pages
- Tap to add/edit captions with minimal text overlay
- Resize photos within their frames

## 5. 3D CSS Flip Book Preview
- Realistic page-turn animation using CSS 3D transforms
- Perspective and shadow effects for depth
- Swipe or tap arrows to flip pages
- Book cover with title displayed

## 6. Bottom Navigation Bar
- Minimal, thin-stroke Lucide icons
- Four tabs: Home, Creations, Basket, Account
- Subtle active state indicator using Deep Navy accent

## 7. Checkout Flow (Mock)
- Book summary with page count and pricing breakdown (Pages × Price + Delivery)
- Delivery address form with clean input fields
- Mock Apple Pay / Google Pay one-tap buttons
- Order confirmation screen

## 8. Creations Library
- List of all projects: in-progress drafts and completed orders
- Status badges (Draft, Completed, Ordered)
- Quick actions: Resume editing, Reorder, Delete

## 9. Account Screen
- Profile display (name, email from mock auth)
- Order history (mock)
- Sign out option

All screens will use smooth fade/slide transitions. Mobile-first layout optimized for tap interactions, responsive up to tablet.

