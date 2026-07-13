# Backend API Structure

The `backend/` directory holds the Node.js/Express application. I built this layer specifically to act as the middle-tier for the Digital Twin ecosystem.

## Design Philosophy
I designed the backend exclusively to interface between the PostgreSQL database and the React Dashboard. I intentionally decoupled it completely from the Unreal Engine simulation. If I had built the SQL queries directly into UE5, any network latency would have blocked the C++ rendering thread and tanked the framerate. By pushing all the data retrieval to this asynchronous Node.js layer, the 3D environment maintains a solid 60 FPS while the React UI waits for the JSON payloads to return.

## Core Modules
I organized the backend RESTful API endpoints around strict municipal domains:

*   **`routes/`**: Contains the Express router configurations. This handles everything from fetching specific building histories to submitting citizen grievances or tracking work order SLA compliance.
*   **Authentication & Security**: The API uses JWT (JSON Web Tokens) in HttpOnly cookies to secure all administrative routes. My `server.js` implementation forcefully checks token validity before allowing any write operations to hit the database.
*   **Database Management**: The backend previously managed the SQL schemas and JavaScript-based database seeders. I moved the raw SQL migration files to the root `database/migrations/` directory for easier reference.

## Environment Configuration
The backend requires a `.env` file (copy `.env.example` to start) to establish the connection pool with the PostgreSQL instance. 

You must configure the following critical variables:
*   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` (which defaults to `nadakkave`).
*   `JWT_SECRET` for secure, cryptographically signed authentication tokens.
