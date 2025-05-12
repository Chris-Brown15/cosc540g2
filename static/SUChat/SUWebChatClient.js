/*

This is the client script for Switch Up Chat. It provides a wrapper over Flask-SocketIO Websockets.

*/
const suc = (function() {

	//all private tokens
	let theSocketIO = null;
	//the users name
	let clientUsername = null;
	//the user's room ID
	var clientRoomID = -1;

	/* Contains callbacks to invoke when the client receives a message from the server. */
	const onReceiveMessageCallbackMap = new Map();

	/* Contains callbacks to invoke when when the client joins a room. */
	const onJoinRoomCallbackMap = new Map();

	/*

	Formulates the JSON emitted on JOIN_ROOM_EVENT.

	*/
	function formOnJoinEventJSON(joinRoomID) {

		return JSON.stringify({sender : clientUsername , roomID : joinRoomID});

	}

	/*

	Formulates the JSON emitted on CLIENT_SEND_MESSAGE_EVENT.

	*/
	function formSendMessageEventJSON(string) {

		return JSON.stringify({sender : clientUsername , message : string , roomID : clientRoomID});

	}

	/*

	Formulates the JSON emitted on GET_ROOM_LOGS_EVENT. 

	*/
	function formGetRoomLogsEventJSON(requestRoomID) {

		return JSON.stringify({roomID : requestRoomID});

	}

	/*

	Formulates the JSON emitted on LEAVE_ALL_ROOMS_EVENT.

	*/
	function formLeaveAllRoomsJSON() {

		return JSON.stringify({sender : clientUsername});

	}

	/*

	Formulates the JSON emitted on REQUEST_NEW_ROOM_EVENT.

	*/
	function formRequestNewRoomJSON(otherUsername) {

		return JSON.stringify({client : clientUsername , otherName : otherUsername});

	}

	/*

	Formulates the JSON emitted on REQUEST_ROOM event.

	*/
	function formRequestRoomJSON(roomName) {

		return JSON.stringify({roomName : roomName , username : clientUsername});

	}

	//all public tokens
	return {

		/* Prepended to all log calls. */
		LOG_PREPEND: "[SU CHAT CLIENT] " ,
		
		/* The join room event name. */
		JOIN_ROOM_EVENT: "joinRoom" ,

		/* Client receive message event name. */
		CLIENT_RECEIVE_MESSAGE_EVENT: "client_messageReceived" ,

		/* Client send messag event name. */
		CLIENT_SEND_MESSAGE_EVENT: "client_messageSent" ,

		/* Server send message event name. */
		SERVER_SEND_MESSAGE_EVENT: "server_messageSent" ,

		/* Query Room Log event name. */
		GET_ROOM_LOGS_EVENT: "getRoomLogs" ,

		/* Leave all rooms event name. */
		LEAVE_ALL_ROOMS_EVENT: "leaveAllRooms" ,

		/* Request new room event name. */
		REQUEST_NEW_ROOM_EVENT: "requestNewRoom" ,

		/* Request room event name. */
		REQUEST_ROOM_EVENT: "requestRoom" ,

		/* Set room ID event name. */
		SET_ROOM_ID_EVENT: "setRoomID" ,

		/*

		Initializes the SUC socket instance. 
		Parameters:
			username — the username of the client who is connecting to the server

		*/
		initializeSocket: function(username) {

			// if(clientUsername != null) throw new Error("Socket already initialized.");

			clientUsername = username;
			theSocketIO = io();
			theSocketIO.on(this.CLIENT_RECEIVE_MESSAGE_EVENT , response => this.onReceive(response));
			theSocketIO.on(this.SET_ROOM_ID_EVENT , response => this.setRoomID(response))

		} ,

		/*

		Joins a room of the given room ID.
		Parameters:
			roomID — ID of a room to join

		*/
		joinRoom: function(roomID) {

			this.log("Joining Room: " + roomID);
			clientRoomID = roomID;
			theSocketIO.emit(this.JOIN_ROOM_EVENT , formOnJoinEventJSON(roomID))

		} ,

		/*

		Invoked when a message is received by the client.
		Parameters:
			receivedJSON — JSON received from the server for receiving a message

		*/
		onReceive: function(receivedJSON) {

			this.log(receivedJSON.originalSender + " says " + receivedJSON.message);
			const callbacks = onReceiveMessageCallbackMap.values();
			for(const callback of callbacks) callback(receivedJSON);

		} ,
 		
 		/* 

 		Sends the given message to the server.
 		Parameters:
 			string — the string representing a message to send to the server

 		*/
		sendMessage: function(string) {

			let response = formSendMessageEventJSON(string);
			theSocketIO.emit(this.CLIENT_SEND_MESSAGE_EVENT , response);

		} ,

		/*

		Attaches a callback to invoke when a message is received. 
		callback will be invoked when a message is received from the server. It accepts the JSON received from the server.
		Parameters:
			key — key object to store the callback by
			callback — code to invoke when receiving a message

		*/
		attachOnReceiveMessage: function(key , callback) {

			onReceiveMessageCallbackMap.set(key , callback);

		} ,

		/*

		Detaches a callback to invoke when a message is received.
		This stops a callback previously given to suc.attachOnReceiveMessage from being invoked. The callback given to suc.attachOnReceiveMessage
		is returned.
		Parameters:
			key — the key used to identify a callback previously given to suc.attachOnReceiveMessage

		*/
		detachOnReceiveMessage: function(key) {

			callback = onReceiveMessageCallbackMap.get(key);
			onReceiveMessageCallbackMap.delete(key);
			return callback;

		} ,

		/*

		Attaches a callback to invoke when joining a room. 
		callback will be invoked when a response is yielded from the server after a room is joined. It receives the JSON received from the server.
		Parameters:
			key — key object to store the callback by
			callback — code to invoke when receiving a message

		*/
		attachOnJoinRoom: function(key , callback) {

			onJoinRoomCallbackMap.set(key , callback);

		} ,

		/*

		Detaches a callback to invoke when joining a room.
		This stops a callback previously given to suc.attachOnJoinRoom from being invoked. The callback given to suc.attachOnJoinRoom is returned.
		Parameters:
			key — the key used to identify a callback previously given to suc.attachOnJoinRoom

		*/
		detachOnJoinRoom: function(key) {

			callback = onJoinRoomCallbackMap.get(key);
			onJoinRoomCallbackMap.delete(key);
			return callback;

		} ,

		leaveAllRooms: function() {

			theSocketIO.emit(this.LEAVE_ALL_ROOMS_EVENT , formLeaveAllRoomsJSON());

		} ,

		/*

		Requests the server to generate a new room. The room is named after the client's username and the other user's username. A request for a roomID is still required to join the room.
		Parameters:
			recipientUsername — the username of the recipient for chats.

		*/
		requestNewRoom: function(recipientUsername) {

			theSocketIO.emit(this.REQUEST_NEW_ROOM_EVENT , formRequestNewRoomJSON(recipientUsername));

		} ,

		/*
		
		Shorthand for creating a room of a certain name and joining it.
		Parameters:
			roomName — name of the room to join. This room will either be created if none exists or joined if it already does.

		*/
		requestRoom: function(roomName) {

			theSocketIO.emit(this.REQUEST_ROOM_EVENT , formRequestRoomJSON(roomName))

		} ,

		/*

		Sets the room ID the client is communcating in manually.
		Parameters:
			newRoomID — new ID to set the room to join to.

		*/
		setRoomID: function(response) {

			clientRoomID = response.roomID;

		} ,

		/*

		Emits an event to the server to return the chat log for the given room. Once returned, onReceiveCallback is invoked which receives the
		JSON returned by the server.
		Paraemeters:
			roomID — the room ID whose chat logs are being queried
			onReceiveCallback — code to invoke when the server returns the chat log

		*/
		getRoomLogs: function(roomID , onReceiveCallback) {

			theSocketIO.emit(this.GET_ROOM_LOGS_EVENT , formGetRoomLogsEventJSON(roomID));

		} ,

		/* Utility logging function. */
		log: function(data) {

			console.log(this.LOG_PREPEND + data);

		} 

	};

})();