import os
from dotenv import load_dotenv
from utils.database import Database
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DEFAULT_DB_NAME = "switchup"

def get_collection(collection_name: str):
    db = Database(uri=MONGODB_URI, db_name=DEFAULT_DB_NAME, collection_name=collection_name)
    return db.get_collection()
