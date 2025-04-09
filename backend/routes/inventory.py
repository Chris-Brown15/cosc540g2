from flask import Blueprint, request, jsonify 
import logging 

inventory = Blueprint("inventory", __name__)
logger = logging.getLogger("InventoryRouter")

# Create Item
@inventory.route('/inventory', methods=['POST'])
def create_item():
    return

# Read All Items
@inventory.route('/inventory', methods=['GET'])
def get_all_items():

    # Open Search
    search_param = request.args.get('q')

     # Query parameters
    category = request.args.get('category')

    print(category, search_param)
    return

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
