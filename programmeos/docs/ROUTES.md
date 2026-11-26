# ProgrammeOS route map

Routes live in `src/app` (Expo Router). Route files are thin and re-export a screen from
`src/features/<module>/`. Modal routes are registered in `src/app/_layout.tsx` (`MODAL_ROUTES`).

## Internal staff — tabs (`src/app/(staff)/`)
| Route | Screen |
| --- | --- |
| `/home` | Role-adaptive Home |
| `/programmes` | Programme directory (search, filters, sort, segments) |
| `/tasks` | My / Team / Programme tasks |
| `/inbox` | Unified inbox: messages, notifications, activity |
| `/more` | Module launcher, profile, role switcher |

## Programme workspace
`/programme/[id]` overview · `/readiness` · `/timeline` · `/sessions` · `/faculty` · `/participants` ·
`/academics` · `/logistics` · `/finance` · `/tasks` · `/documents` · `/activity` · `/discussion` ·
`/programme/new` (modal) · `/programme/[id]/edit` (modal)

## Modules
- **Scheduling**: `/calendar`, `/calendar/resources`, `/session/[id]`, `/session/new` (modal), `/attendance/[sessionId]`
- **Tasks & workflow**: `/task/[id]`, `/task/new` (modal), `/workflows`, `/workflows/[id]`, `/workflow/[key]` (`lifecycle`, `faculty`, `hotel`)
- **Faculty**: `/faculty`, `/faculty/[id]`, `/faculty/[id]/availability`, `/faculty/assign` (modal)
- **Learners**: `/learners`, `/learner/[id]`, `/enrollment/[id]`, `/learners/register` (modal), `/learners/import` (modal), `/learners/nominations`
- **Academics**: `/academics`, `/module/[id]`, `/material/[id]`, `/material/submit` (modal)
- **People**: `/people`, `/person/[id]`
- **Logistics**: `/logistics`, `/travel`, `/travel/[id]`, `/hotels`, `/hotel/[id]`, `/booking/[id]`, `/rooming/[programmeId]`, `/hotel-booking/new` (modal), `/venues`, `/venue/[id]`, `/venue-booking/[id]`, `/logistics/checklist/[programmeId]`, `/onsite/[programmeId]`
- **Clients**: `/clients`, `/client/[id]`, `/contract/[id]`
- **Documents**: `/documents`, `/document/[id]`, `/document/upload` (modal — document intelligence)
- **Finance**: `/finance`, `/finance/transactions`, `/finance/transaction/[id]`, `/finance/invoices`, `/expense/new` (modal)
- **Approvals**: `/approvals`, `/approval/[id]`
- **Reports**: `/reports`, `/report/[key]` (`executive`, `portfolio`, `performance`, `readiness`, `budget`, `revenue`, `profitability`, `faculty-utilisation`, `participation`, `attendance`, `evaluations`, `operations`)
- **Communications**: `/message/[id]`, `/notifications`, `/alerts`
- **Intelligence**: `/assistant` (modal), `/voice` (modal)
- **System**: `/search`, `/settings`, `/profile`, `/states`, `/welcome`, `/role-switcher` (modal)

## Faculty Mode (`src/app/faculty-mode/` tabs + `src/app/fm/`)
Tabs: `/faculty-mode` (Home), `/faculty-mode/schedule`, `/faculty-mode/programmes`, `/faculty-mode/inbox`, `/faculty-mode/profile`
Details: `/fm/programme/[id]`, `/fm/session/[id]`, `/fm/materials`, `/fm/upload` (modal), `/fm/travel`, `/fm/hotel`, `/fm/contracts`, `/fm/documents`, `/fm/payments`, `/fm/feedback`, `/fm/availability`

## Learner Mode (`src/app/learner-mode/` tabs + `src/app/lm/`)
Tabs: `/learner-mode` (Home), `/learner-mode/programme`, `/learner-mode/schedule`, `/learner-mode/materials`, `/learner-mode/profile`
Details: `/lm/overview`, `/lm/session/[id]`, `/lm/material/[id]`, `/lm/assignments`, `/lm/assignment/[id]`, `/lm/submit` (modal), `/lm/assessments`, `/lm/attendance`, `/lm/feedback`, `/lm/feedback-form` (modal), `/lm/certificates`, `/lm/certificate/[id]`, `/lm/notifications`
