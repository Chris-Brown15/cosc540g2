from bson import ObjectId
from flask import Blueprint, request, jsonify 
import logging
from datetime import datetime 

from utils.database import get_collection
from constants.status import StatusCode
from utils.responses import error_response, success_response
from utils.validations import check_required_fields 

inventory = Blueprint("inventory", __name__)
users_coll = get_collection("users")
inventory_coll = get_collection("inventory")

logger = logging.getLogger("InventoryRouter")

ALLOWED_CONDITIONS = {"BRAND_NEW", "USED", "REFURBISHED"}
ALLOWED_STATUSES = {"ACTIVE", "DRAFT", "TRADED"}


# Create Item
@inventory.route('/', methods=['POST'])
def create_item():
    try:
        data = request.get_json()
        required_fields = ['user_id', 'title', 'description', 'value', 'currency', 'condition', 'status']
        validated_fields = check_required_fields(required_fields=required_fields, data=data)

        if not validated_fields[0]:
            return error_response(error=f"{validated_fields[1]}", status_code=StatusCode.BAD_REQUEST)

        if data['condition'] not in ALLOWED_CONDITIONS:
            return error_response(error=f"Condition must be one of {ALLOWED_CONDITIONS}", status_code=StatusCode.BAD_REQUEST)

        if data['status'] not in ALLOWED_STATUSES:
            return error_response(error=f"Status must be one of {ALLOWED_STATUSES}", status_code=StatusCode.BAD_REQUEST)
        
        user_exists = users_coll.find_one({"_id": ObjectId(data['user_id'])})

        if not user_exists:
            return error_response(error="User id not valid!", status_code=StatusCode.NOT_FOUND)
        
        item = {
            "user_id": data["user_id"],
            "title": data["title"],
            "description": data["description"],
            "value": float(data["value"]),
            "currency": data["currency"],
            "condition": data["condition"],
            "status": data["status"],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        result = inventory_coll.insert_one(item)
        item["_id"] = str(result.inserted_id)

        return success_response(status_code=StatusCode.CREATED, message="Item created successfully!", data=item)
    except Exception as e:
        logger.error(f"Error creating item: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)
    

# Read All Items
@inventory.route('/', methods=['GET'])
def get_all_items():
    items = [{ "id": 1, "user_id": 1, "title": "Test", "description": "A description of the itnem" }]

    # Open Search
    search_param = request.args.get('q')

     # Query parameters
    category = request.args.get('category')

    print(category, search_param)
    return jsonify(items)

# Read Single Item
@inventory.route('/inventory/<string:item_id>', methods=['GET'])
def get_item(item_id):
    print(item_id)
    return

# Update Item
@inventory.route('/inventory/<string:item_id>', methods=['PUT'])
def update_item(item_id):
    print(item_id)
    return

# Delete Item
@inventory.route('/inventory/<string:item_id>', methods=['DELETE'])
def delete_item(item_id):
    print(item_id)
    return
