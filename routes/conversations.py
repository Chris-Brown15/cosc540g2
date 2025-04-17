from flask import Blueprint, request, jsonify 
import logging 

conversations = Blueprint("conversations", __name__)
logger = logging.getLogger("ConversationsRouter")

# Read Single Conversation
@conversations.route('/conversations/<string:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    print(conversation_id)
    return

# Update Conversation
@conversations.route('/conversations/<string:conversation_id>', methods=['PUT'])
def update_conversation(conversation_id):
    print(conversation_id)
    return