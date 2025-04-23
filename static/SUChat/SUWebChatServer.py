'''

This is the Switch Up Chatting Web Server used when customers are chatting with one another.

Author:
	Chris Brown

'''

from flask import Flask , request , jsonify
from flask_socketio import SocketIO , join_room , leave_room , send , emit
import json

LOG_PREPEND = "[SU CHAT SERVER] "

'''
The connect event. This event is triggered when a client connects to the server.
'''
CONNECT_EVENT = "connect"

'''
The disconnect event.
'''
DISCONNECT_EVENT = "disconnect"

'''
The client received message event. This event is triggered when the client receives a message from the server.
'''
CLIENT_RECEIVE_MESSAGE_EVENT = "client_messageReceived"

'''
The client sent message event. This event is triggered when the client sends a message to the server.
'''
CLIENT_SEND_MESSAGE_EVENT = "client_messageSent"

'''
The server sent message event. This event is triggered mainly when the server sends a message to clients.
'''
SERVER_SEND_MESSAGE_EVENT = "server_messageSent"
'''
Get room event. This is triggered by the client to get a room name from a room ID.
'''
GET_ROOM_BY_ID_EVENT = "getRoomByID"

'''
The join room event. Emitted by the client to indicate the client wants to join a specified room.
'''
JOIN_ROOM_EVENT = "joinRoom"

'''
The get room logs event. Emitted by a client who wants to receive all known messages that have been sent to a room.
'''
GET_ROOM_LOGS_EVENT = "getRoomLogs"

'''
The chat server class.

'''
class SUCChatServer:

	'''
	The SocketIO instance.
	'''
	__theSocketIO = None;
	__theFlaskApp = None;

	'''
	Initializes this server. After this call, the webserver is running.

	Parameters:
		theFlaskApp — The Flask application singleton
		CORSPolicy — The CORS policy for this SocketIO initialization task, one of "*", None, or an origin

	Raises:
		TypeError if theFlaskApp is None.
		ValueError if an instance of this class has already been initialized. In this case, the Flask SocketIO variable is already created.

	'''
	def __init__(self , theFlaskApp , CORSPolicy):
		if(SUCChatServer.__theSocketIO != None):
			raise ValueError("The SocketIO already initialized.")

		if(theFlaskApp == None):
			raise TypeError("The Flask App is None.")

		#Enables print statements from this object.
		self.logging = True

		self.__theSocketIO = SocketIO(theFlaskApp , cors_allowed_origins = CORSPolicy)
		self.__theFlaskApp = theFlaskApp

		#events 
		self.__theSocketIO.on_event(CONNECT_EVENT, lambda: self.connect())
		self.__theSocketIO.on_event(DISCONNECT_EVENT , lambda reason: self.disconnect(reason))
		self.__theSocketIO.on_event(CLIENT_SEND_MESSAGE_EVENT , lambda messageData: self.receiveMessage(messageData))
		self.__theSocketIO.on_event(GET_ROOM_BY_ID_EVENT , lambda roomID: self.getRoom(roomID))
		self.__theSocketIO.on_event(JOIN_ROOM_EVENT , lambda joinRoomData: self.joinRoom(joinRoomData))
		self.__theSocketIO.on_event(GET_ROOM_LOGS_EVENT , lambda getRoomLogsData: self.getRoomLogs(getRoomLogsData))

		#map containing room IDs as keys and rooms as values.
		self.__userRooms = {}
		self.__nextRoomID = 0

	'''
	Create a new chat room. Any message a user sends to a room is broadcast to others in the room. The resulting ID can be used to retrieve the
	room.

	Parameters:
		roomName — String representing the name of the room

	Return:
		ID used to retreive the resulting room.

	Raises:
		TypeError if roomName is None.

	'''
	def newRoom(self , roomName):
		requirePresent(roomName)
		
		self.__nextRoomID += 1
		roomID = self.__nextRoomID

		chatRoom = SUCChatRoom(roomID , roomName)
		self.__userRooms[roomID] = chatRoom;
		return roomID
	
	'''
	Get an existing room by its ID.
	
	Parameters:
		roomID — ID identifying the queried room

	Return:
		Room keyed by roomID, or None if none was found.

	Raises:
		TypeError if roomID is None.
	'''
	def getRoom(self , roomID):
		requirePresent(roomID)

		return self.__userRooms.get(roomID)

	'''
	Returns a dictionary view of the current rooms known to the server. The keys of the resulting dict are IDs (those returned by newRoom), and 
	the values are the names of the rooms.

	Return:
		Dictionary view of the rooms currently known to the server.

	'''
	def getAllRooms(self):
		return self.__userRooms.copy()

	'''
	Called when a client connects to the server.
	'''
	def connect(self):
		self.log("Connect received.")

	'''
	Called when a client disconnects from the server.
	'''
	def disconnect(self , reason):
		self.log(f"Disconnect received: {reason}.")

	'''
	Returns the chat log list from a room. 
	'''
	def getRoomLogs(self , jsonString):
		jsonData = json.loads(jsonString)
		room = self.getRoom(jsonData.get("roomID"))
		return room.chatLog

	'''
	Called when a message is received by the server.
	
	Parameters:
		jsonString — JSON string containing the sender and the message they sent

	'''
	def receiveMessage(self , jsonString):
		jsonData = json.loads(jsonString)
		roomID = int(jsonData.get("roomID"))
		#store received message in room chat logs
		room = self.getRoom(roomID)
		sender = jsonData.get("sender")
		message = jsonData.get("message")
		room.logChat(sender , message)
		#broadcast message to everyone in the room
		self.sendMessage(sender , message , roomID)
	
	'''
	Called to send a message to a chat room.

	Parameters:
		sender — string representing the sender's username
		message — string message to send to the room
		roomID — the room to send the message to

	Raises:
		TypeError if any of sender, message, or roomID is None.
	'''
	def sendMessage(self , sender , message , roomID):
		requirePresent(sender , message , roomID)

		self.__theSocketIO.emit(CLIENT_RECEIVE_MESSAGE_EVENT , self.__clientReceiveMessageEventJSON(sender , message) , to = self.getRoom(roomID))
		
	'''
	Called when the client emits a JOIN_ROOM_EVENT. This function receives JSON representing the client's username and the room ID for the room
	they want to join.
	'''
	def joinRoom(self , jsonString):
		jsonData = json.loads(jsonString)
		room = self.getRoom(jsonData.get("roomID"))
		join_room(room)
		self.log(jsonData.get("sender") + " has joined room " + room.name)


	'''
	Starts this server, BLOCKING THE CURRENT THREAD. This call must replace a call to run from the app returned by Flask(__name__).
	
	Parameters:
		debug — whether to be in debug mode
		host — the hostname of this server
		port — the port number to listen on
	
	Raises:
		TypeError if any parameter is None.
		ValueError if port is invalid as a port number.
	
	'''
	def run(self , debug = True , host = "0.0.0.0", port = 5000):
		if(anyNone(debug , host , port)):
			raise TypeError("None argument received.")

		if(port <= 0 or port >= 65535):
			raise ValueError(f"{port} is invalid as a port number.")

		self.__theSocketIO.run(self.__theFlaskApp , debug = debug , host = host , port = port , allow_unsafe_werkzeug=True)


	def log(self , statement):
		if(self.logging):
			print(f"{LOG_PREPEND}" + statement)

	def __clientReceiveMessageEventJSON(self , originalSender , message):
		return {"originalSender" : originalSender , "message" : message}

'''

Returns True if any of args is None.

Parameters:
	args — vararg of objects.

Return:
	True if any of args is None.

Note:
	AI generated function.

'''
def anyNone(*args):
	return any(x is None for x in args)

'''
Raises type error if any of args is None.

Parameters:
	args — vararg of objects.

Raises:
	TypeError if any of args is None.
'''
def requirePresent(*args):
	index = 0
	for x in args:
		if(x is None):
			raise TypeError(f"Argument {index} is none.")
		index = index + 1

class SUCChatRoom:

	def __init__(self , roomID , roomName):
		self.__roomID = roomID
		self.name = roomName
		self.usersInRoom = 0
		self.users = []
		self.chatLog = []

	def logChat(self , username , chat):
		self.chatLog.append(SUCChatLog(username , chat))

class SUCChatLog:

	def __init__(self , username , chat):
		self.username = username
		self.chat = chat
