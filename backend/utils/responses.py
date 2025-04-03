from flask import jsonify
from datetime import datetime

def error_response(
    error: str = "Something went wrong",
    status_code: int = 400,
):
    response = {
        "error": error,
    }
   
    return jsonify(response), status_code

def success_response(
    message: str = "Success",
    data: dict = None,
    status_code: int = 200
):
    response = {
        "message": message,
    }

    if data:
        if "_id" in data:
            data.pop("_id")

        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()

        response["data"] = data

    return jsonify(response), status_code
