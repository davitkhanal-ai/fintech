import os
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from functools import wraps

import jwt
import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)


# Database configuration
db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "finance_tracker"),
}


def get_db_connection():
    return mysql.connector.connect(**db_config)


# Initialize database
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create accounts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # Create transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        account_id INT NOT NULL,
        type ENUM('income', 'expense', 'transfer') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description VARCHAR(255),
        transfer_to_account_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (transfer_to_account_id) REFERENCES accounts(id) ON DELETE SET NULL
    )
    """)

    conn.commit()
    cursor.close()
    conn.close()


# Initialize database on startup
init_db()

def convert_decimal(obj):
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj


# Authentication routes
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed_password),
        )
        conn.commit()
        user_id = cursor.lastrowid

        # Create a default account for the user
        cursor.execute(
            "INSERT INTO accounts (user_id, name, balance) VALUES (%s, %s, %s)",
            (user_id, "Main Account", 0.00),
        )
        conn.commit()

        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)

        return jsonify(
            {
                "message": "User registered successfully",
                "tokens": {
                    "access": access_token,
                    "refresh": refresh_token,
                    "username": username,
                    "email": email,
                    "user_id": user_id,
                    "balance": 0.00,
                    "account_id": cursor.lastrowid,
                },
            }
        ), 201

    except mysql.connector.Error as err:
        if err.errno == 1062:  # Duplicate entry error
            return jsonify({"error": "Username or email already exists"}), 409
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username_or_email = data.get("username")
    password = data.get("password")

    if not username_or_email or not password:
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Fetch user by username or email
        cursor.execute(
            "SELECT id, username, email, password FROM users WHERE username = %s OR email = %s",
            (username_or_email, username_or_email),
        )
        user = cursor.fetchone()
        # Consume any remaining results
        cursor.fetchall()

        if not user or not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid credentials"}), 401

        print(f"User found: {user['username']}")

        # Fetch user's account
        cursor.execute(
            "SELECT id, balance FROM accounts WHERE user_id = %s", (user["id"],)
        )
        account = cursor.fetchone()
        # Consume any remaining results
        cursor.fetchall()

        # Generate JWT tokens
        access_token = create_access_token(identity=str(user["id"]))
        refresh_token = create_refresh_token(identity=str(user["id"]))

        return jsonify(
            {
                "message": "Login successful",
                "tokens": {
                    "access": access_token,
                    "refresh": refresh_token,
                    "username": user["username"],
                    "email": user["email"],
                    "user_id": user["id"],
                    "balance": float(account["balance"]) if account else 0.00,
                    "account_id": account["id"] if account else None,
                },
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# Account routes
@app.route("/api/accounts", methods=["GET"])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, name, balance, created_at FROM accounts WHERE user_id = %s",
            (user_id,),
        )
        accounts = cursor.fetchall()
        # Convert Decimal to float for balance
        for account in accounts:
            if isinstance(account["balance"], Decimal):
                account["balance"] = float(account["balance"])

        return jsonify({"accounts": accounts}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/accounts", methods=["POST"])
@jwt_required()
def create_account():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get("name")
    initial_balance = data.get("balance", "0.00")

    if not name:
        return jsonify({"error": "Account name is required"}), 400

    # Convert balance to Decimal for precision
    try:
        initial_balance = Decimal(initial_balance)
    except InvalidOperation:
        return jsonify({"error": "Invalid balance value"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO accounts (user_id, name, balance) VALUES (%s, %s, %s)",
            (user_id, name, initial_balance),
        )
        conn.commit()

        account_id = cursor.lastrowid

        if initial_balance > 0:
            # Create initial deposit transaction
            cursor.execute(
                "INSERT INTO transactions (user_id, account_id, type, amount, description) VALUES (%s, %s, %s, %s, %s)",
                (user_id, account_id, "income", initial_balance, "Initial balance"),
            )
            conn.commit()

        return jsonify(
            {"message": "Account created successfully", "account_id": account_id}
        ), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/accounts/<int:account_id>", methods=["PUT"])
@jwt_required()
def update_account(account_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Account name is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "UPDATE accounts SET name = %s WHERE id = %s AND user_id = %s",
            (name, account_id, user_id),
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Account not found or not authorized"}), 404

        return jsonify({"message": "Account updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/accounts/<int:account_id>", methods=["DELETE"])
@jwt_required()
def delete_account(account_id):
    user_id = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "DELETE FROM accounts WHERE id = %s AND user_id = %s", (account_id, user_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Account not found or not authorized"}), 404

        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    account_id = request.args.get("account_id")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        if account_id:
            cursor.execute(
                """
                SELECT t.*, a.name as account_name,
                CASE WHEN t.transfer_to_account_id IS NOT NULL THEN a2.name ELSE NULL END as transfer_to_account_name
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                LEFT JOIN accounts a2 ON t.transfer_to_account_id = a2.id
                WHERE t.user_id = %s AND t.account_id = %s
                ORDER BY t.created_at DESC
                """,
                (user_id, account_id),
            )
        else:
            cursor.execute(
                """
                SELECT t.*, a.name as account_name,
                CASE WHEN t.transfer_to_account_id IS NOT NULL THEN a2.name ELSE NULL END as transfer_to_account_name
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                LEFT JOIN accounts a2 ON t.transfer_to_account_id = a2.id
                WHERE t.user_id = %s
                ORDER BY t.created_at DESC
                """,
                (user_id,),
            )

        transactions = cursor.fetchall()
        return jsonify({"transactions": convert_decimal(transactions)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decimal import Decimal, InvalidOperation

@app.route("/api/transactions", methods=["POST"])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()

    account_id = data.get("account_id")
    transaction_type = data.get("type")
    amount = data.get("amount")
    description = data.get("description", "")
    transfer_to_account_id = data.get("transfer_to_account_id")

    if not account_id or not transaction_type or not amount:
        return jsonify({"error": "Account ID, type, and amount are required"}), 400

    if transaction_type not in ["income", "expense", "transfer"]:
        return jsonify({"error": "Invalid transaction type"}), 400

    if transaction_type == "transfer" and not transfer_to_account_id:
        return jsonify({"error": "Transfer destination account is required"}), 400

    try:
        amount = Decimal(str(amount))
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
    except (InvalidOperation, ValueError):
        return jsonify({"error": "Invalid amount"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Start transaction
        conn.start_transaction()

        # Verify account ownership
        cursor.execute(
            "SELECT id, balance FROM accounts WHERE id = %s AND user_id = %s",
            (account_id, user_id),
        )
        account = cursor.fetchone()

        if not account:
            conn.rollback()
            return jsonify({"error": "Account not found or not authorized"}), 404

        # For transfers, verify the destination account
        if transaction_type == "transfer":
            cursor.execute(
                "SELECT id FROM accounts WHERE id = %s AND user_id = %s",
                (transfer_to_account_id, user_id),
            )
            destination_account = cursor.fetchone()

            if not destination_account:
                conn.rollback()
                return jsonify(
                    {"error": "Destination account not found or not authorized"}
                ), 404

        # Update balances
        if transaction_type == "income":
            new_balance = account["balance"] + amount
            cursor.execute(
                "UPDATE accounts SET balance = %s WHERE id = %s",
                (new_balance, account_id),
            )
        elif transaction_type == "expense":
            if account["balance"] < amount:
                conn.rollback()
                return jsonify({"error": "Insufficient funds"}), 400

            new_balance = account["balance"] - amount
            cursor.execute(
                "UPDATE accounts SET balance = %s WHERE id = %s",
                (new_balance, account_id),
            )
        elif transaction_type == "transfer":
            if account["balance"] < amount:
                conn.rollback()
                return jsonify({"error": "Insufficient funds for transfer"}), 400

            # Deduct from source account
            cursor.execute(
                "UPDATE accounts SET balance = balance - %s WHERE id = %s",
                (amount, account_id),
            )

            # Add to destination account
            cursor.execute(
                "UPDATE accounts SET balance = balance + %s WHERE id = %s",
                (amount, transfer_to_account_id),
            )

        # Insert transaction
        cursor.execute(
            """
            INSERT INTO transactions
            (user_id, account_id, type, amount, description, transfer_to_account_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                account_id,
                transaction_type,
                amount,
                description,
                transfer_to_account_id if transaction_type == "transfer" else None,
            ),
        )

        transaction_id = cursor.lastrowid
        conn.commit()

        return jsonify({
            "message": "Transaction created successfully",
            "transaction_id": transaction_id
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/transactions/<int:transaction_id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Start transaction
        conn.start_transaction()

        # Get transaction details
        cursor.execute(
            """
            SELECT t.*, a.balance as source_balance,
            CASE WHEN t.transfer_to_account_id IS NOT NULL THEN a2.balance ELSE NULL END as dest_balance
            FROM transactions t
            JOIN accounts a ON t.account_id = a.id
            LEFT JOIN accounts a2 ON t.transfer_to_account_id = a2.id
            WHERE t.id = %s AND t.user_id = %s
            """,
            (transaction_id, user_id),
        )
        transaction = cursor.fetchone()

        if not transaction:
            conn.rollback()
            return jsonify({"error": "Transaction not found or not authorized"}), 404

        # Reverse the transaction effect on balances
        if transaction["type"] == "income":
            # Deduct the amount from the account
            if transaction["source_balance"] < transaction["amount"]:
                conn.rollback()
                return jsonify(
                    {
                        "error": "Cannot delete transaction: would result in negative balance"
                    }
                ), 400

            cursor.execute(
                "UPDATE accounts SET balance = balance - %s WHERE id = %s",
                (transaction["amount"], transaction["account_id"]),
            )
        elif transaction["type"] == "expense":
            # Add the amount back to the account
            cursor.execute(
                "UPDATE accounts SET balance = balance + %s WHERE id = %s",
                (transaction["amount"], transaction["account_id"]),
            )
        elif transaction["type"] == "transfer":
            # Add back to source account
            cursor.execute(
                "UPDATE accounts SET balance = balance + %s WHERE id = %s",
                (transaction["amount"], transaction["account_id"]),
            )

            # Deduct from destination account
            if transaction["dest_balance"] < transaction["amount"]:
                conn.rollback()
                return jsonify(
                    {
                        "error": "Cannot delete transaction: would result in negative balance in destination account"
                    }
                ), 400

            cursor.execute(
                "UPDATE accounts SET balance = balance - %s WHERE id = %s",
                (transaction["amount"], transaction["transfer_to_account_id"]),
            )

        # Delete the transaction
        cursor.execute("DELETE FROM transactions WHERE id = %s", (transaction_id,))

        # Commit transaction
        conn.commit()

        return jsonify({"message": "Transaction deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# Dashboard data
@app.route("/api/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_data():
    print(get_jwt_identity())
    user_id = str(get_jwt_identity())

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get accounts summary
        cursor.execute(
            "SELECT id, name, balance FROM accounts WHERE user_id = %s", (user_id,)
        )
        accounts = cursor.fetchall()
        # Convert Decimal to float in accounts
        for account in accounts:
            if isinstance(account["balance"], Decimal):
                account["balance"] = float(account["balance"])

        # Get total balance
        cursor.execute(
            "SELECT SUM(balance) as total_balance FROM accounts WHERE user_id = %s",
            (user_id,),
        )
        total_balance = cursor.fetchone()["total_balance"] or 0
        # Convert Decimal to float for total_balance
        if isinstance(total_balance, Decimal):
            total_balance = float(total_balance)

        # Get recent transactions
        cursor.execute(
            """
            SELECT t.*, a.name as account_name,
            CASE WHEN t.transfer_to_account_id IS NOT NULL THEN a2.name ELSE NULL END as transfer_to_account_name
            FROM transactions t
            JOIN accounts a ON t.account_id = a.id
            LEFT JOIN accounts a2 ON t.transfer_to_account_id = a2.id
            WHERE t.user_id = %s
            ORDER BY t.created_at DESC
            LIMIT 5
            """,
            (user_id,),
        )
        recent_transactions = cursor.fetchall()
        # Convert Decimal to float in transactions (e.g., amount)
        for transaction in recent_transactions:
            for key, value in transaction.items():
                if isinstance(value, Decimal):
                    transaction[key] = float(value)

        # Get monthly income/expense summary
        cursor.execute(
            """
            SELECT
                MONTH(created_at) as month,
                YEAR(created_at) as year,
                type,
                SUM(amount) as total
            FROM transactions
            WHERE user_id = %s AND type IN ('income', 'expense')
            GROUP BY YEAR(created_at), MONTH(created_at), type
            ORDER BY YEAR(created_at) DESC, MONTH(created_at) DESC
            LIMIT 12
            """,
            (user_id,),
        )
        monthly_summary = cursor.fetchall()
        # Convert Decimal to float in monthly_summary
        for summary in monthly_summary:
            if isinstance(summary["total"], Decimal):
                summary["total"] = float(summary["total"])

        return jsonify(
            {
                "accounts": accounts,
                "total_balance": total_balance,
                "recent_transactions": recent_transactions,
                "monthly_summary": monthly_summary,
            }
        ), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    app.run(debug=True)
