from flask import Blueprint, request, jsonify 
import logging 

exchanges = Blueprint("exchanges", __name__)
logger = logging.getLogger("ExchangesRouter")

# Read Single Exchange
@exchanges.route('/exchanges/<string:exchange_id>', methods=['GET'])
def get_exchange(exchange_id):
    print(exchange_id)
    return

# Update Exchange
@exchanges.route('/exchanges/<string:exchange_id>', methods=['PUT'])
def update_exchange(exchange_id):
    print(exchange_id)
    return