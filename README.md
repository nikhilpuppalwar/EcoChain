<img width="4320" height="1440" alt="hh26 main poster 2 with sponsors 3x1 (4320 x 1440 px) (2)" src="https://github.com/user-attachments/assets/c698b2cd-da84-4cb0-9276-125c6a7244aa" />

<div align="center">

# 🌿 EcoChain

### *Transparent Carbon. Verified by AI. Secured by Blockchain.*

**A full-stack, decentralized carbon emission monitoring, AI verification, and trustless credit trading platform — built to eliminate greenwashing and automate environmental compliance.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue)](https://www.python.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Polygon](https://img.shields.io/badge/Polygon-7B3FE4?style=for-the-badge&logo=polygon&logoColor=white)](https://polygon.technology/)

</div>

---

## 📌 Problem & Domain

The global carbon credit system — worth **$2 trillion by 2030** — is fundamentally broken:

| Critical Failure | Real-World Impact |
|---|---|
| **Data Falsification** | Industries self-report CO₂ emissions with no real-time verification — easily manipulated to avoid penalties |
| **Greenwashing Epidemic** | 42% of corporate green claims are exaggerated or false with no traceable on-chain proof |
| **Broker-Heavy Trading** | Carbon credit markets charge 10–30% broker fees, slow settlement (days), and offer zero price transparency |
| **No Predictive Oversight** | Regulators react to past violations — no ML-based early warning system exists at scale |
| **Opaque Verification** | Audit trails live in private databases that can be edited, deleted, or selectively hidden |

**EcoChain eliminates every one of these failures** by combining AI anomaly detection with immutable blockchain storage and trustless smart contract trading.

### Themes Selected:
- [ ] Human Experience & Productivity  
- [✓] Climate & Sustainability Systems  
- [ ] HealthTech & Bio Platforms  
- [ ] Learning & Knowledge Systems  
- [ ] Work, Finance & Digital Economy  
- [✓] Infrastructure, Mobility & Smart Systems  
- [✓] Trust, Identity & Security  
- [ ] Media, Social & Interactive Platforms  
- [ ] Public Systems, Governance and Civic Tech  
- [ ] Developer Tools & Software Infrastructure  

*(Multiple themes selected — EcoChain sits at the intersection of Climate Tech, Infrastructure, and Trust Systems)*

---

## 🎯 Objective

EcoChain replaces fragmented, fraud-prone manual processes with a **single, automated, tamper-proof pipeline** for carbon emission governance.

### Who Does It Serve?

| User Role | What They Get |
|---|---|
| 🏭 **Industries / Emitters** | Auto-calculate Scope 1/2/3 CO₂e, submit verified reports, receive AI feedback, trade surplus credits |
| 🔍 **Auditors** | AI pre-screens all reports; auditors only review flagged ones. PKI-sign verified reports digitally |
| 🏛️ **Governments / Regulators** | Set national carbon caps, mint ERC-20 credits, view live AI-powered compliance dashboards |
| 👥 **General Public** | Zero-login access to national emission stats, carbon credit markets, and blockchain-verified records |

### The Value Proposition
> *Stop trusting. Start verifying.* EcoChain makes every emission record **publicly verifiable, AI-validated, and blockchain-anchored** — turning carbon compliance from a paper exercise into a real-time, automated system of accountability.

---

## 🧠 Team & Approach

### Team Name:  
`Team Tikshna`

### Team Members:
| Name | Role | Contact |
|---|---|---|
| **PRATIK GHAVATE** | 👑 Team Leader | [pratik.ghavate23@pccoepune.org](mailto:pratik.ghavate23@pccoepune.org) |
| **Nikhil Puppalwar** | Full-Stack & Blockchain Dev | [nikhilpuppalwar16@gmail.com](mailto:nikhilpuppalwar16@gmail.com) |
| **Nihar Salvi** | AI/ML & Backend Dev | [niharsalvi2@gmail.com](mailto:niharsalvi2@gmail.com) |
| **VIJAY DHAME** | Frontend & Smart Contract Dev | [vijay.dhame23@pccoepune.org](mailto:vijay.dhame23@pccoepune.org) |

### Our Approach

**Why We Chose This Problem:**  
Climate change is an accountability crisis as much as a science problem. Carbon offsetting — one of the most critical tools — is sabotaged by unverifiable claims and inefficient markets. We chose this because decentralized tech and AI are uniquely positioned to solve it, and because it matters.

**Key Challenges We Tackled:**

- **Gas Cost Barrier:** Ethereum Mainnet fees would make each carbon audit unaffordable. We evaluated Layer-2 solutions and deployed to the **Polygon network** (~`$0.001/tx`) — making the system commercially viable for high-frequency emission reporting.

- **AI ↔ Blockchain Bridge:** Connecting off-chain Python ML inferences with on-chain Solidity contracts required a secure, typed API gateway. We built an Express.js orchestration layer that validates AI scores, converts them to verifiable IPFS hashes, and triggers smart contract writes via `Ethers.js`.

- **Multi-Role, Multi-Portal UX:** Supporting 5 completely different user types on a single codebase without creating spaghetti code. We implemented a **RBAC middleware system with role-gated React routes**, allowing each portal to feel purpose-built while sharing a unified component library.

**Breakthroughs & Pivots:**  
We originally planned a basic anomaly detector. During development, we realized a single AI gate is insufficient — industries could still submit to auditors and slip through. We pivoted to design a **3-Stage Automated Decision Pipeline** (detailed in Core Workflow below), which became the project's key differentiator.

---

## 🛠️ Tech Stack

### Core Technologies Used:

| Layer | Technologies |
|---|---|
| **Frontend** | React.js, Vite, Tailwind CSS, shadcn/ui, Recharts, Leaflet.js, Zustand, Framer Motion, Ethers.js |
| **Backend** | Node.js, Express.js, Socket.io, JWT, Speakeasy (TOTP 2FA), node-forge (PKI), PDFKit, node-cron |
| **Database** | MongoDB Atlas (primary), Upstash Redis (sessions/cache), Cloudinary (documents & certificates) |
| **AI / ML** | Python 3.12, FastAPI, scikit-learn (Isolation Forest, One-Class SVM), TensorFlow/LSTM, Prophet |
| **Blockchain** | Solidity, Foundry (forge/anvil/cast), OpenZeppelin, ERC-20, Polygon Mainnet / Sepolia Testnet |
| **DevOps / Hosting** | Vercel (frontend), Render (backend + AI services), GitHub Actions (CI/CD), PM2 |

### Additional Technologies Used:
- [✓] AI / ML — Isolation Forest anomaly detection, LSTM time-series forecasting, One-Class SVM fraud scoring
- [✓] Web3 / Blockchain — ERC-20 carbon credits, smart contract trading, on-chain audit registry
- [✓] Cyber Security — JWT RBAC, Speakeasy TOTP 2FA, node-forge PKI, Helmet.js, AES-256 encryption
- [✓] Cloud — Vercel, Render.com, MongoDB Atlas, Upstash Redis, Cloudinary, IPFS (Web3.Storage)

### Total Infrastructure Cost: **$0** — entire production stack runs on free tiers.

---

## 🏆 Sponsored Track (Optional)

- [ ] **Expo Track** – Built using Expo  
- [ ] **Neo4j Track** – Uses AuraDB as primary database  
- [ ] **Base44 Track** – Prototype/Final Product built using Base44  

> _Not applicable for this project._

---

## ✨ Key Features

### 🔑 Core Platform Features

- ✅ **AI Anomaly Detection Gate** — Isolation Forest ML model auto-flags suspicious emission submissions with a 0–100 Risk Score before they reach any auditor
- ✅ **Immutable Blockchain Audit Registry** — `AuditRegistry.sol` stores SHA-256 hashes of every verified report on Polygon; records are permanent and publicly verifiable
- ✅ **Decentralized Carbon Credit Trading** — `CarbonMarketplace.sol` executes peer-to-peer ERC-20 token trades with zero broker intermediaries and instant settlement
- ✅ **Full Carbon Credit Lifecycle** — Emission Reduction → Govt Mints ERC-20 → Industry Holds → Lists on Marketplace → Buyer Purchases → `CreditRetirement.sol` burns tokens
- ✅ **Automated ESG Report Generation** — PDFKit + Jinja2 NLG templates auto-generate professional Carbon Audit PDFs and BRSR compliance certificates
- ✅ **Predictive Emission Forecasting** — Prophet + LSTM time-series models forecast future industrial and national-level CO₂ trends with confidence bands
- ✅ **Real-Time Monitoring** — Socket.io delivers live submission status updates, marketplace price changes, and AI risk alerts with <500ms latency

### 🏛️ Role-Based Portals (6 Portals, 33 Screens)

- ✅ **Industry Portal** — Emission data input, Scope 1/2/3 calculator, wallet & credit management, what-if CO₂ simulator
- ✅ **Auditor Portal** — AI-pre-screened audit queue, PKI digital signing, audit history with blockchain verification
- ✅ **Government Portal** — National emission dashboard, AI Verifier Panel with live anomaly feed, policy management, carbon credit minting
- ✅ **Admin Portal** — User management, platform activity logs, role assignments, and global settings
- ✅ **Public Portal** — Zero-login access to national stats, emission maps (Leaflet.js), and public credit market data
- ✅ **Government AI Verifier** — Specialized panel for reviewing AI-flagged industry submissions with repeat-offender tracking

### 🔐 Security Architecture

- ✅ **Multi-Factor Auth** — JWT Access (15min) + Refresh (7d) tokens with Speakeasy TOTP 2FA for all roles
- ✅ **PKI Digital Signatures** — Auditors sign every verified report with node-forge certificates, enabling cryptographic non-repudiation
- ✅ **RBAC Middleware** — 5 distinct roles with granular route-level permissions enforced on every API endpoint
- ✅ **IP Whitelist for Admin** — Admin portal restricted to approved IP ranges; zero public exposure

---

## ⚙️ System Architecture & Core Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                           USERS                             │
│  🌐 Public │ 🏭 Industry │ 🔍 Auditor │ 🏛 Govt │ 🔧 Admin  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           FRONTEND — React.js + Vite (Vercel)               │
│   Tailwind CSS │ shadcn/ui │ Recharts │ Leaflet.js           │
└─────────────────────────────────────────────────────────────┘
                    ↓ HTTPS + JWT │ Axios │ Socket.io
┌─────────────────────────────────────────────────────────────┐
│         API GATEWAY — Node.js + Express.js (Render)         │
│     JWT Auth │ RBAC Middleware │ Rate Limiting │ Swagger     │
└─────────────────────────────────────────────────────────────┘
       ↓              ↓               ↓              ↓
┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐
│ MongoDB  │  │  Upstash   │  │Cloudinary│  │ Socket.io  │
│  Atlas   │  │   Redis    │  │  Files   │  │   Server   │
└──────────┘  └────────────┘  └──────────┘  └────────────┘
       ↓                                   ↓
┌─────────────────┐          ┌──────────────────────────────┐
│ Python FastAPI  │          │      BLOCKCHAIN LAYER         │
│ AI/ML Service   │          │  Polygon / Sepolia Testnet   │
│                 │          │  CarbonCredit.sol  (ERC-20)  │
│ Isolation Forest│          │  CarbonMarketplace.sol       │
│ Prophet / LSTM  │          │  CreditRetirement.sol        │
│ One-Class SVM   │          │  AuditRegistry.sol           │
│ MobileNetV2     │          │  AccessControl.sol           │
└─────────────────┘          └──────────────────────────────┘
```

### 3-Stage Automated Verification Pipeline

```
 Industry Submits Data
        ↓
[GATE 1] AI Anomaly Score > Threshold?
    YES → Routed to Govt AI Verifier Panel → Reject + Notify Industry
    NO  ↓
[GATE 2] Auditor PKI Review → Digital Signature Applied
        ↓
 Blockchain Hash Anchored to AuditRegistry.sol (immutable)
        ↓
[GATE 3] Emission vs. Baseline Check
    EXCEEDED → Penalty issued to Industry
    REDUCED  → Govt mints ERC-20 Carbon Credits to Industry Wallet
        ↓
 Industry lists credits on CarbonMarketplace.sol
        ↓
 Smart contract auto-settles P2P trade
        ↓
 Retirement: CreditRetirement.sol burns tokens → New cycle begins
```

---

## 🤖 AI / ML Models

| # | Feature | Algorithm | Output |
|---|---|---|---|
| 1 | **Anomaly Detection** | Isolation Forest | Risk Score 0–100 + Anomaly Flag |
| 2 | **Baseline Modelling** | Linear Regression + K-Means | Expected Baseline (tCO₂e) + Confidence Range |
| 3 | **Emission Forecasting** | Prophet + LSTM (TensorFlow) | Next Period Forecast + Confidence Band |
| 4 | **Fraud Detection** | One-Class SVM | Fraud Probability Score Per Industry |
| 5 | **Reduction Suggestions** | Feature Importance + Rule Engine | Ranked Actionable CO₂ Reduction Steps |
| 6 | **What-If Simulator** | Custom Regression Inference | Estimated CO₂ Impact of Parameter Change |
| 7 | **ESG Report Generation** | NLG + Jinja2 Templates | Auto-generated Compliance Report Narrative |
| 8 | **Compliance Checker** | Rule Engine + Classification | Compliance Score % (Red/Green per Source) |
| 9 | **Credit Price Prediction** | Prophet Time-Series | Price Forecast + Market Trend Indicator |

---

## 📽️ Demo & Deliverables

- **Demo Video Link (Mandatory):** [Paste link]  
- **Deployment Link (Recommended):** [Paste link]  
- **Pitch Deck / PPT (Optional):** [Paste link]  

---

## ✅ Tasks & Bonus Checklist

- [✓] All team members completed the mandatory social task  
- [✓] Bonus Task 1 – Badge sharing  
- [✓] Bonus Task 2 – Blog/article  

*(Refer to Participant Manual for details)*

---

## 🧪 How to Run the Project

### Requirements:
- **Node.js** v18+
- **Python** v3.11 or v3.12
- **Foundry** (`forge`, `anvil`) — for smart contract development
- **MongoDB** — Atlas free tier or local instance
- API Keys: MongoDB Atlas URI, Cloudinary, Gmail SMTP (for email notifications)

### Local Setup:

**Step 1: Clone the Repository**
```bash
git clone https://github.com/nikhilpuppalwar/EcoChain.git
cd EcoChain
```

**Step 2: Smart Contracts (Foundry)**
```bash
cd contracts
forge install        # Install OpenZeppelin dependencies
forge build          # Compile all contracts

# Terminal 1 — Start local Anvil testnet
anvil

# Terminal 2 — Deploy contracts to local node
forge script scripts/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
# Copy deployed addresses to backend/.env and web/.env
cd ..
```

**Step 3: Backend (Node.js API)**
```bash
cd backend
npm install
cp .env.example .env
# Fill in: MONGODB_URI, JWT secrets, contract addresses, AI_SERVICE_URL
npm run dev
# Running on http://localhost:5000  |  Swagger UI: http://localhost:5000/api/docs
cd ..
```

**Step 4: AI Anomaly Service (Python FastAPI)**
```bash
cd ai
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
# Running on http://localhost:8000
cd ..
```

**Step 5: Frontend (React + Vite)**
```bash
cd web
npm install
cp .env.example .env
# Fill in: VITE_API_URL=http://localhost:5000/api, contract addresses
npm run dev
# Running on http://localhost:5173
```

### Environment Variables (Key ones):

```env
# backend/.env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecochain
JWT_ACCESS_SECRET=your_secret
AI_SERVICE_URL=http://localhost:8000

# web/.env
VITE_API_URL=http://localhost:5000/api
VITE_CARBON_CREDIT_ADDRESS=0x...
```

---

## 🔐 Security Overview

| Layer | Implementation |
|---|---|
| Authentication | JWT Access (15min) + Refresh (7d) stored in Redis |
| 2FA | Speakeasy TOTP — required for all roles |
| Authorization | Custom RBAC middleware on every protected route |
| Password Security | bcryptjs with salt rounds: 12 |
| Data Encryption | AES-256 for sensitive data at rest |
| Digital Signatures | node-forge PKI certificates for auditor report signing |
| Rate Limiting | 100 requests / 15 min per IP on public routes |
| Security Headers | Helmet.js — XSS, CSRF, clickjacking, HSTS |
| Input Validation | express-mongo-sanitize + validator.js |
| Blockchain Security | OpenZeppelin AccessControl + Multi-sig wallet support |

---

## 🧬 Future Scope

- 📡 **IoT-Linked Auto-Reporting** — Direct integration with Continuous Emissions Monitoring Systems (CEMS) and factory IoT sensors to auto-submit real-time CO₂ readings, eliminating manual data entry entirely
- 🛡️ **Zero-Knowledge Proofs (ZK-SNARKs)** — Allow industries to prove they meet emission thresholds to regulators without revealing commercially sensitive production metrics
- 🌐 **Carbon DeFi Liquidity Pools** — Stake retired carbon credits into yield-bearing green liquidity pools, creating a DeFi incentive layer for real-world sustainability actions
- 🌍 **Multi-Country Regulatory Compliance** — Support for EU ETS, California Cap-and-Trade, and Indian PAT Scheme rule sets within a single platform
- 📱 **Mobile App** — React Native companion app for industry users to capture and submit emission data from the field
- 🤝 **Supply Chain Scope 3 Tracking** — Extend reporting upstream and downstream through a supplier network graph to calculate full Scope 3 indirect emissions automatically

---

## 📎 Resources / Credits

- **IPCC Emission Factors** — CO₂e calculation constants for Scope 1/2/3 reporting
- **GHG Protocol** — Greenhouse Gas emission quantification methodology
- **OpenZeppelin** — Audited smart contract templates (ERC-20, AccessControl)
- **Foundry** — Rust-based smart contract development framework (forge / anvil / cast / chisel)
- **scikit-learn** — Isolation Forest and One-Class SVM implementations
- **Meta Prophet** — Open-source time-series forecasting model
- **shadcn/ui + Radix UI** — Accessible, composable React component primitives

---

## 🏁 Final Words

Building EcoChain in a hackathon timeframe taught us that the hardest engineering problems aren't purely technical — they're architectural. Bridging the worlds of Python AI, Node.js APIs, React UX, and Solidity smart contracts into a single coherent system required careful design, constant iteration, and strong teamwork.

We're proud of what **Team Tikshna** built. EcoChain isn't just a prototype — it's a functional, production-grade blueprint for how carbon compliance should work. Transparent by default, verified by machines, and secured by mathematics.

> *"The best time to fix the carbon market was 20 years ago. The second best time is now — with verifiable AI and blockchain."*

---

<div align="center">
Made with 🌿 by <strong>Team Tikshna</strong> — EcoChain © 2026
</div>
