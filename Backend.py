from flask import Flask , render_template , request , jsonify
import static.SUChat.SUWebChatServer as ChatServer

app = Flask(__name__)
chatServer = ChatServer.SUCChatServer(app , "*")

#set of strings containing usernames.
users = set()

#serve the index html
@app.route("/")
def index():
	return render_template("index.html")

#serve the chat html
@app.route('/register')
def chat():
    return render_template("register.html")

@app.route('/registerUser' , methods=["POST"])
def logIn2():
	username = request.form.get("username")

	if(username == ""):
		return jsonify({"error" : "Input a username"}) , 400
	
	if(username in users):
		return jsonify({"error" : "Username taken"}) , 409

	#new username
	users.add(username)	
	print("Added User: " + username)

	roomsDict = chatServer.getAllRooms()	
	roomKeys = list(roomsDict.keys())
	roomList = list(map(lambda room : room.name , roomsDict.values()))

	return jsonify({"username" : f"{username}" , "roomKeys" : roomKeys , "roomNames" : roomList})

if __name__ == "__main__":
	#enqueue some initial setup before the server is running
	room1 = chatServer.newRoom("Room 1")
	room2 = chatServer.newRoom("Room 2")
	room3 = chatServer.newRoom("Room 3")
	chatServer.run(True , "0.0.0.0" , 5000)	
