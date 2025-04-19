import os 
import jwt 
from functools import wraps 
from flask import request
from utils.responses import error_response
from constants.status import StatusCode 
from datetime import datetime, timedelta, timezone

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGO = os.getenv("JWT_ALGO")

def require_authentication(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print("IS IT EVEN PULLING UP HERE?")
        auth_header = request.headers.get("Authorization", None)
        if not auth_header or not auth_header.startswith("Bearer"):
            return error_response(error="Missing or invalid token", status_code=StatusCode.UNAUTHORIZED)
        
        token = auth_header.split(" ")[1]
        try: 
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
            request.user = payload 
        except jwt.ExpiredSignatureError:
            return error_response(error="Token has expired", status_code=StatusCode.UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return error_response(error="Invalid token", status_code=StatusCode.UNAUTHORIZED)
        
        return f(*args, **kwargs)
    return decorated_function


def generate_jwt_token(email: str):
    payload = {
        "email": email, 
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)  # Token expires in 1 hour
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    return token