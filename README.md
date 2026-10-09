# HealthTech Patient Data & Epidemiological Analytics Dashboard

A monolithic, secure, and role-tailored clinical data management system built for telemedicine health centers and NGOs operating in rural India.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Doctor**: Can view, enter, and edit patient visit encounters, view epidemiological health trends.
   - **Nurse**: Can register anonymized patients and enter clinical visit data (draft/submit).
   - **Admin**: Full user management (provisioning clinicians), security audit logging, data management.

2. **Dual-Token Authentication (JWT Security)**:
   - Short-lived **Access Token (15 mins)**.
   - HTTP-Only secure **Refresh Token (7 days)** with token rotation & instant logout revocation.

3. **Data Privacy & Anonymization (DPDP / DISHA Compliant)**:
   - Zero raw PII stored. Auto-generated unique patient code (`PAT-2026-XXXX`), age, gender, and district/pincode prefix.

4. **4 Core Interactive Visualizations (Recharts)**:
   - **Chart A: Illness Trends Over Time** (Multi-line chart - daily/weekly/monthly).
   - **Chart B: Most Common Diagnoses** (Horizontal bar chart - top frequency ranking).
   - **Chart C: Seasonal Illness Patterns** (Monthly column chart comparing Respiratory, Viral, and GI surges).
   - **Chart D: Encounters by Age Group** (Bar chart grouped into `0-12`, `13-18`, `19-35`, `36-60`, `60+`).

5. **Session Expiry & Offline Resilience**:
   - Auto-saves form input to `localStorage` as drafts during network latency or token refresh.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Doctor** | `doctor@healthtech.org` | `Doctor@123456` | Enter visits, edit diagnosis/treatment, view analytics |
| **Nurse** | `nurse@healthtech.org` | `Nurse@123456` | Register anonymized patients, enter clinical visit data |
| **Admin** | `admin@healthtech.org` | `Admin@123456` | User management, view audit logs, full analytics & CRUD |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ & npm
- MongoDB running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### Installation & Local Run

#### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
```
*The server automatically connects to MongoDB and seeds initial demo users, patients, and 60+ sample clinical encounters spanning 90 days!*

#### 2. Start Next.js Frontend
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Unit & Integration Tests

```bash
cd server
npm test
```
Runs integration test suites for Authentication, JWT rotation, and RBAC permission enforcement.

---

## 🐳 Docker Deployment

Run the full stack with Docker Compose:
```bash
docker-compose up --build
```
