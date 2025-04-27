from bson import ObjectId
from flask import Blueprint, request, jsonify 
import logging
from datetime import datetime 

from constants.status import StatusCode
from utils.database import get_collection
from utils.jwt import require_authentication
from utils.responses import error_response, success_response
from utils.validations import check_required_fields 

exchanges = Blueprint("exchanges", __name__)
users_coll = get_collection("users")
inventory_coll = get_collection("inventory")
exchanges_coll = get_collection("exchanges")



logger = logging.getLogger("ExchangesRouter")


ALLOWED_STATUSES = {"PENDING", "COMPLETED", "CANCELLED"}

# Initiate Exchange
@exchanges.route('/', methods=['POST'])
@require_authentication
def initiate_exchange():
    try:
        data = request.get_json()
        required_fields = ['offerer_id', 'requester_id', 'inventory_id', 'status']

        validated_fields = check_required_fields(required_fields=required_fields, data=data)
        if not validated_fields[0]:
            return error_response(error=f"{validated_fields[1]}", status_code=StatusCode.BAD_REQUEST)

        if data['status'] not in ALLOWED_STATUSES:
            return error_response(error=f"Status must be one of {ALLOWED_STATUSES}", status_code=StatusCode.BAD_REQUEST)

        try:
            offerer_id = ObjectId(data['offerer_id'])
            requester_id = ObjectId(data['requester_id'])
            inventory_id = ObjectId(data['inventory_id'])
        except Exception as e:
            logger.error(f"Error converting IDs to ObjectId: {e}")
            return error_response(error="Invalid ID format in offerer_id, requester_id, or inventory_id", status_code=StatusCode.BAD_REQUEST)

        if data['offerer_id'] == data['requester_id']:
            return error_response(error="Offerer and requester cannot be the same user", status_code=StatusCode.BAD_REQUEST)

        if not users_coll.find_one({"_id": offerer_id}):
            return error_response(error="Offerer not found", status_code=StatusCode.NOT_FOUND)
        if not users_coll.find_one({"_id": requester_id}):
            return error_response(error="Requester not found", status_code=StatusCode.NOT_FOUND)

        inventory_item = inventory_coll.find_one({
            "_id": inventory_id,
            "user_id": data['offerer_id']  # stored as string in DB
        })
        if not inventory_item:
            return error_response(
                error="Inventory item not found or does not belong to the offerer",
                status_code=StatusCode.NOT_FOUND
            )

        duplicate = exchanges_coll.find_one({
            "offerer_id": data['offerer_id'],
            "requester_id": data['requester_id'],
            "inventory_id": data['inventory_id']
        })
        if duplicate:
            return error_response(
                error="An exchange with the same offerer, requester, and inventory already exists",
                status_code=StatusCode.CONFLICT
            )

        exchange = {
            "offerer_id": data['offerer_id'],
            "requester_id": data['requester_id'],
            "inventory_id": data['inventory_id'],
            "status": data['status'],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        result = exchanges_coll.insert_one(exchange)
        exchange['_id'] = str(result.inserted_id)
        # Convert datetime to iso format
        for key in ['created_at', 'updated_at']:
            if key in exchange and isinstance(exchange[key], datetime):
                exchange[key] = exchange[key].isoformat()

        return success_response(
            data=exchange,
            message="Exchange initiated successfully",
            status_code=StatusCode.CREATED
        )

    except Exception as e:
        logger.error(f"Error initiating exchange: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)


# Read Single Exchange
@exchanges.route('/<string:exchange_id>', methods=['GET'])
@require_authentication
def get_exchange(exchange_id):
    try:
        if not ObjectId.is_valid(exchange_id):
            return error_response(error="Invalid exchange ID format", status_code=StatusCode.BAD_REQUEST)
        
        exchange = exchanges_coll.find_one({"_id": ObjectId(exchange_id)})
        if not exchange:
            return error_response(error="Exchange not found", status_code=StatusCode.NOT_FOUND)
        
        exchange['_id'] = str(exchange['_id'])
        for key in ['created_at', 'updated_at']:
            if key in exchange and isinstance(exchange[key], datetime):
                exchange[key] = exchange[key].isoformat()
        return success_response(data=exchange, message="Exchange retrieved successfully", status_code=StatusCode.OK)
    except Exception as e:  
        logger.error(f"Error retrieving exchange: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)


# Update Exchange
@exchanges.route('/<string:exchange_id>', methods=['PUT'])
@require_authentication
def update_exchange(exchange_id):
    try:
        if not ObjectId.is_valid(exchange_id):
            return error_response(error="Invalid exchange ID format", status_code=StatusCode.BAD_REQUEST)

        data = request.get_json()
        allowed_fields = {"status"}
        update_data = {}

        for key in allowed_fields:
            if key in data:
                update_data[key] = data[key]

        if not update_data:
            return error_response(error="No valid fields provided for update", status_code=StatusCode.BAD_REQUEST)

        if "status" in update_data and update_data["status"] not in ALLOWED_STATUSES:
            return error_response(error=f"Status must be one of {ALLOWED_STATUSES}", status_code=StatusCode.BAD_REQUEST)

        exchange = exchanges_coll.find_one({"_id": ObjectId(exchange_id)})
        if not exchange:
            return error_response(error="Exchange not found", status_code=StatusCode.NOT_FOUND)

        update_data["updated_at"] = datetime.now()

        exchanges_coll.update_one(
            {"_id": ObjectId(exchange_id)},
            {"$set": update_data}
        )

        if update_data.get("status") == "COMPLETED":
            inventory_id = ObjectId(exchange["inventory_id"])
            inventory_result = inventory_coll.update_one(
                {"_id": inventory_id},
                {"$set": {
                    "status": "TRADED",
                    "updated_at": datetime.now()
                }}
            )
            if inventory_result.matched_count == 0:
                logger.warning(f"Could not update inventory status for inventory_id={inventory_id}")

        updated_exchange = exchanges_coll.find_one({"_id": ObjectId(exchange_id)})
        updated_exchange["_id"] = str(updated_exchange["_id"])
        for key in ['created_at', 'updated_at']:
            if isinstance(updated_exchange.get(key), datetime):
                updated_exchange[key] = updated_exchange[key].isoformat()

        return success_response(
            data=updated_exchange,
            message="Exchange updated successfully",
            status_code=StatusCode.OK
        )

    except Exception as e:
        logger.error(f"Error updating exchange {exchange_id}: {e}")
        return error_response(error="Internal server error", status_code=StatusCode.INTERNAL_SERVER_ERROR)
