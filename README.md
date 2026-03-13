# Study Schedule

A modern web app for creating and managing study timetables subject-wise. Plan topics on the weekdays you choose, set how many topics per day, track progress, and reschedule automatically when you miss a session.

---

## Running on Windows (after downloading from Git)

Follow these steps on a **Windows** machine after you have cloned or downloaded the project from the Git repo.

### 1. Prerequisites

Install these on your Windows laptop (if not already installed):

| Tool | Purpose | How to install |
|------|---------|----------------|
| **Node.js** (v18 or v20 recommended) | Runs the app and npm | Download the **LTS** installer from [nodejs.org](https://nodejs.org/) and run it. Check "Add to PATH" when prompted. |
| **npm** | Comes with Node.js | No separate install; verify with `npm -v` in a new terminal. |
| **Git** (optional) | Only if you clone the repo with Git | Download from [git-scm.com](https://git-scm.com/download/win). |

**Verify installations** (open **Command Prompt** or **PowerShell** and run):

```cmd
node -v
npm -v
```

You should see version numbers (e.g. `v20.x.x` and `10.x.x`).

---

### 2. Get the project on your machine

**Option A – Clone with Git**

```cmd
git clone <your-repo-url>
cd daily_study_schedule
```

Replace `<your-repo-url>` with the actual Git URL (e.g. `https://github.com/username/daily_study_schedule.git`).

**Option B – Downloaded as ZIP**

1. Unzip the folder (e.g. `daily_study_schedule-main`) to a location like `C:\Users\YourName\Projects\`.
2. Open **Command Prompt** or **PowerShell**.
3. Go into the project folder:

   ```cmd
   cd C:\Users\YourName\Projects\daily_study_schedule-main
   ```

   (Use the real path where you unzipped it.)

---

### 3. Install dependencies

In the same terminal, from the **project root** (the folder that contains `package.json`):

```cmd
npm install
```

Wait until it finishes. If you see errors about permissions, try:

- Running the terminal as **Administrator**, or  
- Using a path without spaces (e.g. `C:\Projects\daily_study_schedule`).

---

### 4. Environment file

Create a `.env` file so the app can find the database.

**Command Prompt:**

```cmd
copy .env.example .env
```

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

Then open `.env` in Notepad or any editor. It should contain something like:

```env
DATABASE_URL="file:./dev.db"
```

Leave it as is for SQLite on Windows. Save and close the file.

---

### 5. Database setup

Run these commands **one by one** in the same terminal, from the project root.

**Step 1 – Generate Prisma client**

```cmd
npx prisma generate
```

If you see an error like **“unable to get local issuer certificate”** (common on corporate networks):

```cmd
set NODE_TLS_REJECT_UNAUTHORIZED=0
npx prisma generate
```

Then run the next commands.

**Step 2 – Create the database and tables**

```cmd
npx prisma migrate dev --name init
```

This creates the SQLite file `prisma\dev.db` and all tables.

**Step 3 – Seed demo data (optional)**

```cmd
npm run db:seed
```

This adds a demo user and sample subject so you can try the app immediately.

---

### 6. Run the app

Start the development server:

```cmd
npm run dev
```

You should see something like:

```
▲ Next.js 15.x.x
- Local:   http://localhost:3000
✓ Ready in 2s
```

---

### 7. Open the app in your browser

1. Open **Chrome**, **Edge**, or **Firefox**.
2. Go to: **http://localhost:3000**
3. On the home page, click **“Get started”** or **“Demo login”**.
4. Click **“Continue as Demo”** to sign in and use the app.

To stop the server, press **Ctrl + C** in the terminal.

---

### 8. Troubleshooting (Windows)

| Problem | What to try |
|--------|-------------|
| **`node` or `npm` not found** | Reinstall Node.js from [nodejs.org](https://nodejs.org/) and tick “Add to PATH”. Close and reopen the terminal. |
| **Port 3000 already in use** | Stop any other app using port 3000, or run on another port: `set PORT=3001 && npm run dev`, then open http://localhost:3001 |
| **Prisma “unable to get local issuer certificate”** | Run `set NODE_TLS_REJECT_UNAUTHORIZED=0` in the same terminal before `npx prisma generate` (and migrate). |
| **Long path / path too long errors** | Move the project to a short path, e.g. `C:\proj\study` and run commands from there. |
| **Permission denied when running npm** | Run Command Prompt or PowerShell as Administrator, or install Node for your user only. |
| **Blank or error page at localhost:3000** | Ensure `npm run dev` is still running and you ran `npx prisma generate` and `npx prisma migrate dev` successfully. |

---

## Setup (all platforms)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   ```bash
   cp .env.example .env
   ```
   On Windows (CMD): `copy .env.example .env`  
   Default `DATABASE_URL="file:./dev.db"` (SQLite). For PostgreSQL later, set the connection URL.

3. **Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```
   You must run `npx prisma generate` before `npm run build` or the app will not compile. If you prefer to apply the included migration SQL manually, create `prisma/dev.db` and run the SQL in `prisma/migrations/0_init/migration.sql`, then run `npx prisma generate` and `npm run db:seed`.

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Use **Demo login** to sign in as the seeded user.

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run db:generate` – Generate Prisma client
- `npm run db:migrate` – Run migrations
- `npm run db:seed` – Seed demo data
- `npm run db:studio` – Open Prisma Studio

## Features

- **Subjects**: Create subjects, set study weekdays (Mon–Sun), and topics per day (1–10).
- **Topics**: Add topics manually, paste a list (newlines/bullets/comma-separated), or upload a PDF to extract headings.
- **Schedule**: Generate a schedule from a start date; topics are assigned only on selected weekdays.
- **Today**: Mark sessions as Completed or Not studied; “Not studied” reschedules remaining topics forward on valid days.
- **Calendar**: Monthly view of scheduled sessions (completed / missed / upcoming).
- **Progress**: Per-subject and overall completion.

## Data persistence

All data is stored in a **database** (SQLite by default). Subjects, topics, study-day preferences, and schedule entries are persisted in `prisma/dev.db`. For production you can switch to PostgreSQL by setting `DATABASE_URL` in `.env`. No data is stored only in memory.

## Tech Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Prisma, SQLite (PostgreSQL-ready)
- React Hook Form, Zod, Zustand, date-fns, pdf-parse, jspdf (schedule PDF export)
