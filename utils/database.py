from pymongo.mongo_client import MongoClient 
from pymongo.server_api import ServerApi
from pymongo.errors import PyMongoError, ConnectionFailure
import logging

logger = logging.getLogger("Database")


class Database:
    def __init__(self, uri: str, db_name: str, collection_name: str) -> None:
        try:
            self.client = MongoClient(uri, server_api=ServerApi('1'))
            self.client.admin.command('ping')  # Check if connection is successful
            self.db = self.client[db_name]
            self.collection_name = collection_name
            self.collection = self.db[collection_name]
            logger.info(f"Connected to MongoDB database: {db_name}, collection: {collection_name}")
        except ConnectionFailure as e:
            logger.error("Could not connect to MongoDB: %s", e)
            raise
        except PyMongoError as e:
            logger.error("MongoDB error occurred: %s", e)
            raise

    def set_collection(self, collection_name: str):
        try:
            self.collection_name = collection_name
            self.collection = self.db[collection_name]
            logger.info(f"Switched to collection: {collection_name}")
        except PyMongoError as e:
            logger.error("Failed to switch collection: %s", e)
            raise

    def get_collection(self):
        try:
            return self.collection
        except AttributeError:
            logger.error("Collection is not set.")
            raise

    def get_database(self):
        try:
            return self.db
        except AttributeError:
            logger.error("Database is not set.")
            raise
