// Chat variables
let currentChatUserId = null;
let currentChatUsername = null;
let activeConversationId = null;
let chatVisible = false;

// DOM Elements
const chatUsersList = document.getElementById('chatUsersList');
const chatContainer = document.getElementById('chatContainer');
const chatUsersContainer = document.getElementById('chatUsersContainer');
const chatUserName = document.getElementById('chatUserName');
const chatUserStatus = document.getElementById('chatUserStatus');
const chatUserAvatar = document.getElementById('chatUserAvatar');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const openChatButton = document.getElementById('openChatButton');
const closeChatBtn = document.getElementById('closeChatBtn');
const minimizeChatBtn = document.getElementById('minimizeChatBtn');
const chatNotificationBadge = document.getElementById('chatNotificationBadge');

// Event Listeners
openChatButton.addEventListener('click', toggleChatUsersList);
closeChatBtn.addEventListener('click', closeChat);
minimizeChatBtn.addEventListener('click', minimizeChat);
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Functions
function toggleChatUsersList() {
  // Toggle visibility
  if (chatUsersList.classList.contains('hidden')) {
    chatUsersList.classList.remove('hidden');
    loadChatUsers();
    hideNewMessageBadge();
    chatUsersList.style.bottom = "140px";
  } else {
    chatUsersList.classList.add('hidden');
  }
  
  // Always hide the chat container when showing the user list
  if (!chatContainer.classList.contains('hidden')) {
    chatContainer.classList.add('hidden');
  }
}

function openChatWithUser(userId, username, avatarSrc = null) {
  // Set the current chat user
  currentChatUserId = userId;
  currentChatUsername = username;

  // Update the chat header
  chatUserName.textContent = username;
  chatUserStatus.textContent = 'Active now'; 

  /* SwitchUp Chat initialization */

  //borrowed from elsewhere.
  let myUsername = currentUser.email.split('@')[0]; 
  
  suc.initializeSocket(myUsername);
  suc.attachOnReceiveMessage("update html on receive" , json => {

    console.log(json.originalSender +  " says: " + json.message);

  });

  
  suc.requestNewRoom(currentChatUsername);

  //TODO: 
  /*
  
  1) Request and join the newly created chat room's ID via fetch, 
  2) Append new texts to the HTML
  3) images...

  */

  // suc.joinRoom(myUsername + "&&&" + currentChatUsername);  

  // Set avatar
  if (avatarSrc) {
    chatUserAvatar.src = avatarSrc;
  } else {
    // Create default avatar with user initials
    chatUserAvatar.src = `/static/images/default-avatar.png`;
  }
  
  // Clear previous messages
  chatMessages.innerHTML = '';
  
  // Show the chat container
  chatContainer.classList.remove('hidden');
  
  // Hide the user list
  chatUsersList.classList.add('hidden');
  
  // Set chat as visible
  chatVisible = true;
  
  // Load conversation history if available
  loadConversation(userId);
}

function closeChat() {
  chatContainer.classList.add('hidden');
  chatUsersList.classList.add('hidden');
  chatVisible = false;
}

function minimizeChat() {
  chatContainer.classList.add('hidden');
  chatVisible = false;
}

function showNewMessageBadge(count = 1) {
  chatNotificationBadge.textContent = count;
  chatNotificationBadge.classList.remove('hidden');
}

function hideNewMessageBadge() {
  chatNotificationBadge.classList.add('hidden');
}

async function loadChatUsers() {
  if (!currentUser) {
    chatUsersContainer.innerHTML = '<div style="padding: 15px; text-align: center;">Please log in to chat</div>';
    chatUsersList.classList.remove('hidden');
    return;
  }
  
  try {
    const response = await fetch('/api/users/all');
    if (!response.ok) {
      throw new Error('Failed to load users');
    }
    
    const users = await response.json();
    chatUsersContainer.innerHTML = '';
    
    if (users.length <= 1) {
      chatUsersContainer.innerHTML = '<div style="padding: 15px; text-align: center;">No other users available to chat with</div>';
      return;
    }
    
    users.forEach(user => {
      // Skip the current user
      if (currentUser && user._id === currentUser.id) return;
      
      const userElement = document.createElement('div');
      userElement.className = 'chat-user-item';
      userElement.dataset.userId = user._id;
      
      // Create initials for avatar
      const initials = user.username.substring(0, 2).toUpperCase();
      
      userElement.innerHTML = `
        <div class="chat-user-avatar">${initials}</div>
        <div class="chat-user-info">
          <div class="chat-user-name">${user.username}</div>
          <div class="chat-user-status">
            <span class="online-indicator"></span>
            Active now
          </div>
        </div>
      `;
      
      userElement.addEventListener('click', () => {
        if (!currentUser) {
          showAuthModal();
          chatUsersList.classList.add('hidden');
        } else {
          openChatWithUser(user._id, user.username);
        }
      });
      
      chatUsersContainer.appendChild(userElement);
    });
  } catch (error) {
    console.error('Error loading chat users:', error);
    chatUsersContainer.innerHTML = '<div style="padding: 15px; text-align: center;">Failed to load users</div>';
  }
}

async function loadConversation(userId) {
  if (!currentUser) return;
  
  try {
    // Check if a conversation already exists
    const checkResponse = await fetch(`/api/conversations/check?user1=${currentUser.id}&user2=${userId}`);
    const checkData = await checkResponse.json();
    
    if (checkData.exists) {
      // Conversation exists, load it
      activeConversationId = checkData.conversation_id;
      const convoResponse = await fetch(`/api/conversations/${activeConversationId}`);
      const conversation = await convoResponse.json();
      
      // Display messages
      displayMessages(conversation.messages);
    } else {
      // No existing conversation, create a new one when the first message is sent
      activeConversationId = null;
      chatMessages.innerHTML = '<div class="text-center p-3">No messages yet. Say hello!</div>';
    }
  } catch (error) {
    console.error('Error loading conversation:', error);
    chatMessages.innerHTML = '<div class="text-center p-3">Failed to load messages</div>';
  }
}

function displayMessages(messages) {
  chatMessages.innerHTML = '';
  
  if (!messages || messages.length === 0) {
    chatMessages.innerHTML = '<div class="text-center p-3">No messages yet. Say hello!</div>';
    return;
  }
  
  messages.forEach(message => {
    const isCurrentUser = message.sender_id === currentUser.id;
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isCurrentUser ? 'message-sent' : 'message-received'}`;
    
    // Format timestamp
    const timestamp = new Date(message.timestamp);
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
      ${message.text}
      <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageElement);
  });
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentChatUserId || !currentUser) return;
  
  try {
    if (!activeConversationId) {
      // Create a new conversation
      const createResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_id: currentUser.id, // Using current user ID as placeholder
          participants: [currentUser.id, currentChatUserId]
        })
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create conversation');
      }
      
      const createResult = await createResponse.json();
      activeConversationId = createResult.conversation_id;
    }
    
    // Send the message
    const sendResponse = await fetch(`/api/conversations/${activeConversationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: currentUser.id,
        text: text,
        timestamp: new Date().toISOString(),
        images: []
      })
    });
    
    if (!sendResponse.ok) {
      throw new Error('Failed to send message');
    }
    
    suc.sendMessage(text);

    // Add message to the UI
    const messageElement = document.createElement('div');
    messageElement.className = 'message message-sent';
    
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
      ${text}
      <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    
    // Clear input
    messageInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Reload conversation to get any potential new messages
    loadConversation(currentChatUserId);
    
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  }
}

// Initialize chat if user is logged in
document.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    // Show notification badge to indicate new messages (for demo)
    setTimeout(() => {
      showNewMessageBadge(2);
    }, 3000);
  }
});