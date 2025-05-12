async function createConversation(tradeId, participantIds) {
  try {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trade_id: tradeId,
        participants: participantIds
      }),
    });
    const result = await response.json();
    if (response.ok) {
      console.log('Conversation created!', result);
      document.getElementById('createConversationResult').innerText = `Conversation Created! ID: ${result.conversation_id}`;
      // After creating, automatically fetch and show the conversation
      fetchConversation(result.conversation_id);
    } else {
      console.error('Error creating conversation:', result.error);
    }
  } catch (error) {
    console.error('Failed to create conversation:', error);
  }
}

async function fetchConversation(conversationId) {
  try {
    const response = await fetch(`/api/conversations/${conversationId}`);
    const conversation = await response.json();
    if (response.ok) {
      console.log('Fetched conversation:', conversation);
      const formatted = JSON.stringify(conversation, null, 2);
      document.getElementById('createConversationResult').innerText += `\nFetched Conversation:\n${formatted}`;
    } else {
      console.error('Error fetching conversation:', conversation.error);
    }
  } catch (error) {
    console.error('Failed to fetch conversation:', error);
  }
}

document.getElementById('createConversationForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const tradeId = document.getElementById('tradeIdInput').value;
  const participant1 = document.getElementById('participant1Input').value;
  const participant2 = document.getElementById('participant2Input').value;
  createConversation(tradeId, [participant1, participant2]);
});