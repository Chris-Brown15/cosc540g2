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
from flask import jsonify
from datetime import datetime

def success_response(
    status_code: int = 200,
    message: str = "Success",
    data: dict = None,
    **kwargs
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

    # Add any extra key-value fields to the response
    for key, value in kwargs.items():
        response[key] = value

    return jsonify(response), status_code
