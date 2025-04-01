from flask import Blueprint, request, jsonify 
from utils.database import Database 
from utils.database_factory import get_collection
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime 
import logging 

auth = Blueprint("auth", __name__, url_prefix="/auth")
users = get_collection("users")

logger = logging.getLogger("AuthRouter")


@auth.route("/register", methods=["POST"])
def register():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or empty JSON payload"}), 400
    logger.info("Printing Data:")
    print(data)
    required_fields = ["first_name", "last_name", "email", "username", "password", "phone", "postal_code"] 
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400
    
    if users.find_one({"email": data["email"]}) or users.find_one({"username": data["username"]}):
        return jsonify({"error": "User with that email or username already exists"}), 409

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
    return jsonify({"message": "User registered successfully"}), 201
