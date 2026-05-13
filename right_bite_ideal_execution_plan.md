# Right Bite - Ideal Master Execution Plan

> Built from the current Right Bite codebase and roadmap.
> Purpose: one complete plan from the current state to a polished, launch-ready product.

---

## 1. Executive Decision

Right Bite is already beyond the prototype stage. The uploaded project state shows that you already have:
- JWT authentication
- profile saving and nutrition target calculation
- manual meal logging with dashboard aggregation
- daily weight logging with history chart
- weekly meal planning with grocery generation

That means the ideal next move is **not** to keep making isolated feature plans. The ideal move is to follow one master execution plan in this order:

1. Stabilize the current product foundation
2. Finish the meal-planning system properly
3. Add AI meal-plan generation on top of that stable foundation
4. Complete account/settings and navigation shell
5. Redesign the UI into a premium mobile-first system
6. Add photo-based meal analysis and lightweight AI assistance
7. Harden the app for launch and deployment

This is the order that gives you the best chance of ending with a product that feels coherent, stable, and actually shippable.

---

## 2. What the Current Project Already Has

From the uploaded master file, Right Bite already includes:
- React + Vite frontend
- Node + Express backend
- SQLite via Prisma
- JWT auth with bcrypt
- Recharts for progress visualization
- implemented pages for login, register, dashboard, profile, meal logging, progress, meal wizard, weekly plan, groceries, and a placeholder settings page
- implemented backend routes for auth, profile, meals, weight, and meal plans

This matters because your project should now be managed like a real application, not like a sequence of disconnected mini-features. fileciteturn7file0

---

## 3. What Needs Improvement Before New Major Features

These are the most important weak points visible from the current code and architecture.

### 3.1 Backend response shape is still inconsistent
Some routes return `{ status, data }`, some return only `{ message }`, and some mix both styles. This will create frontend complexity and make future refactors harder.

### 3.2 Validation is scattered
Input validation exists, but it is route-local and inconsistent. There is no single shared validation layer for auth, profile, meal logs, weight logs, or meal-plan generation.

### 3.3 `mealPlanRoutes.js` is too heavy
That route file currently contains route handlers, meal bank data, plan generation, filtering, grocery extraction, and persistence logic. That is acceptable for an early build, but not acceptable before adding AI generation.

### 3.4 Plan generation is not protected by a shared shape validator
Template-generated plans should already go through a strict validator. AI-generated plans absolutely must go through one. Build this once and reuse it for both flows.

### 3.5 The app still lacks a true app shell
You have routes and pages, but not yet a formal protected-route system, reusable layout shell, bottom navigation, or consistent loading/error/empty states.

### 3.6 Settings/account lifecycle is incomplete
The uploaded code still shows `SettingsPage.jsx` as a placeholder. That means there is no complete account lifecycle yet: change password, delete account, logout flow, account safety checks. fileciteturn7file0

### 3.7 SQLite is fine for development, not ideal for real public launch
SQLite is excellent while building fast locally, but if you want Right Bite to become a serious multi-user product, you should plan a migration path to PostgreSQL before launch.

---

## 4. The Ideal Master Roadmap

# Phase 1 - Stabilization and Architecture Cleanup

## Goal
Turn the current feature-complete prototype into a stable product foundation.

## Why this comes first
If you add Gemini before this phase, you will place complex behavior on top of code that is already starting to get dense. That will slow you down later.

## 4.1 Standardize every API response

### Target success shape
```json
{
  "status": "success",
  "data": {}
}
```

### Target error shape
```json
{
  "status": "error",
  "message": "Human-readable explanation"
}
```

### Apply to
- `authRoutes.js`
- `profileRoutes.js`
- `mealRoutes.js`
- `weightRoutes.js`
- `mealPlanRoutes.js`

### Done means
- frontend can rely on one response contract everywhere
- no route returns random shapes anymore

## 4.2 Add a shared validation layer

### Create
- `backend/src/lib/validators/authValidator.js`
- `backend/src/lib/validators/profileValidator.js`
- `backend/src/lib/validators/mealValidator.js`
- `backend/src/lib/validators/weightValidator.js`
- `backend/src/lib/validators/mealPlanValidator.js`

### Validate at minimum
- required fields
- string trimming
- email/password rules
- numeric ranges
- enum values
- no negative nutrition values
- valid meal types
- plan shape = exactly 7 days, valid meal counts, valid grocery item structure

### Recommendation
Use **Zod** for validation if you want the cleanest long-term structure.

## 4.3 Split meal-plan logic into services

### Create
- `backend/src/lib/mealPlanTemplateService.js`
- `backend/src/lib/mealPlanSelectionService.js`
- `backend/src/lib/mealPlanGroceryService.js`
- `backend/src/lib/mealPlanPersistenceService.js`

### Move out of routes
- meal bank selection logic
- preference filtering
- calorie/macro scaling
- grocery extraction
- database save flow

### Result
`mealPlanRoutes.js` becomes thin and maintainable.

## 4.4 Make meal-plan saving transactional

### Problem
A plan save creates:
- one `MealPlan`
- seven `MealPlanDay` rows
- many `MealPlanMeal` rows
- many `GroceryItem` rows

### Requirement
Save the full structure inside a single Prisma transaction.

### Why
If anything fails mid-save, the database must not be left in a half-written state.

## 4.5 Add stronger plan metadata

### Add or standardize fields on `MealPlan`
- `status` (`active`, `archived`)
- `generatedByModel`
- `generationMode` (`template`, `ai`, `template_fallback`)
- `generationNotes` optional
- `failureReason` optional
- `promptVersion` optional

### Why
You will need this for debugging, trust, analytics, and comparing template vs AI quality.

## 4.6 Improve weekly plan visibility

`WeeklyPlanPage.jsx` must clearly serve as the generated-meal viewing page.

### Every meal card should show
- meal type
- meal name
- calories
- protein/carbs/fat
- ingredients preview
- short description or tag

### Optional in this phase
- expand/collapse for more details
- simple modal for full ingredient view

## 4.7 Add protected routes on the frontend

### Create
- `frontend/src/components/ProtectedRoute.jsx`

### Protect
- dashboard
- profile
- log-meal
- progress
- meal-wizard
- weekly-plan
- groceries
- settings

### Done means
Logged-out users cannot directly open internal pages by typing URLs.

## 4.8 Replace alert-heavy UX with real UI states

### Every major page should support
- loading state
- empty state
- error state
- success state

### Pages to update first
- `DashboardPage.jsx`
- `ProfilePage.jsx`
- `LogMealPage.jsx`
- `ProgressPage.jsx`
- `WeeklyPlanPage.jsx`
- `GroceryPage.jsx`

## 4.9 Lock a date-handling policy

### Decision to make
Choose one of these and use it everywhere:
- UTC-only day logic
- user-local day logic with stored date key

### Recommendation
For a nutrition app, long term you want **user-local day logic**.

### Practical implementation
Add a normalized date key for daily models, such as:
- `loggedDayKey` on `MealLog`
- `loggedDayKey` on `WeightLog`

Format can be something like `YYYY-MM-DD` in the user's effective timezone.

## 4.10 Introduce a light test layer

### Minimum coverage to add now
- auth register/login/me
- profile upsert/fetch
- meal create/fetch/delete
- weight daily upsert/delete
- meal-plan generate/fetch history/groceries

### Goal
Not full enterprise testing, just enough regression protection to keep moving fast safely.

## Exit criteria for Phase 1
- all routes share one response shape
- shared validators exist
- meal-plan logic is split into services
- plan save is transactional
- weekly plan is rich enough to be useful
- protected routes exist
- core pages have proper loading/error states
- date strategy is decided

---

# Phase 2 - Complete the Planning System Properly

## Goal
Finish the non-AI planning loop so it feels complete before adding intelligence.

## 5.1 Make plan history actually usable

### Backend
Your project already has archived plan support.

### Frontend
Add a history section that shows:
- generated date
- plan source
- date range
- view option
- maybe restore option later

## 5.2 Add meal details interaction

You do **not** need a separate full page yet unless the experience becomes deep.

### Best current option
Use expandable meal cards or a modal from `WeeklyPlanPage.jsx`.

### Show inside detail view
- full ingredients
- meal description
- macros
- estimated portion
- maybe notes like effort / cuisine / why selected

## 5.3 Improve the template generator quality

Right now the generator filters and scales meals. That is a good start, but the next improvement should make it smarter without AI.

### Improve these areas
- better distribution across days
- less repetition
- stricter macro balancing
- better use of profile dietary style, allergies, and disliked foods
- budget-aware choices
- variety rules that actually matter

## 5.4 Add meal-plan to meal-log bridge

### Feature
From a generated meal card, let the user:
- log this meal to today
- or prefill the log meal form

### Why
This connects planning and tracking, which is one of the most valuable loops in the whole product.

## 5.5 Improve grocery quality

### Add
- category grouping (protein, produce, dairy, pantry, grains, snacks)
- duplicate merging with smarter quantity text
- sort by category
- optional notes

## Exit criteria for Phase 2
- weekly plan feels complete and readable
- plan history is visible
- meal details are accessible
- template generator quality is noticeably better
- groceries feel structured
- user can act on planned meals, not just look at them

---

# Phase 3 - AI Meal-Plan Generation

## Goal
Add AI without breaking the current product.

## Important rule
AI should be an enhancement layer, not a replacement for system stability.

## 6.1 Keep template generation alive forever

### Rule
Do **not** delete the template generator.
It remains your fallback whenever AI fails or returns invalid output.

## 6.2 Build AI in services, not directly in routes

### Create
- `backend/src/lib/geminiClient.js`
- `backend/src/lib/mealPlanPrompt.js`
- `backend/src/lib/mealPlanAiService.js`
- reuse `mealPlanValidator.js`
- reuse `mealPlanPersistenceService.js`

## 6.3 Define a strict AI output contract

### Required output
- 7 days exactly
- each day has exact required meals
- every meal contains name, description, ingredients, calories, protein, carbs, fat
- grocery items present and usable

## 6.4 Add AI + fallback generation flow

### Ideal flow
1. user submits wizard
2. backend loads preferences + profile
3. backend builds prompt
4. backend calls AI
5. backend parses response
6. backend validates structure
7. if valid, save as AI plan
8. if invalid or failed, generate template fallback
9. save generation metadata either way

## 6.5 Small frontend visibility update

Add a badge on `WeeklyPlanPage.jsx`:
- `AI Generated`
- `Template Fallback`

This improves trust and helps debugging.

## 6.6 Store AI metadata

### Save at least
- model name
- generation mode
- prompt version
- failure reason if fallback triggered

## Exit criteria for Phase 3
- AI plan generation works reliably
- invalid AI output never crashes the app
- fallback works silently
- users can see source of generated plan

---

# Phase 4 - Settings, Account Safety, and App Shell

## Goal
Finish the product skeleton so the app behaves like a real signed-in product.

## 7.1 Build SettingsPage properly

### Include
- change password
- delete account
- logout
- dark mode toggle later

## 7.2 Change password backend

### Add endpoint
- `PATCH /api/auth/password`

### Require
- current password
- new password
- password policy

## 7.3 Delete account backend

### Add endpoint
- `DELETE /api/auth/account`

### Require
- re-auth confirmation or password confirmation
- full cascade delete behavior

## 7.4 Create a reusable app layout shell

### Create
- top header or page title system
- reusable page container
- bottom nav for mobile
- shared action button styles
- reusable card styles

## Exit criteria for Phase 4
- settings works end to end
- account lifecycle is complete
- signed-in navigation feels like one app, not separate pages

---

# Phase 5 - Premium Mobile-First UI System

## Goal
Turn Right Bite into a product that looks designed, not just coded.

## 8.1 Build a design system first

### Define once
- colors
- spacing scale
- radius scale
- shadows / glass effects
- typography scale
- icon rules
- button variants
- form variants
- card variants

## 8.2 Recommended visual direction

The current roadmap mentions:
- deep navy
- electric blue accent
- success green
- glassmorphism
- dark mode
- bottom navigation

That direction is strong and fits the product well. Keep it, but implement it through reusable components, not page-by-page styling. fileciteturn7file0

## 8.3 Rebuild pages in this order
1. auth pages
2. dashboard
3. profile
4. log meal
5. weekly plan
6. groceries
7. progress
8. settings

## 8.4 Add UX polish

### Add
- skeleton loaders
- empty illustrations or clean empty states
- soft transitions
- better feedback messages
- inline validation presentation
- sticky bottom actions on mobile where useful

## Exit criteria for Phase 5
- all pages share one visual language
- app feels mobile-first
- no page looks like an outlier

---

# Phase 6 - Photo-Based Meal Analysis and AI Assistance

## Goal
Make logging easier and introduce more useful AI, but only after the core app is stable.

## 9.1 Photo meal analysis

### Backend
Add route such as:
- `POST /api/meals/analyze-photo`

### Flow
1. upload image
2. send to AI vision model
3. estimate meal name and macros
4. return structured suggestion
5. let user confirm/edit before save

## 9.2 Storage decision

Before implementation, decide where images live:
- local uploads for development
- cloud object storage for real deployment

## 9.3 Confidence-based UX

The user should never be forced to trust AI blindly.

### Show
- suggested meal name
- estimated calories/macros
- confidence note if useful
- edit before save

## 9.4 Use `AiRecommendation` meaningfully

Your schema already has `AiRecommendation`.
Use it later for lightweight daily insights such as:
- "You are under protein today"
- "You exceeded calories three days in a row"
- "You are trending toward your goal weight"

Do this **after** meal-photo logging works.

## Exit criteria for Phase 6
- photo analysis fills the meal form reliably
- user can always edit before saving
- AI recommendations are helpful, not noisy

---

# Phase 7 - Launch Hardening and Deployment Prep

## Goal
Prepare Right Bite to be demonstrated, shared, and eventually launched.

## 10.1 Security and backend hardening

### Add
- `helmet`
- rate limiting on auth and AI endpoints
- stricter CORS config
- request size limits
- password rules
- environment validation on startup

## 10.2 Improve project setup

### Add
- `.env.example`
- README
- seed/demo data script
- migration instructions
- reset-db helper for development

## 10.3 Production database strategy

### Recommendation
Stay on SQLite while building quickly.
Before real launch, migrate to PostgreSQL.

### Good timing
Do this before or during deployment prep, not after launch.

## 10.4 Testing and QA checklist

### Add
- smoke tests for full auth flow
- core tracking flow test
- weight flow test
- meal plan generation flow test
- grocery checklist flow test
- AI fallback test

## 10.5 Deployment plan

### Frontend
Vercel or Netlify

### Backend
Render, Railway, Fly.io, or another Node-capable host

### Database
Neon, Supabase Postgres, Railway Postgres, or managed Postgres of your choice

## 10.6 Analytics and monitoring

### Add at minimum
- server logs with request IDs
- error monitoring
- basic usage analytics later

## Exit criteria for Phase 7
- new developer can clone and run the project easily
- demo environment is stable
- app is deployable
- AI fallbacks and core flows are tested

---

## 5. Recommended Schema Improvements

These are not all mandatory immediately, but this is the ideal direction.

### User
Consider adding:
- `displayName` later if email-only identity feels weak

### Profile
Current fields are strong.
Later consider:
- goal intensity
- custom macro strategy
- preferred units
- timezone

### WeightLog
Ideal improvement:
- add `loggedDayKey`
- optionally add unique constraint on `(userId, loggedDayKey)`

### MealLog
Ideal improvement:
- add `loggedDayKey`
- consider source enum values later (`manual`, `photo_ai`, `planned_meal`, `quick_add`)

### MealPlanPreference
Ideal improvement:
- add `updatedAt`
- maybe make one current row per user if history is unnecessary

### MealPlan
Ideal improvement:
- `generationMode`
- `promptVersion`
- `failureReason`
- maybe `title` later (for history UI)

### GroceryItem
Later improvement:
- category enum or stronger normalization

### AiRecommendation
Keep it for later use, but do not let it distract the roadmap now.

---

## 6. Exact Next Three Moves

If you want the single best immediate execution order, do this next:

### Move 1
**Phase 1.1 to 1.5 only**
- standardize responses
- add validators
- split meal-plan services
- add transaction save
- add plan metadata

### Move 2
**Phase 1.6 to Phase 2.5**
- improve weekly plan visibility
- add meal detail interaction
- improve plan history
- improve groceries
- connect planned meals to logging

### Move 3
**Phase 3**
- implement Gemini AI with strict validator + fallback architecture

That is the highest-value path.

---

## 7. What Not to Do Yet

To keep the project ideal, avoid these mistakes right now:
- do not add too many separate pages before finishing the app shell
- do not replace the template generator completely
- do not build photo AI before meal-plan AI is stable
- do not spend large effort on animation before architecture cleanup
- do not launch publicly on SQLite if you expect real concurrent users
- do not keep using `alert()` as the main user feedback system

---

## 8. Final Product Vision

When this roadmap is finished, Right Bite should feel like this:

- a user signs up and completes their profile
- the app calculates a believable calorie and macro target
- the user can log meals fast, manually or by photo
- the dashboard clearly shows what is left for the day
- the progress page shows meaningful body-weight change
- the planning flow gives a usable weekly plan and grocery list
- AI makes planning smarter, but the system still works if AI fails
- the app feels premium on mobile and safe enough to trust
- onboarding, setup, testing, and deployment are all clean

That is the ideal version of Right Bite.

---

## 9. Final Recommendation in One Sentence

**Your best next move is not Step 6 alone - it is a stabilization pass, then a finished planning system, then AI, then settings and UI polish, then photo AI, then launch hardening.**
