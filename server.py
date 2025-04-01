import os
from dotenv import load_dotenv
from utils.database_factory import get_collection
from flask import Flask
import logging 
from routes.auth_routes import auth

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Server")

app = Flask(__name__)
app.register_blueprint(auth)

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI not set in environment.")

#Test database connection 
users_coll = get_collection("users")

app.run()