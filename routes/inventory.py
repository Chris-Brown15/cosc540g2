from bson import ObjectId
from flask import Blueprint, request, jsonify 
import logging
from datetime import datetime 

from utils.database import get_collection
from constants.status import StatusCode
from utils.jwt import require_authentication
from utils.responses import error_response, success_response
from utils.validations import check_required_fields 

inventory = Blueprint("inventory", __name__)
users_coll = get_collection("users")
inventory_coll = get_collection("inventory")

logger = logging.getLogger("InventoryRouter")

ALLOWED_CONDITIONS = {"BRAND_NEW", "USED", "REFURBISHED"}
ALLOWED_STATUSES = {"ACTIVE", "DRAFT", "TRADED"}
ALLOWED_CATEGORIES = {"Home & Living", "Clothing & Accessories", "Kids & Baby", "Books/Movies/Music", "Electronics", "Arts & Crafts"," Tools & DIY", "Garden & Outdoors", "Sports & Recreation", "Pets", "Transportation", "Beauty & Personal Care", "Misc"}

# Create Item
@inventory.route('/', methods=['POST'])
@require_authentication
def create_item():
    try:
        data = request.get_json()
        required_fields = ['user_id', 'title', 'description', 'value', 'currency', 'condition', 'status', 'category']
        validated_fields = check_required_fields(required_fields=required_fields, data=data)

        if not validated_fields[0]:
            return error_response(error=f"{validated_fields[1]}", status_code=StatusCode.BAD_REQUEST)

        if data['condition'] not in ALLOWED_CONDITIONS:
            return error_response(error=f"Condition must be one of {ALLOWED_CONDITIONS}", status_code=StatusCode.BAD_REQUEST)

        if data['status'] not in ALLOWED_STATUSES:
            return error_response(error=f"Status must be one of {ALLOWED_STATUSES}", status_code=StatusCode.BAD_REQUEST)

        if data['category'] not in ALLOWED_CATEGORIES:
            return error_response(error=f"Category must be one of {ALLOWED_CATEGORIES}", status_code=StatusCode.BAD_REQUEST)
        
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
            "category": data["category"],
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
@require_authentication
def get_all_items():
    try: 

        query = {} 
        category_param = request.args.get('category')

        if category_param:
            category_list = [cat.strip() for cat in category_param.split(",") if cat.strip()]

            if category_list:
                query["category"] = {"$in": category_list}
    
        items_raw = inventory_coll.find(query) 
        items = [] 
        for item in items_raw:
            item["_id"] = str(item["_id"])
            item["user_id"] = str(item["user_id"])
            items.append(item)

        return success_response(status_code=StatusCode.OK, message="Items retrieved successfully!", data=items)
    except Exception as e:
        logger.error(f"Error retrieving items: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)

# Read Single Item
@inventory.route('/<string:item_id>', methods=['GET'])
@require_authentication
def get_item(item_id):
    try:
        if not ObjectId.is_valid(item_id):
            return error_response(error="Invalid item ID", status_code=StatusCode.BAD_REQUEST)
        
        item = inventory_coll.find_one({"_id": ObjectId(item_id)})

        if not item: 
            return error_response(error="Item not found", status_code=StatusCode.NOT_FOUND)
        
        item["_id"] = str(item["_id"])
        item["user_id"] = str(item["user_id"])
        for key,value in item.items():
            if isinstance(value, datetime):
                item[key] = value.isoformat()
        return success_response(status_code=StatusCode.OK, message="Item retrieved successfully!", data=item)
    except Exception as e:
        logger.error(f"Error retrieving item: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)

# Update Item
@inventory.route('/<string:item_id>', methods=['PUT'])
@require_authentication
def update_item(item_id):
    try:
        if not ObjectId.is_valid(item_id):
            return error_response(error="Invalid item ID", status_code=StatusCode.BAD_REQUEST)
        
        data = request.get_json()

        allowed_fields = {"title", "description", "value", "currency", "condition", "status", "category"}
        update_data = {}

        for key in allowed_fields:
            if key in data:
                update_data[key] = data[key]
        
        if not update_data:
            return error_response(error="No fields to update", status_code=StatusCode.BAD_REQUEST)
        
        if "condition" in update_data and update_data["condition"] not in ALLOWED_CONDITIONS:
            return error_response(error=f"Condition must be one of {ALLOWED_CONDITIONS}", status_code=StatusCode.BAD_REQUEST)

        if "status" in update_data and update_data["status"] not in ALLOWED_STATUSES:
            return error_response(error=f"Status must be one of {ALLOWED_STATUSES}", status_code=StatusCode.BAD_REQUEST)

        if "category" in update_data and update_data["category"] not in ALLOWED_CATEGORIES:
            return error_response(error=f"Category must be one of {ALLOWED_CATEGORIES}", status_code=StatusCode.BAD_REQUEST)

        update_data["updated_at"] = datetime.now()

        result = inventory_coll.update_one(
            {"_id": ObjectId(item_id)}, 
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return error_response(error="Item not found", status_code=StatusCode.NOT_FOUND)
        
        updated_item = inventory_coll.find_one({"_id": ObjectId(item_id)})
        updated_item["_id"] = str(updated_item["_id"])
        updated_item["user_id"] = str(updated_item["user_id"])
        for key,value in updated_item.items():
            if isinstance(value, datetime):
                updated_item[key] = value.isoformat()

        return success_response(status_code=StatusCode.OK, message="Item updated successfully!", data=updated_item)
    except Exception as e:
        logger.error(f"Error updating item: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)  
    

# Delete Item
@inventory.route('/<string:item_id>', methods=['DELETE'])
@require_authentication
def delete_item(item_id):
    try:
        if not ObjectId.is_valid(item_id):
            return error_response(error="Invalid item ID", status_code=StatusCode.BAD_REQUEST)
        
        result = inventory_coll.delete_one({"_id": ObjectId(item_id)})

        if result.deleted_count == 0:
            return error_response(error="Item not found", status_code=StatusCode.NOT_FOUND)
        
        return success_response(status_code=StatusCode.OK, message="Item deleted successfully!")
    except Exception as e:
        logger.error(f"Error deleting item: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)