from flask import Blueprint, request, jsonify 
import logging
from bson import ObjectId
from constants.status import StatusCode
from utils.database import get_collection
from utils.jwt import require_authentication
from utils.responses import error_response, success_response 

users_bp = Blueprint("users", __name__)
users_coll = get_collection("users")


logger = logging.getLogger("UsersRouter")

# Read Single User
@require_authentication()
@users_bp.route('/<string:user_id>', methods=['GET'])
def get_user(user_id):
    try: 
        user = users_coll.find_one({"_id": ObjectId(user_id)})
        if not user:
            return error_response(error="User not found", status_code=StatusCode.NOT_FOUND)

        user["_id"] = str(user["_id"])
        return success_response(status_code=StatusCode.OK, message="User found!", data=user)
    except Exception as e:
        logger.error(f"Error fetching user: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)

# Update User
@require_authentication()
@users_bp.route('/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.get_json() 
        if not data:
            return error_response(error="Request must be JSON", status_code=StatusCode.BAD_REQUEST)
        
        update_result = users_coll.update_one({"_id": ObjectId(user_id)}, {"$set": data})
        
        if update_result.matched_count == 0:
            return error_response(error="User not found", status_code=StatusCode.NOT_FOUND)
        else:
            user = users_coll.find_one({"_id": ObjectId(user_id)})
            user["_id"] = str(user["_id"])
            return success_response(status_code=StatusCode.OK, message="User updated successfully!", data=user)
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)