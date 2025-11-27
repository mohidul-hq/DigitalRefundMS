# Refund Dashboard (Vite + React + Appwrite)

A minimal customer refund management dashboard using React (Vite) and Appwrite. Create, list, and process refunds based on your Appwrite collection.

## Setup

1. Ensure you have Node.js 18+ installed.
2. In Appwrite, create a Database and Collection with fields matching (current app expectation):
   - `Reference_Number` (string, required)
   - `Amount` (string, required) – stored as string, parsed to number for totals
   - `Date` (datetime)
   - `Closing_Date` (datetime)
   - `Refund_Date` (datetime)
   - `Mode_Refund` (string)
   - `Remark` (string)
   - `Contact` (string, required, size ≤ 100)
   - `Status` (boolean, required) – `false` = Pending, `true` = Paid

3. Copy `.env.example` to `.env.local` and fill values:

```
VITE_APPWRITE_ENDPOINT=https://YOUR-APPWRITE-ENDPOINT/v1
VITE_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID
VITE_APPWRITE_DATABASE_ID=YOUR_DATABASE_ID
VITE_APPWRITE_COLLECTION_ID=YOUR_COLLECTION_ID
```

Connectivity tip: After configuring env vars, the dashboard performs a lightweight ping. If you see "Connection issue detected" ensure:
* Endpoint includes `/v1`
* Your web app origin is added to Appwrite's CORS list
* Project + database + collection IDs are correct

## Install & Run

```powershell
cd "B:\Play Ground\Refund MS\refund-dashboard-vite"
npm install
npm run dev
```

The app opens on `http://localhost:5173`.

## Notes

- The UI mirrors your sample (dark cards + table).
- `+ New Refund` creates a refund with `Status = false` (Pending).
- `Process Refund` sets `Status = true` and stamps `Refund_Date`.
- Contact field is required and stored in `Contact`.

## Troubleshooting Connectivity

If you see a banner "Connection issue" with details:

1. Client not configured: Ensure `VITE_APPWRITE_ENDPOINT` ends with `/v1` and project ID is correct.
2. Database/Collection ID missing: Add IDs to `.env` (use raw IDs from console, not names).
3. List stage error patterns:
   - CORS: Add `http://localhost:5173` as an allowed origin (Project Settings > Platforms).
   - Not Found (404): Verify you copied IDs (Database > Overview > ID; Collection > Overview > ID).
   - Unauthorized (401/permission): Set collection read permissions to role:all or configure API keys/session.
   - Network/Failed to fetch: Endpoint unreachable; confirm cloud region and network access.

Use the Retry Ping button after adjustments.

## Deploy to GitHub Pages

Repository: https://github.com/mohidul-hq/DigitalRefundMS

This project is preconfigured to deploy with GitHub Actions to GitHub Pages:

1. Ensure your local repo points to GitHub:
   ```powershell
   cd "B:\Play Ground\Refund MS\refund-dashboard-vite"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/mohidul-hq/DigitalRefundMS.git
   git push -u origin main
   ```
2. In GitHub, open Settings > Pages and set Source to "GitHub Actions".
3. Pushes to `main` will build and deploy automatically to GitHub Pages.
4. Your site will be available at: `https://mohidul-hq.github.io/DigitalRefundMS/`.

Notes:
- `vite.config.js` sets `base: '/DigitalRefundMS/'` so assets load from the subpath.
- If you rename the repository, update `base` accordingly.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
