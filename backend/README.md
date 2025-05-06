# Finance Tracker Backend

This is the backend for the Finance Tracker application, built with Flask and MySQL.

## Setup Instructions

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the MySQL database credentials
   - Set a secure JWT secret key

3. Initialize the database:
   - Create a MySQL database named `finance_tracker`
   - The application will automatically create the necessary tables on startup

4. Run the development server:
   ```
   python app.py
   ```

The server will start at http://127.0.0.1:5000 by default.

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - User login

### Accounts
- `GET /api/accounts` - Get all accounts for the logged-in user
- `POST /api/accounts` - Create a new account
- `PUT /api/accounts/<id>` - Update an account
- `DELETE /api/accounts/<id>` - Delete an account

### Transactions
- `GET /api/transactions` - Get all transactions (can filter by account)
- `POST /api/transactions` - Create a new transaction
- `DELETE /api/transactions/<id>` - Delete a transaction

### Dashboard
- `GET /api/dashboard` - Get dashboard data