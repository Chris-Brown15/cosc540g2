# LOAD PROPER ENVIRONMENT VARIABLES
import logging
import os
from routes.users import users
from routes.exchanges import exchanges
from routes.notifications import notifications
from routes.inventory import inventory
from routes.conversations import conversations
from routes.auth import auth
from utils.blueprints import *
from flask import Flask
from utils.env import load_environment
load_environment()
#####################################

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Server")

app = Flask(__name__)

# Register Blueprints
register_blueprints(app, "/api", [
    (auth, "/auth"),
    (conversations, "/conversations"),
    (inventory, "/inventory"),
    (notifications, "/notifications"),
    (exchanges, "/exchanges"),
    (users, "/users"),
])

##########################################################
print(app.url_map)
# Start the app based on env and mode
if __name__ == "__main__":
    app.run(debug=(os.getenv("FLASK_ENV") == "dev"))
