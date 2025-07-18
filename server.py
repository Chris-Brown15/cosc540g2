# server.py

import logging
import os
from flask import Flask, render_template
from flask import send_from_directory
import static.SUChat.SUWebChatServer as ChatServer

from utils.env import load_environment

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Server")

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads')
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load environment
load_environment()

# Create app
app = Flask(__name__)
chatServer = ChatServer.SUCChatServer(app , "*")

# Import blueprints
from routes.users import users_bp
from routes.exchanges import exchanges
from routes.notifications import notifications
from routes.inventory import inventory
from routes.conversations import conversations
from routes.conversations import exposeTheChatServer
from routes.auth import auth_bp
from utils.blueprints import register_blueprints

# Register Blueprints
register_blueprints(app, "/api", [
    (auth_bp, "/auth"),
    (conversations, "/conversations"),
    (inventory, "/inventory"),
    (notifications, "/notifications"),
    (exchanges, "/exchanges"),
    (users_bp, "/users"),
])

exposeTheChatServer(chatServer)

# Define your route
@app.route('/')
def home():
    return render_template("index.html")

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.join(app.root_path, 'static/uploads'), filename)

# Start the server
if __name__ == "__main__":
    chatServer.run(True , "0.0.0.0" , 5000)
