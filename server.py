# LOAD PROPER ENVIRONMENT VARIABLES
from utils.env import load_environment
load_environment()
#####################################

import logging
import os
from routes.users import users_bp
from routes.exchanges import exchanges
from routes.notifications import notifications
from routes.inventory import inventory
from routes.conversations import conversations
from routes.auth import auth_bp
from utils.blueprints import *
from flask import Flask, render_template

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Server")

app = Flask(__name__)

# Register Blueprints
register_blueprints(app, "/api", [
    (auth_bp, "/auth"),
    (conversations, "/conversations"),
    (inventory, "/inventory"),
    (notifications, "/notifications"),
    (exchanges, "/exchanges"),
    (users_bp, "/users"),
])

# UI Routes
@app.route('/')
def home():
    return render_template("index.html")

##########################################################
print(app.url_map)
# Start the app based on env and mode
if __name__ == "__main__":
    app.run(debug=(os.getenv("FLASK_ENV") == "dev"))
