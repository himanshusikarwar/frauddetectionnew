# MongoDB data export (share with others)

This folder holds JSON exports of the fraud-warning MongoDB data.

## How to create the data files (your side)

1. Ensure MongoDB is running and the app has been used (or seed run) so there is data.
2. From the backend directory run:
   ```bash
   npm run export:data
   ```
   Or: `node scripts/exportMongoData.js`

3. This creates (or updates) in this folder:
   - **activitylogs.json** – activity log documents
   - **alerts.json** – alert documents
   - **users.json** – user documents (if any)

4. Share this **data** folder (or zip it) and send it to the other person.

## How to load the data (recipient’s side)

1. Copy the **data** folder into the project’s `backend/` directory (same place as this README).
2. Ensure MongoDB is running and `MONGO_URI` in `.env` points to their database (or use default `mongodb://localhost:27017/fraud_warning_system`).
3. From the backend directory run:
   ```bash
   npm run import:data
   ```
   Or: `node scripts/importMongoData.js`

4. The script will replace activity logs and alerts with the imported data. Users are only imported if the database has no users yet (to avoid overwriting existing logins).

## File locations

- Export script: `backend/scripts/exportMongoData.js`
- Import script: `backend/scripts/importMongoData.js`
- Data folder: **`backend/data/`** (this folder)
