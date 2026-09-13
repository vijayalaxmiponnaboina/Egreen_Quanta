# Egreen Quanta — SIH26140

Complete focused starter: Frontend + Flask Backend + MySQL database.

## 1. MySQL
Open MySQL Workbench and run `database/schema.sql`.
If your MySQL password is not `root`, change DB password in `backend/app.py`.

## 2. Backend
Open terminal inside `backend`:
`python -m venv venv`
`venv\\Scripts\\activate` (Windows)
`pip install -r requirements.txt`
`python app.py`

Backend: http://localhost:5000

## 3. Frontend
Open `frontend/index.html` using VS Code Live Server.
Frontend calls Flask APIs; frontend does NOT connect directly to MySQL.

## Architecture
Frontend -> Flask REST API -> MySQL

## Note
The demo authentication stores passwords as plain text. For a real deployment, use password hashing and proper authentication/session handling.
