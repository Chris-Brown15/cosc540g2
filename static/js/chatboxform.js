async function chatWithUser(username, messageText) {
  try {
    const lookupResponse = await fetch(`/api/users/lookup?username=${encodeURIComponent(username)}`);
    const lookupResult = await lookupResponse.json();

    if (!lookupResponse.ok) {
      document.getElementById('chatBoxResult').innerText = `User not found: ${username}`;
      return;
    }

    const recipientId = lookupResult.user_id;
    const yourUserId = currentUser.id; // use your logged in user ID

    const convoResponse = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trade_id: yourUserId, // Placeholder
        participants: [yourUserId, recipientId],
      }),
    });

    const convoResult = await convoResponse.json();
    if (!convoResponse.ok) {
      document.getElementById('chatBoxResult').innerText = `Error creating conversation: ${convoResult.error}`;
      return;
    }

    const conversationId = convoResult.conversation_id;

    // Send message
    const sendMessageResponse = await fetch(`/api/conversations/${conversationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: yourUserId,
        text: messageText,
        timestamp: new Date().toISOString(),
        images: [],
      }),
    });

    if (!sendMessageResponse.ok) {
      const errorData = await sendMessageResponse.json();
      document.getElementById('chatBoxResult').innerText = `Failed to send message: ${errorData.error}`;
      return;
    }

    // Message sent — Now Fetch the whole conversation
    const getConvoResponse = await fetch(`/api/conversations/${conversationId}`);
    const convoData = await getConvoResponse.json();

    if (!getConvoResponse.ok) {
      document.getElementById('chatBoxResult').innerText = `Error fetching conversation!`;
      return;
    }

    // Build HTML of all messages
    const messagesHtml = convoData.messages.map(msg => {
      const sender = (msg.sender_id === yourUserId) ? "You" : "Them";
      return `<div><strong>${sender}:</strong> ${msg.text}</div>`;
    }).join("");

    document.getElementById('chatBoxResult').innerHTML = `
      <h4>Conversation with ${username}:</h4>
      ${messagesHtml}
    `;

    // Clear the form
    document.getElementById('chatBoxForm').reset();

  } catch (error) {
    console.error('Chat error:', error);
    document.getElementById('chatBoxResult').innerText = `Error: ${error.message}`;
  }
}

document.getElementById('chatBoxForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('recipientUsername').value.trim();
  const message = document.getElementById('chatMessage').value.trim();
  chatWithUser(username, message);
});