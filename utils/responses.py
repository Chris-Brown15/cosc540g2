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
    data=None,
    **kwargs
):
    response = {
        "message": message,
    }

    # Handle list of dicts (e.g., multiple items)
    if isinstance(data, list):
        processed_data = []
        for item in data:
            if isinstance(item, dict):
                item = item.copy()
                item.pop("_id", None)
                for key, value in item.items():
                    if isinstance(value, datetime):
                        item[key] = value.isoformat()
            processed_data.append(item)
        response["data"] = processed_data

    # Handle single dict
    elif isinstance(data, dict):
        data = data.copy()
        data.pop("_id", None)
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
        response["data"] = data

    # Add any extra fields to the response
    for key, value in kwargs.items():
        response[key] = value

    return jsonify(response), status_code