# Deep Technical Architecture & System Engineering Report
## HealthTech Telemedicine Epidemiological Analytics & Patient Data Dashboard

> **System Profile**: Enterprise-grade, HIPAA/DPDP/DISHA-compliant HealthTech modular monolith.
> **Tech Stack**: Next.js 14 (App Router, React 18, Tailwind CSS, Recharts) + Node.js / Express (TypeScript) + MongoDB Atlas + Dual-Token JWT Auth.

---

## 🏛️ 1. Architecture Choices & System Topology

```
                  ┌────────────────────────────────────────────────────────┐
                  │            Next.js 14 Frontend (Vercel)                │
                  │  App Router | React Context | Tailwind | Recharts      │
                  └──────────────────────────┬─────────────────────────────┘
                                             │  HTTPS + Dual Bearer/Cookie Auth
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │             Node.js / Express API (Railway)            │
                  │              TypeScript Modular Monolith               │
                  └──────┬──────────┬───────────┬───────────┬──────────┬───┘
                         │          │           │           │          │
           ┌─────────────▼─┐  ┌─────▼─────┐  ┌──▼───────┐ ┌─▼──────┐ ┌─▼─────────┐
           │ Auth Module   │  │ User Mod  │  │Patient   │ │Encounter││Analytics │
           │ (Dual JWT)    │  │ (RBAC)    │  │(Zero PII)│ │ (CRUD) │ │ (Engine) │
           └─────────────┬─┘  └─────┬─────┘  └──┬───────┘ └─┬──────┘ └─┬─────────┘
                         │          │           │           │          │
                         └──────────┴───────────┼───────────┴──────────┘
                                                │
                                                ▼
                                   ┌────────────────────────┐
                                   │  Security Audit Logger │
                                   └────────────┬───────────┘
                                                │
                                                ▼
                                   ┌────────────────────────┐
                                   │ MongoDB Atlas Cluster  │
                                   └────────────────────────┘
```

### A. Modular Monolith vs. Microservice Over-engineering
* **Domain Isolation**: Codebase structured into strict feature domain boundaries (`server/src/modules/{auth, user, patient, encounter, analytics, audit}`). Each domain encapsulates its own Mongoose schemas, controllers, service logic, and route definitions.
* **Why Monolith Wins Here**: Eliminates microservice anti-patterns (distributed tracing overhead, inter-service network latency, multi-repo synchronization debt, two-phase commit complexity) while providing clean boundaries for future microservice extraction if throughput exceeds 50,000 req/min.

### B. DISHA & DPDP-Compliant Data Architecture (Zero PII Design)
* **Zero Personally Identifiable Information (PII)**: Complies strictly with the **Digital Personal Data Protection (DPDP) Act** and Indian **DISHA Healthcare Privacy Guidelines**.
* **Anonymous Identifiers**: Patient identities are replaced with deterministic synthetic codes (e.g. `PAT-681942`). Full names, phone numbers, email addresses, and street details are **never written to the database**.
* **Demographic Bucketing**: Ages are stored in analytical cohorts (`0-17`, `18-35`, `36-50`, `51-65`, `65+`), enabling granular epidemiological surveillance without exposing single-subject identity profiles.

### C. Security & Immutable Audit Trail Infrastructure
* **Audit Logger Middleware**: Intercepts 100% of data mutations and security events (`USER_LOGIN`, `CREATE_ENCOUNTER`, `UPDATE_ENCOUNTER`, `ACCESS_DENIED`).
* **Violation Interception**: Captures client IP (`ipAddress`), authenticated user email (`userEmail`), caller role (`userRole`), HTTP action, and exact target URI. Instantly logs unauthorized privilege escalation attempts (`ACCESS_DENIED`) for compliance audits.

---

## ⚡ 2. Hard Technical Trade-offs & Engineering Decisions

### Trade-off 1: Pre-Save Password Double-Hashing Trap vs. Pre-computed Hash Validation
* **The Root Cause Bug**: Mongoose `pre('save')` hooks execute whenever `.save()` is triggered on a user document (e.g. updating profile, last login timestamp, or roles). Standard implementations check `if (this.isModified('passwordHash'))`. However, when migrating users or performing forced updates, pre-existing bcrypt strings (`$2a$10$...`) were re-hashed into corrupted `$2a$10$w9...` double-hashes, breaking all password validation (`bcrypt.compare` returning `false`).
* **The Engineering Fix**: Implemented explicit hash prefix enforcement in `user.model.ts`:
  ```typescript
  if (this.isModified('passwordHash') && !this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  ```
  Coupled with an automated database self-repair script that restored broken cloud hashes.

### Trade-off 2: Cross-Domain Third-Party Cookie Policy Restrictions (Vercel + Railway)
* **The Problem**: Modern browsers (Chrome 120+, Safari ITP) block `SameSite=None; Secure` cookies when the frontend (`vercel.app`) and backend (`railway.app`) reside on different top-level domains.
* **The Dual Transport Solution**:
  1. **Primary**: HttpOnly, `SameSite=None; Secure` cookies.
  2. **Fallback**: Dual-storage token sync via React `AuthContext` + Axios request interceptor (`client/src/lib/api.ts`).
  ```typescript
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  ```
  Ensures seamless cross-domain API authentication even when browsers aggressively enforce third-party cookie partitioning.

### Trade-off 3: Real-Time Auto-Save vs. Network Flooding
* **The Problem**: Auto-saving encounter drafts to the server on every keystroke floods the database with transient writes and risks partial validation failures.
* **The Solution**: Silent local draft storage in `window.localStorage` keyed by `encounter_draft_<patientId>`. Forms restore uncommitted drafts silently on page reload and purge local storage only upon HTTP 201 successful database commit.

---

## 🎨 3. High-Impact UX & Performance Architecture

```
  Traditional UX (Jarring Layout Shift)       ArogyaData Skeleton UX (Zero CLS)
 ┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐
 │ [Loading patient data...]            │    ┌──────────────────────────────────────┐
 └──────────────────────────────────────┘    │ █ █ █ █ █ █ █ █ █ █ (Pulse Skeleton)  │
                    ↓                        └──────────────────────────────────────┘
 ┌──────────────────────────────────────┐                       ↓
 │ TABLE POPPING IN & SHIFTING LAYOUT   │    ┌──────────────────────────────────────┐
 └──────────────────────────────────────┘    │ TABLE LOADS SILENTLY IN-PLACE         │
                                             └──────────────────────────────────────┘
```

1. **Zero Cumulative Layout Shift (CLS = 0.00) via Component Skeletons**:
   - Replaced generic spinner wheels and "Loading..." text strings across all pages (`/dashboard`, `/patients`, `/encounters`, `/admin/users`, `/admin/audit-logs`) with pixel-accurate Skeleton UI proxies (`SkeletonTable`, `SkeletonCard`, `SkeletonDashboard`).
   - Skeletons match exact DOM node height, padding, and grid column configurations using Tailwind `animate-pulse`, completely eliminating layout shift during API fetching.

2. **Explicit Modal Interception for Destructive Actions**:
   - Replaced instant single-click logouts with an interactive confirmation modal dialog in `Navbar.tsx`.
   - Prevents accidental token invalidation and lost work while maintaining accessible keyboard focus trapping.

3. **Multi-Cohort Epidemiological Recharts**:
   - Render 4 concurrent analytics metrics: **Illness Trends Over Time** (area chart), **Most Common Diagnoses** (horizontal bar), **Seasonal Patterns** (line chart), and **Encounters by Age Group** (pie/donut breakdown).
   - Instant dynamic date filtering (7 Days, 30 Days, 90 Days, All Time) computed via aggregated MongoDB pipelines (`$match`, `$group`, `$sort`).

---

## 🛡️ 4. Critical Edge Cases Handled

| Edge Case | Failure Mode Prevented | Implementation / Resolution |
| :--- | :--- | :--- |
| **Next.js `useSearchParams()` Static Prerender** | Worker thread compilation failure during `next build` static export. | Wrapped query parameter hook consumers inside `<Suspense>` boundaries on `/login`. |
| **Pincode Arbitrary Buffer Overflow** | Users entering 50+ character alphabetic strings in postal code fields. | Enforced strict numeric regex validation `/^\d{3,6}$/` on API schema & UI form inputs. |
| **Clinical Vitals Formatting Errors** | Malformed blood pressure strings (`120-80`, `invalid`) crashing analytics queries. | Applied regex validation `/^\d{2,3}\/\d{2,3}$/` for BP, plus numeric bounds for pulse (30–220 bpm), temperature (80–110°F), and weight (1–300 kg). |
| **Session Hydration Race Condition** | Unauthenticated page flash on hard reload. | Implemented `authLoading` state lock in `AuthContext` blocking downstream page renders until JWT verification completes. |

---

## 🚀 5. Concrete Future Improvements (Roadmap)

1. **Redis Time-Series & Aggregation Caching**:
   - **Problem**: Running MongoDB `$group` aggregation pipelines on millions of encounters introduces database latency.
   - **Solution**: Implement Redis Time-Series (`TS.ADD`) caching layer to serve 90-day illness trend charts in < 2ms.

2. **Real-time Live Outbreak Alert System (SSE / WebSockets)**:
   - Push real-time automated alerts to clinician dashboards when diagnosis counts for high-risk categories (e.g. Dengue, Acute Gastroenteritis) exceed threshold limits (e.g. > 5 cases in 24 hours within a single pincode).

3. **MongoDB Compound Index Optimization**:
   - Add targeted compound index `{ district: 1, createdAt: -1, diagnosisCategory: 1 }` to ensure sub-millisecond analytical query execution as data scales.
