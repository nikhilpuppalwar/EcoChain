# 🚀 EcoChain Complete Setup & Deployment Guide

This guide provides a comprehensive step-by-step manual to set up, configure, and deploy the entire **EcoChain** full-stack application (React frontend, Node.js backend, and both Python FastAPI AI services) online using free-tier services.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Online Database Setup (MongoDB Atlas)](#2-online-database-setup-mongodb-atlas)
3. [Smart Contracts Deployment (Ethereum Sepolia Testnet)](#3-smart-contracts-deployment-ethereum-sepolia-testnet)
4. [AI Anomaly Service Deployment (Render)](#4-ai-anomaly-service-deployment-render)
5. [AI Report Generator Service Deployment (Render)](#5-ai-report-generator-service-deployment-render)
6. [Node.js Express Backend Deployment (Render)](#6-nodejs-express-backend-deployment-render)
7. [Vite React Frontend Deployment (Vercel)](#7-vite-react-frontend-deployment-vercel)
8. [Connecting and Verifying the Integration](#8-connecting-and-verifying-the-integration)

---

## 1. Prerequisites

Before starting, ensure you have:
* A **GitHub Account** and your project repository pushed (e.g., `https://github.com/nikhilpuppalwar/EcoChain`).
* A **MetaMask** browser extension installed.
* Accounts registered on **Vercel** (for frontend) and **Render** (for backend & AI services).
* An **Alchemy** developer account (for the Sepolia RPC url).

---

## 2. Online Database Setup (MongoDB Atlas)

To host your MongoDB database online:
1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/).
2. Create a new cluster and choose the **M0 Shared Free Tier** (choose any provider like AWS/GCP and region nearest to you).
3. Under **Database Access**, create a database user. Save the username and password.
4. Under **Network Access**, click **Add IP Address** and enter `0.0.0.0/0` (Allow access from anywhere). This is required so cloud platforms like Render can connect to your database.
5. Go to your cluster dashboard, click **Connect** -> **Drivers**, and copy the connection string. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/ecochain?retryWrites=true&w=majority
   ```
   *Replace `<password>` with the password you created for the database user.*

---

## 3. Smart Contracts Deployment (Ethereum Sepolia Testnet)

If you haven't deployed the smart contracts to Sepolia, perform the following steps in your terminal inside the `/contracts` directory:

1. **Get Sepolia Test ETH**:
   Go to [Alchemy Sepolia Faucet](https://sepoliafaucet.com/) or [QuickNode Faucet](https://faucet.quicknode.com/drip) and request free test tokens to your developer MetaMask address.

2. **Deploy Contracts via Foundry**:
   In the `contracts` directory, set your environment variables and execute the deploy script:
   ```powershell
   # Set environment variables for the deployment process
   $env:SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/zaQqZ5FkpkbS9x00cVjzV"
   $env:PRIVATE_KEY="YOUR_METAMASK_PRIVATE_KEY"

   # Deploy the contracts to Sepolia testnet
   forge script scripts/Deploy.s.sol --rpc-url $env:SEPOLIA_RPC_URL --broadcast

   # Export the ABIs and Addresses automatically to the frontend & backend
   node scripts/export_abis.js 11155111
   ```

3. **Verify Deployment**:
   Copy the deployed addresses from `contracts/broadcast/Deploy.s.sol/11155111/run-latest.json` or `web/src/contracts/addresses.json`.

---

## 4. AI Anomaly Service Deployment (Render)

This service serves the Isolation Forest ML model and resides in the `/ai` directory.

1. Log in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   * **Name**: `ecochain-ai-anomaly`
   * **Language**: `Python 3`
   * **Branch**: `main`
   * **Root Directory**: `ai`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Deploy Web Service**.
6. Copy the generated URL (e.g., `https://ecochain-ai-anomaly.onrender.com`).

---

## 5. AI Report Generator Service Deployment (Render)

This service auto-generates the BRSR docx report narratives and resides in the `/ai/Report_Generator` directory.

1. Log in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   * **Name**: `ecochain-ai-reports`
   * **Language**: `Python 3`
   * **Branch**: `main`
   * **Root Directory**: `ai/Report_Generator`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn backend.api:app --host 0.0.0.0 --port $PORT`
5. Go to the **Environment Variables** tab and click **Add Environment Variable**:
   * Key: `OPENROUTER_API_KEY`
   * Value: `your_openrouter_api_key` *(If you have one; otherwise leave blank to fallback to built-in templates)*
6. Click **Deploy Web Service**.
7. Copy the generated URL (e.g., `https://ecochain-ai-reports.onrender.com`).

---

## 6. Node.js Express Backend Deployment (Render)

The main API backend resides in the `/backend` directory.

1. Log in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   * **Name**: `ecochain-backend`
   * **Language**: `Node`
   * **Branch**: `main`
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Go to the **Environment Variables** tab and add the following keys:

| Environment Variable | Recommended Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | *Your MongoDB Atlas connection string from Step 2* |
| `JWT_SECRET` | *A random secure string (e.g., `9c43a0e5b7bdf01`)* |
| `JWT_REFRESH_SECRET` | *Another random secure string* |
| `JWT_ACCESS_EXPIRES` | `15m` |
| `JWT_REFRESH_EXPIRES` | `7d` |
| `HACKATHON_MODE` | `true` |
| `RPC_URL` | `https://eth-sepolia.g.alchemy.com/v2/zaQqZ5FkpkbS9x00cVjzV` |
| `GOV_PRIVATE_KEY` | *Your developer MetaMask private key (used to sign credit mints)* |
| `CARBON_CREDIT_ADDRESS` | *The deployed contract address from Step 3* |
| `AUDIT_REGISTRY_ADDRESS` | *The deployed contract address from Step 3* |
| `CARBON_MARKETPLACE_ADDRESS` | *The deployed contract address from Step 3* |
| `CREDIT_RETIREMENT_ADDRESS` | *The deployed contract address from Step 3* |
| `AI_SERVICE_URL` | *Your AI Anomaly Service URL from Step 4* |
| `PYTHON_REPORT_API_URL` | *Your AI Report Service URL from Step 5 + `/generate-report`* (e.g., `https://ecochain-ai-reports.onrender.com/generate-report`) |

6. Click **Deploy Web Service** and copy the generated Backend URL (e.g., `https://ecochain-backend.onrender.com`).

---

## 7. Vite React Frontend Deployment (Vercel)

The React web interface resides in the `/web` directory.

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `web` (Click edit and select the `web` folder)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Under **Environment Variables**, add the API variable:
   * Name: `VITE_API_URL`
   * Value: `https://ecochain-backend.onrender.com/api` *(Replace with your deployed backend URL from Step 6 + `/api`)*
6. Click **Deploy**.
7. Vercel will build and output your production build. Copy the live application URL (e.g., `https://ecochain-web.vercel.app`).

---

## 8. Connecting and Verifying the Integration

Once all services are deployed, perform the following verification:

1. **Database Verification**:
   Log in to MongoDB Atlas and ensure the collections are populated when you register a new account on your live frontend.
2. **MetaMask Network Configuration**:
   Open MetaMask, click the network selector, and verify it is connected to the **Sepolia Test Network**.
3. **On-Chain Seed Check**:
   Register a new organization on your Vercel URL, connect your MetaMask, and complete the registration. Check the console or your MetaMask wallet to verify that **5,000 CCR** tokens were automatically minted and received on-chain!
