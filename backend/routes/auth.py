from flask import Blueprint, request, jsonify 
from utils.database import get_collection
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime 
import logging 
from utils.responses import *
from utils.validations import *
from constants.status import *
from utils.jwt import *

auth = Blueprint("auth", __name__)
users = get_collection("users")

logger = logging.getLogger("AuthRouter")


@auth.route("/register", methods=["POST"])
def register():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), StatusCode.OK

    data = request.get_json(silent=True)
    
    required_fields = ["first_name", "last_name", "email", "username", "password", "phone", "postal_code"] 
    validate_fields = check_required_fields(required_fields = required_fields, data = data)
    
    if not validate_fields[0]:
        return error_response(error=f"{validate_fields[1]}", status_code=StatusCode.BAD_REQUEST)
    
    if users.find_one({"email": data["email"]}) or users.find_one({"username": data["username"]}):
        return error_response(error="User with that email or username already exists", status_code=StatusCode.CONFLICT)

    hashed_pw = generate_password_hash(data["password"])
    user = {
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "email": data["email"],
        "phone": data["phone"],
        "postal_code": data["postal_code"],
        "username": data["username"],
        "password": hashed_pw,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    users.insert_one(user)
    return success_response( status_code=StatusCode.CREATED, message="User registered successfully!", data=user, )

@auth.route("/login", methods=["POST"])
def login():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), StatusCode.BAD_REQUEST

    data = request.get_json(silent=True)

    required_fields = ["username", "password"]
    validate_fields = check_required_fields(required_fields = required_fields, data = data)
    
    if not validate_fields[0]:
        return error_response(error=f"{validate_fields[1]}", status_code=StatusCode.BAD_REQUEST)

    user = users.find_one({"username": data["username"]})

    if not user:
        return error_response(error="Invalid username!", status_code=StatusCode.UNAUTHORIZED)

    if not check_password_hash(user["password"], data["password"]):
        return error_response(error="Authentication error!", status_code=StatusCode.UNAUTHORIZED)

    jwt_token = generate_jwt_token(user["email"])
    user.pop("password")
    
    return success_response(status_code=StatusCode.OK,  message="Login successful!", data=user, token=jwt_token )