# cosc540g2
Chat system demo. 
## Overview
This is a basic demo application in which a basic Flask web application is spun up, and users on the host's network can connect and talk to one another. 
It utilizes Flask and Flask SocketIO for communication between clients. 
## Setup
If Python 3 is not installed, install it via its installer at: https://www.python.org/downloads/. 
If Pip is not installed, use `python -m pip install --upgrade pip`
Using pip, install Flask and Flask-socketio using the command: `pip install flask flask-socketio`. 
Once done, run the command `python Backend.py` to begin the server. 
Once the server is running, get the host system's internal IP address. On Windows, this is done via the `ipconfig` command. The IP V4 address of the host machine is what everyone will connect to. To connect, open a browser tab and type in the URL section: `http://[your local ipv4 address]:5000`. This will open the demo's index web page served via the server and from here you can begin -> enter username -> join a room -> chat with people in the room.