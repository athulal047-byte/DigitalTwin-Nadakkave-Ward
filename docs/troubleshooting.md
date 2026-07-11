# Troubleshooting & FAQ

## Common Issues

### 1. Dashboard displays "Network Error" or endless loading spinners
**Cause:** The React Dashboard cannot reach the Node.js API.
**Solution:**
- Ensure the backend server is running (`node server.js` in the `backend/` folder).
- Check that the backend is listening on the correct port (default is `3000`).
- Open your browser's Developer Console (F12) and check if CORS policies are blocking the request.

### 2. Backend throws "Password authentication failed for user 'postgres'"
**Cause:** Incorrect database credentials in the `.env` file.
**Solution:**
- Open `backend/.env`.
- Verify `DB_USER` and `DB_PASS` exactly match your local PostgreSQL 17 installation.
- Verify `DB_NAME=nadakkave`.

### 3. Missing data on specific dashboard charts
**Cause:** The tables exist but are empty in the PostgreSQL database.
**Solution:**
- Check your pgAdmin or PSQL CLI. Ensure you have populated the tables (`buildings`, `citizen_profiles`) with the sample data provided during installation, or write a custom INSERT query to populate testing data.

### 4. Unreal Engine Web Browser Widget shows a blank white screen
**Cause:** The engine cannot resolve the `localhost` URL or a plugin is disabled.
**Solution:**
- Ensure the "Web Browser" plugin is enabled in your Unreal Engine project settings.
- Verify that the React Dashboard is actually running (`npm run dev`) and accessible via `http://localhost:5173` (or your Vite port) before launching the UE5 simulation.
