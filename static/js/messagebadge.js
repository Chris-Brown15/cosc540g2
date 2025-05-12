// --- Badge control functions for chat icon ---
function showNewMessageBadge(count = 1) {
  const badge = document.getElementById('chatNotificationBadge');
  badge.innerText = count;
  badge.classList.remove('hidden');
}
function hideNewMessageBadge() {
  const badge = document.getElementById('chatNotificationBadge');
  badge.classList.add('hidden');
}