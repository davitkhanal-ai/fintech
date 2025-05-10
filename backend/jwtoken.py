import jwt
from datetime import datetime, timedelta
import os

# Define your secret key (must match the one used for verification in your app)
secret_key = 'your_secret_key_here'
# Ensure the secret key is securely stored and retrieved
# For example, you can use environment variables to store the secret key

# Retrieve the secret key from an environment variable
secret_key = os.getenv('JWT_SECRET_KEY', 'default_secret_key')  # Replace 'default_secret_key' with a fallback if needed
# Define the payload (data to encode in the JWT)
payload = {
    'sub': 'identifier',  # The subject of the token, e.g., user ID
    'name': 'davit',  # You can add additional data in the payload
    'exp': datetime.utcnow() + timedelta(hours=1)  # Token expiry time
}

# Generate the token
token = jwt.encode(payload, secret_key, algorithm='HS256')

print("Generated JWT:", token)