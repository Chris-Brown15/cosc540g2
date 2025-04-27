from dotenv import load_dotenv
import argparse
import logging 
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Server")

def load_environment():
    parser = argparse.ArgumentParser(description="Start Flask server with env")
    parser.add_argument(
        "--env", 
        choices=["dev", "prod"], 
        default="dev", 
        help="Environment to run the server with"
    )
    args, unknown = parser.parse_known_args()
    os.environ["FLASK_ENV"] = args.env

    # Load .env first (in case some globals are there)
    load_dotenv()

    env_file = f"environments/.env.{args.env}"
    load_dotenv(dotenv_path=env_file)
    
    logger.info(f"Using environment: {args.env} (file: {env_file})")
