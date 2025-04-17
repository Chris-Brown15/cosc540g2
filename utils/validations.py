def check_required_fields(required_fields: list[str], data: dict) -> tuple[bool, str | dict]:

    if not data:
        return False, "Invalid or empty JSON payload"
    
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return False, f"Missing fields: {', '.join(missing_fields)}"
    
    return True, data
