from flask import Blueprint, request, jsonify 
import logging 

users = Blueprint("users", __name__)
logger = logging.getLogger("UsersRouter")

# Read Single User
@users.route('/users/<string:user_id>', methods=['GET'])
def get_user(user_id):
    print(user_id)
    return

# Update User
@users.route('/users/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    print(user_id)
    return