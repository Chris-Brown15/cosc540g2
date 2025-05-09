# SwitchUp - Local Item Trading Platform

## Overview
SwitchUp reimagines local exchanges with a matching system that pairs users based on what they're giving away and what they're looking for. Our goal is to promote a circular economy that reduces waste, builds community, and fosters a more sustainable way to share resources.

## Tech Stack
- Frontend: HTML, CSS, JavaScript (Vanilla JS)
- Backend: Python with Flask
- Database: MongoDB
- Authentication: JWT (JSON Web Tokens)
- Real-time Chat: WebSockets with Flask-SocketIO

## Project Structure
    ├── backend/
    │   ├── constants/         # Status codes and other constants
    │   ├── environments/      # Environment configuration
    │   ├── routes/            # API endpoints
    │   ├── static/            # Static files (CSS, JS, images)
    │   ├── templates/         # HTML templates
    │   ├── utils/             # Utility functions
    │   ├── requirements.txt   # Python dependencies
    │   └── server.py          # Main server file
    └── README.md

## Setup and Installation

- Python 3.8 or higher
- MongoDB

## Environment Setup

1. Clone the repository:

    git clone https://github.com/Chris-Brown15/cosc540g2.git

    cd cosc540g2

2. Create environment configuration files:

    mkdir environments

3. Create two environment files:

    .env.dev for development

    .env.prod for production

## Backend Setup

1. Navigate to the project directory:

    cd cosc540g2

2. Create and activate a virtual environment:

    python -m venv virtual_env

### On Windows
    virtual_env\Scripts\activate

### On macOS/Linux
    source virtual_env/bin/activate

3. Install dependencies:

    pip install -r requirements.txt

4. Run the server in development mode:

    python server.py --env dev

The server should start at http://127.0.0.1:5000

## Team Members

Mohammed Alam
Christopher Brown
Andrew Burkey
Sara Martin
Rinal Patel
Alexis Tochiki



## Run Locally

### Dev
```python server.py --env dev```

### PROD
```python server.py --env prod```

## Setup

# Frontend (HTML, CSS, Vanilla JS)

# Current Frontend Implementation
In the current frontend-only implementation:

- Image previews are handled using the browser's FileReader API
- Data is stored in memory and lost on page refresh
- New listings are added to the DOM dynamically-+

# Changes Needed for Backend Integration
- 1. Update the submitListing Function
- 2. Update the loadListings Function
- 3. Update the renderListings Function

### Environment
In the project root directory create an ```environments``` folder and make sure you have both the ```.env.dev``` and ```.env.prod``` files in there. 

### Backend (Flask)
The backend is built using Flask and MongoDB. It uses virtual environment to encapsulate all backend related python packages into the project backend directory only. Below are instructions on how to correctly setup the backend. 

- If Python 3 is not installed, install it via its installer at: https://www.python.org/downloads/.
- If Pip is not installed, use `python -m pip install --upgrade pip`
- Check for ```virtual_env``` 
    - ```cd``` into the ```backend``` folder and check if the ```virtual_env``` folder already exists
    - If it does exist: 
        - Run the following commmands: 
            - ```virtual_env/Scripts/activate``` - This will activate the virtual environment.
    - If it does not exist: 
        - Run the following commands: 
            - ```python -m venv virtual_env``` - This will create the virtual environment. 
- Once the ```virtual_env``` is set up run ```pip install -r requirements.txt``` to install the necessary packages into the virtual environment. 
- Once all the packages are done installing, we can start the flask server. 
    - Starting the flask server requires a command-line argument ```--env``` that accepts ```dev``` or ```prod``` options. 
    - To start the flask server in ```dev``` mode run ```python server.py --env dev```.
    - Similarly to start the flask server in ```prod``` mode run ```python server.py --env prod```. 
- Once the server starts you should see an output like below: 
 ```
 >> python server.py --env dev
 INFO:Server:Using environment: dev (file: .env.dev)
INFO:Database:Connected to MongoDB database: switchup, collection: users
 * Serving Flask app 'server'
 * Debug mode: on
INFO:werkzeug:WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
INFO:werkzeug:Press CTRL+C to quit
INFO:werkzeug: * Restarting with stat
INFO:Server:Using environment: dev (file: .env.dev)
INFO:Database:Connected to MongoDB database: switchup, collection: users
WARNING:werkzeug: * Debugger is active!
INFO:werkzeug: * Debugger PIN: 135-599-923
```

#### API Documentation

#### App Base Endpoint: ```/api```

#### Auth Endpoints
- **```/auth/register```** - To register a user
    - **METHOD** - ```POST```
    - **REQUEST BODY** 
        ```typescript
        {
            "first_name": string,
            "last_name": string,
            "email": string,
            "phone": string,
            "postal_code": string,
            "username": string,
            "password": string,
            "created_at": Date,
            "updated_at": Date
        }
        ```
    - **RESPONSES**
        - **200 - SUCCESS** 
        ```typescript
        {
            "data": UserObject,
            "message": "User registered successfully!"
        }
        ```
        - **400, 409 - BAD REQUEST, CONFLICT**
        ```typescript
        { "error": "User with that email or username already exists" }
        or 
        { "error": "Missing fields: <missing_field>" }
        ```
- **```/auth/login```** - To login a user
    - **METHOD** - ```POST```
    - **REQUEST BODY** 
        ```typescript
        {
            "username" : string, 
            "password" : string
        }
        ```
    - **RESPONSES**
        - **200 - SUCCESS** 
        ```typescript
        {
            "data": UserObject,
            "token": JWTToken,
            "message": "Login successful!"
        }
        ```
        - **400, 401 - BAD REQUEST, UNAUTHORIZED**
        ```typescript
        { "error": "Invalid username!" }
        or 
        { "error": "Authentication error!" }
        or 
        { "error": "Missing fields: <missing_field>" }
        ```
