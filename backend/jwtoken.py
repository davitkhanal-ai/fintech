import jwt
from datetime import datetime, timedelta

# Define your secret key (must match the one used for verification in your app)
secret_key = 'your_secret_key_here'

# Define the payload (data to encode in the JWT)
payload = {
    'sub': 'identifier',  # The subject of the token, e.g., user ID
    'name': 'davit',  # You can add additional data in the payload
    'exp': datetime.utcnow() + timedelta(hours=1)  # Token expiry time
}

# Generate the token
token = jwt.encode(payload, secret_key, algorithm='HS256')

print("Generated JWT:", token)