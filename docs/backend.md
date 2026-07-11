# Backend API Structure

The `backend/` directory contains the Node.js/Express application that serves as the middle-tier for the Digital Twin ecosystem.

## Design Philosophy
The backend is designed exclusively to interface between the PostgreSQL database and the React Dashboard. It is completely decoupled from the Unreal Engine simulation, ensuring that the 3D rendering thread is never blocked by database query latency. 

## Core Modules
The backend API exposes RESTful endpoints, organized around municipal domains:

*   **`routes/`**: Contains the express router configurations for various endpoints (e.g., fetching building histories, submitting citizen grievances, updating tax status).
*   **Authentication**: Uses JWT (JSON Web Tokens) to secure administrative routes. The `server.js` implementation checks token validity before allowing write operations to the database.
*   **Migrations**: The original SQL schema setups and JavaScript-based database seeders are located here (and have been copied to the root `database/` directory for reference).

## Environment Configuration
The backend relies on a `.env` file (see `.env.example`) to connect to the PostgreSQL instance. 
Crucial variables include:
*   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` (must be `nadakkave`).
*   `JWT_SECRET` for secure token signing.
