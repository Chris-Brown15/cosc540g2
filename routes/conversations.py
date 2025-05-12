from flask import Blueprint, request, jsonify 
import logging 
from utils.database import get_collection
from bson import ObjectId

conversations = Blueprint("conversations", __name__)
logger = logging.getLogger("ConversationsRouter")

conversations_coll = get_collection('messages')

THE_CHAT_SERVER = None

'''
Called from the main server file to expose the chat server to this file.
Parameters:
    theChatServer — the single chat server used by the application.
'''
def exposeTheChatServer(theChatServer):
    THE_CHAT_SERVER = theChatServer

# Create a New Conversation
@conversations.route('/', methods=['POST'])
def create_conversation():
    try:
        data = request.json
        new_conversation = {
            "trade_id": ObjectId(data["trade_id"]),
            "participants": [ObjectId(pid) for pid in data["participants"]],
            "messages": []
        }
        result = conversations_coll.insert_one(new_conversation)
        return jsonify({"message": "Conversation created", "conversation_id": str(result.inserted_id)}), 201
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Read Single Conversation
@conversations.route('/<string:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    print(conversation_id)
    try:
        conversation = conversations_coll.find_one({"_id": ObjectId(conversation_id)})
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404

        # Convert top-level fields
        conversation["_id"] = str(conversation["_id"])
        conversation["trade_id"] = str(conversation["trade_id"])
        conversation["participants"] = [str(pid) for pid in conversation["participants"]]

        # Convert ObjectIds inside messages
        for msg in conversation.get("messages", []):
            msg["sender_id"] = str(msg["sender_id"])
            # If you ever add ObjectIds inside images, you'd convert them here too

        return jsonify(conversation), 200
    except Exception as e:
        logger.error(f"Error fetching conversation: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Update Conversation
@conversations.route('/<string:conversation_id>', methods=['PUT'])
def update_conversation(conversation_id):
    print(conversation_id)
    data = request.json
    try:
        # Update conversation with a new message
        update_result = conversations_coll.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$push": {"messages": {
                    "sender_id": ObjectId(data["sender_id"]),
                    "text": data["text"],
                    "timestamp": data["timestamp"],
                    "images": data.get("images", [])
                }}
            }
        )
        if update_result.modified_count == 0:
            return jsonify({"error": "Conversation not found or nothing updated"}), 404
        return jsonify({"message": "Conversation updated successfully"}), 200
    except Exception as e:
        logger.error(f"Error updating conversation: {e}")
        return jsonify({"error": "Internal server error"}), 500# Check if a conversation already exists between two users

@conversations.route('/check', methods=['GET'])
def check_conversation():
    user1_id = request.args.get('user1')
    user2_id = request.args.get('user2')

    if not user1_id or not user2_id:
        return jsonify({"error": "Missing user IDs"}), 400

    try:
        conversation = conversations_coll.find_one({
            "participants": {
                "$all": [ObjectId(user1_id), ObjectId(user2_id)]
            }
        })
        if conversation:
            return jsonify({
                "exists": True,
                "conversation_id": str(conversation["_id"])
            }), 200
        else:
            return jsonify({
                "exists": False
            }), 200
    except Exception as e:
        logger.error(f"Error checking conversation: {e}")
        return jsonify({"error": "Internal server error"}), 500

@conversations.route('/getroomid', methods=['POST'])
def get_chat_room_id():
    roomName = request.form.get("roomName")
    room = THE_CHAT_SERVER.getRoomByName(roomName)
    return jsonify({"roomName" : roomName , "roomID" : room.getRoomID()})
