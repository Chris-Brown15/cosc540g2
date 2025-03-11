/*



*/

/**
 * Handle username submission:
 */
document.getElementById("userInputForm").addEventListener("submit" , event => {

	event.preventDefault();
	var formData = new FormData();
	formData.append("username" , document.getElementById("username").value.trim());

	//submit the username to the given server
	fetch("/registerUser" , {
		method: "POST", 
		body: formData
	})
	.then(response => response.json())
	.then(json => {

		if(json.error) { 

			document.getElementById("acceptUsername").innerHTML = "Error: " + json.error;
			return;
		
		}

		suc.initializeSocket(json.username);
		suc.attachOnReceiveMessage("update html on receive" , json => {

			let chats = document.getElementById("chats");
			chats.innerHTML += json.originalSender + " says: " + json.message + "<br>";

		});

		suc.attachOnJoinRoom("get logs on joined room" , json => {

			suc.getRoomLogs(json.roomID , logs => {});

		});

		document.getElementById("acceptUsername").innerHTML = "Logged in as: " + json.username;
		let roomsElement = document.getElementById("rooms");
		
		let roomKeys = json.roomKeys;
		let allRooms = json.roomNames;

		for(var i = 0 ; i < allRooms.length ; i = i + 1) {

			let key = roomKeys[i];
			let room = allRooms[i];

			roomsElement.innerHTML += 
				"<input type=\"radio\" id=\"" + room + "\" name=\"rooms\" onclick=\"suc.joinRoom(" + key + ")\">" + room + "</input>";
			
		}

		//sends the chat message to the server
		document.getElementById("chats").innerHTML = 
			"<input id=\"chatMessageBox\" type=\"text\"></input><button onclick=\"suc.sendMessage(getChatMessageBoxString())\">Send</button> <br>";


	})
	.catch(error => console.error("ERROR:" , error));

});

function getChatMessageBoxString() {
	
	chatBox = document.getElementById("chatMessageBox");
	message = chatBox.value.trim();
	if(message === "") return;
	chatBox.value = "";
	return message;

}