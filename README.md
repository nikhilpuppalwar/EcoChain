# 🌿 EcoChain

> **Transparent Carbon. Verified by AI. Secured by Blockchain.**

EcoChain is a full-stack, blockchain-powered carbon emission monitoring and trading platform that brings transparency, accountability, and automation to environmental compliance. It integrates AI-driven anomaly detection, immutable blockchain audit trails, and smart-contract-based carbon credit trading into a single unified platform.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [AI / ML Models](#ai--ml-models)
- [User Roles & Portals](#user-roles--portals)
- [Core Workflow](#core-workflow)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Blockchain Setup (Foundry)](#blockchain-setup-foundry)
- [Deployment](#deployment)
- [Security](#security)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

EcoChain addresses three critical failures in existing carbon markets:

| Problem | EcoChain Solution |
|---|---|
| Data Manipulation — industries falsify emission reports | Isolation Forest ML auto-detects anomalies before auditor review |
| Lack of Transparency — opaque centralized credit trading | AuditRegistry.sol stores every verified report immutably on-chain |
| Inefficient Markets — slow, broker-heavy credit trading | CarbonMarketplace.sol executes trustless peer-to-peer trades automatically |
| No Feedback Loop — no continuous monitoring post-submission | Prophet + LSTM forecasting with real-time AI recommendations |
| Greenwashing Risk — unverifiable carbon neutrality claims | ERC-20 carbon credits traceable from reduction → minting → trading → retirement |

---

## Key Features

- **AI-Powered Fraud Detection** — Isolation Forest ML model flags anomalous emission data before it reaches auditors
- **Blockchain Immutability** — All verified audit reports stored on-chain via `AuditRegistry.sol`, tamper-proof forever
- **Smart Contract Trading** — `CarbonMarketplace.sol` executes trustless, transparent credit trading with zero intermediaries
- **End-to-End Traceability** — Every carbon credit traced from emission reduction → minting → trading → retirement
- **Role-Based Multi-Portal** — Purpose-built portals for Industry, Auditor, Government, Admin, and Public
- **Zero Cost Infrastructure** — Full production system deployable at $0 using free tiers (Vercel, Render, MongoDB Atlas, Polygon)
- **Predictive Analytics** — Prophet + LSTM forecasts future emissions for proactive planning
- **Public Transparency Portal** — No-login access to national emission stats, credit markets, and blockchain records

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React.js + Vite | SPA framework with fast HMR and optimized builds |
| React Router v6 | Client-side routing with protected role-gated routes |
| Tailwind CSS | Utility-first responsive styling |
| shadcn/ui + Radix UI | Accessible, customizable component library |
| Recharts | Emission trend charts and analytics graphs |
| Leaflet.js + React Leaflet | Interactive emission map with regional views |
| Zustand | Lightweight global state (auth, user, notifications) |
| Axios + TanStack Query | API calls with server state caching |
| React Hook Form + Zod | Form management and type-safe validation |
| TanStack Table | Large data tables with sort/filter/pagination |
| Framer Motion | Smooth transitions and hero animations |
| Socket.io Client | Live submission status and market price updates |
| Ethers.js | Wallet connection and smart contract interaction |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express.js | REST API and middleware pipeline |
| JWT + Speakeasy | Token auth with TOTP 2FA |
| bcryptjs | Secure password hashing (salt rounds: 12) |
| Mongoose | MongoDB ODM — schema definition and validation |
| Multer | Multipart document/file upload handling |
| PDFKit | ESG report and compliance certificate generation |
| Nodemailer + Gmail SMTP | Email notifications, OTP, compliance alerts |
| node-cron | Automated reminders and periodic background jobs |
| Socket.io | Real-time push events to connected clients |
| Helmet.js + cors + express-rate-limit | HTTP security headers, CORS, and rate limiting |
| Morgan + Winston | HTTP request logs and application-level logs |
| node-forge | PKI certificate generation and auditor digital signing |
| Swagger UI Express | Auto-generated API documentation |
| PM2 | Node.js process management with auto-restart |

### Database & Storage
| Tool | Purpose | Free Limit |
|---|---|---|
| MongoDB Atlas | Primary database (all collections) | 512 MB |
| Upstash Redis | Sessions, OTP, rate limiting, query cache | 10k req/day |
| Cloudinary | Documents, PDFs, certificates, policy files | 25 GB |

### AI / ML
| Tool | Purpose |
|---|---|
| Python 3.11 + FastAPI | ML model serving as REST microservice |
| scikit-learn | Isolation Forest, regression, clustering |
| TensorFlow | LSTM time-series emission forecasting |
| Prophet (Meta) | National and industry emission forecasting |
| Pandas + NumPy | Data processing and emission calculations |
| Jinja2 Templates | ESG report narrative auto-generation (NLG) |
| Google Colab | Free GPU environment for model training |

### Blockchain
| Tool | Purpose |
|---|---|
| Polygon Mainnet / Mumbai | Low gas fees (~$0.001/tx); free testnet |
| Solidity + Foundry | Smart contract language and dev framework |
| OpenZeppelin | Audited, secure contract templates |
| Ethers.js | Frontend + backend blockchain interaction |
| ERC-20 + ERC-1155 | Fungible credits + unique origin metadata tokens |
| The Graph | Fast querying of on-chain events |
| Web3.Storage (IPFS) | Decentralized storage for large report files |
| Polygonscan | Public transaction verification |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                           USERS                              │
│  🌐 Public │ 🏭 Industry │ 🔍 Auditor │ 🏛 Govt │ 🔧 Admin  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              FRONTEND — React.js + Vite (Vercel)             │
│     Tailwind CSS │ shadcn/ui │ Recharts │ Leaflet.js          │
└──────────────────────────────────────────────────────────────┘
                    ↓ HTTPS + JWT │ Axios │ Socket.io
┌──────────────────────────────────────────────────────────────┐
│           API GATEWAY — Node.js + Express.js (Render)        │
│      JWT Auth │ RBAC Middleware │ Rate Limiting │ Swagger     │
└──────────────────────────────────────────────────────────────┘
       ↓              ↓             ↓              ↓
┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐
│ MongoDB  │  │ Upstash      │  │Cloudinary│  │ Socket.io  │
│ Atlas    │  │ Redis        │  │ Files    │  │ Server     │
└──────────┘  └──────────────┘  └──────────┘  └────────────┘
       ↓                                    ↓
┌──────────────────┐          ┌─────────────────────────────┐
│ Python FastAPI   │          │      BLOCKCHAIN LAYER        │
│ AI/ML Service    │          │  Polygon Network + Foundry   │
│ (Render.com)     │          │  CarbonCredit.sol (ERC-20)   │
│                  │          │  CarbonMarketplace.sol       │
│ Isolation Forest │          │  CreditRetirement.sol        │
│ Prophet / LSTM   │          │  AuditRegistry.sol           │
│ One-Class SVM    │          │  AccessControl.sol           │
│ scikit-learn     │          │  Ethers.js │ The Graph │ IPFS │
└──────────────────┘          └─────────────────────────────┘
```

**Total Infrastructure Cost: $0** — entire production stack runs on free tiers.

---

## Project Structure

```
ecochain/
├── client/                        # React.js Frontend
│   └── src/
│       ├── pages/
│       │   ├── landing/           # L1–L5 Landing Page screens
│       │   ├── public/            # P1–P4 Public Data Portal screens
│       │   ├── government/        # G1–G7 Government Portal screens
│       │   ├── auditor/           # A1–A5 Auditor Portal screens
│       │   ├── industry/          # I1–I6 Industry Portal screens
│       │   └── admin/             # AD1–AD6 Admin Portal screens
│       ├── components/
│       │   ├── shared/            # Navbar, Sidebar, Cards
│       │   ├── charts/            # Recharts components
│       │   ├── maps/              # Leaflet components
│       │   ├── tables/            # TanStack Table
│       │   └── forms/             # React Hook Form
│       ├── store/                 # Zustand global state stores
│       ├── hooks/                 # Custom React hooks
│       ├── services/              # Axios API call functions
│       └── utils/                 # Helper functions
│
├── server/                        # Node.js + Express.js Backend
│   ├── routes/                    # 16 API route modules
│   ├── controllers/               # Route handler functions
│   ├── services/                  # Business logic layer (12 services)
│   ├── models/                    # Mongoose schemas (16 collections)
│   ├── middleware/                # JWT auth, RBAC, validation, rate limit
│   ├── jobs/                      # node-cron scheduled jobs
│   ├── utils/                     # Email helpers, PDF generator, blockchain connector
│   └── config/                    # DB, env, Swagger
│
├── ai/                            # Python FastAPI AI/ML Microservice
│   ├── models/                    # Trained ML model files (.pkl, .h5)
│   ├── routes/                    # FastAPI endpoint definitions (9 endpoints)
│   ├── services/                  # ML inference logic per model
│   ├── training/                  # Model training scripts (Google Colab)
│   └── utils/                     # Data processing helpers
│
├── contracts/                     # Foundry Smart Contract Project
│   ├── src/                       # Solidity contract source files
│   ├── test/                      # Solidity test files (.t.sol)
│   ├── script/                    # Deployment scripts (.s.sol)
│   ├── lib/                       # OpenZeppelin contracts (via forge)
│   └── foundry.toml               # Foundry configuration
│
└── .github/
    └── workflows/
        ├── deploy-client.yml      # Vercel auto-deploy
        ├── deploy-server.yml      # Render backend auto-deploy
        └── deploy-ai.yml          # Render AI service auto-deploy
```

---

## Smart Contracts

| Contract | Standard | Key Functions |
|---|---|---|
| `CarbonCredit.sol` | ERC-20 | `mint(address, amount)`, `transfer(to, amount)`, `burn(amount)`, `balanceOf(address)` |
| `CarbonMarketplace.sol` | Custom | `listCredits(amount, price, expiry)`, `buyCredits(listingId, amount)`, `cancelListing(listingId)`, `getActiveListings()` |
| `CreditRetirement.sol` | Custom | `retireCredits(amount, reason, period)`, `getRetirementRecord(address)`, `isRetired(tokenId)` |
| `AuditRegistry.sol` | Custom | `storeReport(industryId, reportHash, auditorSig)`, `verifyReport(reportHash)`, `getReport(industryId, period)` |
| `AccessControl.sol` | OpenZeppelin | `grantRole(role, address)`, `revokeRole(role, address)`, `hasRole(role, address)` |

### Foundry Development Pipeline

```bash
# Compile contracts
forge build

# Run tests with gas report
forge test --gas-report

# Start local testnet
anvil

# Deploy to Polygon Mumbai (testnet)
forge script script/Deploy.s.sol --rpc-url $MUMBAI_RPC_URL --broadcast

# Deploy to Polygon Mainnet
forge script script/Deploy.s.sol --rpc-url $POLYGON_RPC_URL --broadcast --verify

# Interact with deployed contract
cast send $CONTRACT_ADDR 'mint(address,uint256)' $TO $AMOUNT --rpc-url $RPC_URL

# Interactive Solidity REPL
chisel
```

---

## AI / ML Models

| # | Feature | Algorithm | Input | Output |
|---|---|---|---|---|
| 1 | Anomaly Detection | Isolation Forest | Emission data per source | Risk score 0–100 + anomaly flag |
| 2 | Baseline Model | Linear Regression + K-Means | Historical emissions + sector benchmarks | Expected baseline (tCO₂e) + confidence range |
| 3 | Emission Forecasting | Prophet + LSTM (TensorFlow) | Time-series emission data | Next period forecast + confidence band |
| 4 | Fraud Detection | One-Class SVM | Submission patterns over time | Fraud probability score per industry |
| 5 | Reduction Suggestions | Feature Importance + Rule Engine | Emission breakdown by source | Ranked actionable suggestions |
| 6 | What-If Simulator | Custom Regression Inference | User-adjusted input variables | Estimated CO₂ impact of change |
| 7 | ESG Report Generation | NLG + Jinja2 Templates | Verified emission data + compliance status | Auto-generated report narrative |
| 8 | Compliance Checker | Rule Engine + Classification | Submission vs. govt emission limits | Compliance score %, red/green per source |
| 9 | Credit Price Prediction | Prophet Time-Series | Historical credit prices + trade volume | Price forecast + market trend indicator |

### AI Service Endpoints

```
POST /ai/anomaly-detect      → Isolation Forest on emission data
POST /ai/baseline-model      → Regression + clustering baseline
POST /ai/predict-emissions   → Prophet/LSTM forecast
POST /ai/suggestions         → Ranked reduction recommendations
POST /ai/whatif-simulate     → Real-time CO₂ impact simulation
POST /ai/fraud-score         → Industry fraud risk score
POST /ai/generate-report     → NLG ESG report text (Jinja2)
GET  /ai/national-forecast   → Country-level emission forecast
GET  /ai/credit-price        → Short-term credit price prediction
```

---

## User Roles & Portals

EcoChain has **6 portals** with **33 total screens**, all role-gated via JWT + RBAC middleware.

| Role | Portal | Verified By | Screens |
|---|---|---|---|
| Admin | Admin Portal | Self (super user) | AD1–AD6 |
| Government | Government Portal | Admin | G1–G7 |
| Auditor | Auditor Portal | Government | A1–A5 |
| Industry | Industry Portal | Government | I1–I6 |
| Public | Public Portal | No registration required | P1–P4 |

### Registration & Approval Chain

```
Industry registers → Government reviews docs → Government approves → Industry portal access
Auditor registers  → Government reviews certs → Government approves → Auditor portal access
Government registers → Admin reviews official ID → Admin approves → Govt portal access

Rejection at any step → Email notification with reason + option to resubmit
```

### Role Permissions

| Role | Access Scope |
|---|---|
| `ADMIN` | All routes and platform settings |
| `GOVT` | Government + public routes |
| `AUDITOR` | Auditor routes + assigned industry data |
| `INDUSTRY` | Own data only |
| `PUBLIC` | Public routes only (no login) |

---

## Core Workflow

EcoChain runs a **14-step workflow** with 3 automated decision gates:

```
Step 1  → Industry Data Input         (fuel, electricity, production data)
Step 2  → Emission Calculator         (auto CO₂e via IPCC factors — Scope 1/2/3)
Step 3  → Baseline Emission Model     (AI regression + K-Means benchmark)
Step 4  → AI Anomaly Detection        (Isolation Forest risk score)
         ⚠ GATE 1: Anomaly? → reject + notify → back to Step 1
Step 5  → Auditor Verification        (review + PKI digital signature)
Step 6  → Report Generation           (auto ESG/Carbon PDF via PDFKit)
Step 7  → Blockchain Storage          (AuditRegistry.sol stores hash on Polygon)
Step 8  → Emission Reduction Calc     (current vs baseline delta in tCO₂e)
         ⚠ GATE 2: Exceeded? → penalty issued | Reduced? → credit path
Step 10 → Carbon Credit Minting       (Govt approves → CarbonCredit.sol mints ERC-20)
Step 11 → Credit Storage in Wallet    (tokens transferred to industry multi-sig wallet)
Step 12 → Carbon Marketplace          (industry lists credits with price, qty, expiry)
Step 13 → Smart Contract Trading      (CarbonMarketplace.sol auto-settles buy/sell)
Step 14 → Credit Retirement + Loop    (CreditRetirement.sol burns tokens → new cycle)
```

---

## API Reference

All API routes are prefixed with `/api`. Full interactive docs available at `/api/docs` (Swagger UI).

| Module | Route | Description |
|---|---|---|
| Auth | `/api/auth` | Login, Register, 2FA OTP, JWT refresh |
| Users | `/api/users` | User CRUD, role management |
| Industries | `/api/industries` | Industry profiles, verification |
| Auditors | `/api/auditors` | Auditor profiles, audit assignments |
| Emissions | `/api/emissions` | Submit, calculate, track emission data |
| Baseline | `/api/baseline` | Baseline model results |
| Anomaly | `/api/anomaly` | AI anomaly detection results |
| Audit | `/api/audit` | Audit queue, verify, PKI sign |
| Credits | `/api/credits` | Mint, trade, retire carbon tokens |
| Marketplace | `/api/marketplace` | Listings, buy, sell credits |
| Blockchain | `/api/blockchain` | On-chain records, hash verification |
| Reports | `/api/reports` | Generate ESG + compliance PDFs |
| Policies | `/api/policies` | Government policy CRUD |
| Notifications | `/api/notifications` | Send, receive, manage alerts |
| Admin | `/api/admin` | Platform settings, activity logs |
| AI Proxy | `/api/ai` | Proxy to Python FastAPI service |

---

## Environment Variables

### `server/.env`

```env
# Application
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecochain

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Redis (Upstash)
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your_token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail SMTP)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Blockchain
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your_key
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/your_key
PRIVATE_KEY=your_deployer_wallet_private_key
POLYGONSCAN_API_KEY=your_polygonscan_key

# Contract Addresses (after deployment)
CARBON_CREDIT_ADDRESS=0x...
MARKETPLACE_ADDRESS=0x...
RETIREMENT_ADDRESS=0x...
AUDIT_REGISTRY_ADDRESS=0x...
ACCESS_CONTROL_ADDRESS=0x...

# 2FA
TOTP_SECRET=your_totp_secret

# Admin
ADMIN_IP_WHITELIST=192.168.1.1,10.0.0.1
```

### `ai/.env`

```env
PORT=8000
MODEL_DIR=./models
LOG_LEVEL=info
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/your_key
VITE_CARBON_CREDIT_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.11+
- Git
- Foundry — install via `curl -L https://foundry.paradigm.xyz | bash && foundryup`

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ecochain.git
cd ecochain
```

### 2. Start the Frontend

```bash
cd client
npm install
cp .env.example .env      # fill in variables
npm run dev               # starts on http://localhost:3000
```

### 3. Start the Backend

```bash
cd server
npm install
cp .env.example .env      # fill in variables
npm run dev               # starts on http://localhost:5000
```

### 4. Start the AI Service

```bash
cd ai
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 5. Setup Smart Contracts

```bash
cd contracts
forge install              # installs OpenZeppelin
forge build                # compile all contracts
anvil                      # start local testnet on port 8545

# In a new terminal — deploy to local testnet
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

---

## Blockchain Setup (Foundry)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Initialize project (already done in repo)
forge init contracts
cd contracts

# Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts

# Compile
forge build

# Run tests
forge test -vvv

# Gas report
forge test --gas-report

# Deploy to Polygon Mumbai testnet
forge script script/Deploy.s.sol \
  --rpc-url $MUMBAI_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $POLYGONSCAN_API_KEY

# Deploy to Polygon Mainnet
forge script script/Deploy.s.sol \
  --rpc-url $POLYGON_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $POLYGONSCAN_API_KEY
```

---

## Deployment

| Service | Platform | Trigger |
|---|---|---|
| React Frontend | Vercel | Git push to `main` → auto-deploy |
| Express Backend | Render.com | Git push to `main` → auto-deploy |
| Python AI Service | Render.com | Git push to `main` → auto-deploy |
| MongoDB | MongoDB Atlas | Always on (cloud) |
| Redis Cache | Upstash | Always on (serverless) |
| File Storage | Cloudinary | Always on (cloud) |
| Blockchain (Dev) | Polygon Mumbai | `forge script` deploy |
| Blockchain (Prod) | Polygon Mainnet | `forge script` deploy |
| IPFS Files | Web3.Storage | On-demand upload |
| Error Tracking | Sentry | Auto (SDK integrated) |
| Uptime Monitor | UptimeRobot | Always on |

### CI/CD (GitHub Actions)

```
.github/workflows/
├── deploy-client.yml    # Vercel deploy on push to main
├── deploy-server.yml    # Render backend deploy on push to main
└── deploy-ai.yml        # Render AI service deploy on push to main
```

---

## Security

| Layer | Tool / Method | Description |
|---|---|---|
| Authentication | JWT Access (15min) + Refresh (7d) → Redis | Short-lived tokens with secure refresh |
| 2FA | Speakeasy TOTP | Required for all roles — email OTP or Google Authenticator |
| Password | bcryptjs (salt rounds: 12) | Hashed before storage |
| Authorization | Custom RBAC Middleware | Role checked on every protected route |
| Data Encryption | AES-256 (Node crypto) | Sensitive data encrypted at rest |
| Digital Signatures | node-forge PKI | Auditor signs reports with verifiable certificate |
| Rate Limiting | express-rate-limit | 100 requests/15 min per IP on public routes |
| Security Headers | Helmet.js | XSS, CSRF, clickjacking, HSTS protection |
| Input Sanitization | express-mongo-sanitize + validator.js | NoSQL injection + XSS prevention |
| CORS | cors npm | Whitelist only frontend domain |
| SSL/TLS | Let's Encrypt (auto) | HTTPS enforced on all endpoints |
| Admin Access | IP Whitelist middleware | Admin portal restricted to approved IPs |
| Blockchain | Multi-sig wallet + OpenZeppelin | Multi-sig for large transfers, audited contracts |

---

## MongoDB Collections

| Collection | Description |
|---|---|
| `users` | All platform users — role, email, passwordHash, walletAddress |
| `industries` | Industry profiles — companyName, sector, registrationDocs, complianceStatus |
| `auditors` | Auditor profiles — certifications, assignedIndustries, auditHistory |
| `governments` | Govt official profiles — department, designation, approvedBy |
| `emission_submissions` | Industry emission data — fuelData, electricityData, totalCO2e, status |
| `emission_baselines` | AI-calculated baselines — baselineValue, confidenceRange |
| `anomaly_reports` | AI detection results — riskScore, anomalyDetails, flagged |
| `audit_reports` | Auditor verifications — decision, remarks, PKI signature, blockchainHash |
| `carbon_credits` | Credit token records — tokenId, amount, status (active/listed/retired) |
| `transactions` | All credit transactions — type, from, to, amount, price, txHash |
| `marketplace_listings` | Active credit listings — sellerId, pricePerCredit, expiry, status |
| `penalties` | Industry penalties — amount, reason, paymentStatus |
| `policies` | Government policies — title, content, sector, effectiveDate |
| `notifications` | All notifications — userId, type, message, read |
| `activity_logs` | Full platform audit trail — userId, role, action, ip, timestamp |
| `emission_factors` | CO₂ calculation factors — fuelType, factor, unit, source |

---

## Non-Functional Requirements

### Performance Targets

| Metric | Target |
|---|---|
| Page load time (LCP) | < 2 seconds |
| API response time (cached) | < 100ms |
| API response time (non-cached) | < 500ms |
| AI anomaly detection response | < 3 seconds |
| Blockchain transaction confirmation | < 30 seconds (Polygon) |
| Real-time Socket.io event delivery | < 500ms |
| Concurrent users (free tier) | 500+ |
| Report PDF generation | < 10 seconds |

### Availability

| Metric | Target |
|---|---|
| Platform uptime | 99.5% (free tier) / 99.9% (scaled) |
| Database backup | Daily (MongoDB Atlas auto-backup) |
| Blockchain data durability | 100% (immutable by design) |
| Error recovery | Auto-restart via PM2 |

---

## Roadmap

| Phase | Weeks | Deliverables |
|---|---|---|
| **Phase 1 — Foundation** | 1–4 | Monorepo setup, auth system (JWT + 2FA + RBAC), Landing Page (L1/L4/L5), Admin Portal (AD1/AD2), Govt Verification (G5), all 16 Mongoose schemas, Foundry init |
| **Phase 2 — Core Workflow** | 5–8 | Industry Portal (I1/I2/I3), Emission Calculator, Python AI service (Isolation Forest + Baseline), Auditor Portal (A1/A2/A3), CarbonCredit.sol + AuditRegistry.sol deployed to Mumbai |
| **Phase 3 — Credit System** | 9–12 | CarbonMarketplace.sol + CreditRetirement.sol, Industry Wallet + Trading (I5), Govt Credit Oversight (G4), credit minting flow, Socket.io real-time, Public Portal (P1/P3), The Graph indexing |
| **Phase 4 — AI & Analytics** | 13–16 | Prophet + LSTM forecasting, fraud detection, reduction suggestions, What-If simulator, Govt AI Monitor (G3), ESG Report Generator, Leaflet emission map (P2) |
| **Phase 5 — Polish & Launch** | 17–20 | All 33 screens finalized, Polygon Mainnet deployment, security audit, Redis caching, GitHub Actions CI/CD, UptimeRobot + Sentry, UAT, Swagger + README docs |

---

## Compliance Standards

| Standard | Relevance |
|---|---|
| GHG Protocol | Emission calculation methodology (Scope 1, 2, 3) |
| IPCC Emission Factors | CO₂e calculation factors used in Emission Calculator |
| ISO 14064 | GHG emission quantification and reporting standard |
| W3C DID | On-chain identity standard for verified users |
| ERC-20 | Carbon credit token smart contract standard |
| GDPR | User data privacy, right to deletion, data retention |
| OWASP Top 10 | Web application security vulnerability prevention |
| OpenZeppelin Standards | Smart contract security and audit patterns |

---

## Glossary

| Term | Definition |
|---|---|
| tCO₂e | Tonnes of CO₂ equivalent — standard unit for measuring greenhouse gas emissions |
| Scope 1 | Direct emissions from owned/controlled sources (factory furnaces, company vehicles) |
| Scope 2 | Indirect emissions from purchased electricity, heat, or steam |
| Scope 3 | All other indirect emissions in the value chain (supply chain, transport, waste) |
| Baseline | Expected emission level for an industry, used to measure reduction or excess |
| Carbon Credit | A permit representing the right to emit one tonne of CO₂e, or proof of one tonne reduced |
| ERC-20 | Ethereum token standard for fungible tokens — used for carbon credit tokens |
| Isolation Forest | ML algorithm for anomaly detection that isolates outliers in data |
| Smart Contract | Self-executing code on blockchain that automatically enforces agreement terms |
| PKI | Public Key Infrastructure — system for digital certificates and signatures |
| IPFS | InterPlanetary File System — decentralized file storage protocol |
| GHG Protocol | Global standard for measuring and managing greenhouse gas emissions |
| ESG Report | Environmental, Social, and Governance compliance report |
| Polygon | EVM-compatible blockchain with low gas fees (~$0.001/tx) |
| Foundry | Fast Rust-based smart contract development framework (forge/anvil/cast/chisel) |
| RBAC | Role-Based Access Control — permissions assigned based on user role |

---

## License

This project is **Confidential & Proprietary** — EcoChain Platform © 2026. All rights reserved.

---

*EcoChain Platform | PRD Version 1.0 | March 2026*
