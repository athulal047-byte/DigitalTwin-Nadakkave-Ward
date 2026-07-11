# Installation Guide

This guide covers the local setup of the three primary subsystems: Database, Backend API, and Frontend Dashboard. 
*(Note: Setting up the Unreal Engine project requires Epic Games Launcher and UE 5.4+).*

## Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL 17
*   Git

## 1. Database Setup
1. Open pgAdmin 4 or your PSQL CLI.
2. Create a new database named `nadakkave`.
3. Locate the SQL schema files inside the `database/` directory.
4. Execute the SQL files to generate the required tables (`buildings`, `citizen_profiles`, etc.).

## 2. Backend API Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary Node.js dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` to `.env` and fill in your PostgreSQL credentials:
   ```bash
   cp .env.example .env
   ```
4. Start the Express server:
   ```bash
   node server.js
   ```
   *The server should now be listening on `http://localhost:3000`.*

## 3. Frontend Dashboard Setup
1. Open a new terminal window and navigate to the dashboard directory:
   ```bash
   cd dashboard
   ```
2. Install the React dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the provided localhost URL in your browser. The dashboard should now successfully query your running Node.js backend to populate the UI.
