# LOAD PROPER ENVIRONMENT VARIABLES
from utils.env import load_environment
load_environment()
#####################################

import os 
from flask import Flask
import logging 
from routes.auth import auth



logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Server")



app = Flask(__name__)

# Register Blueprints
app.register_blueprint(auth)
##########################################################

# Start the app based on env and mode
if __name__ == "__main__":
    app.run(debug=(os.getenv("FLASK_ENV") == "dev"))
