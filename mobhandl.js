// Keep mobile connection alive when waking up the screen
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && peer && peer.disconnected) {
    console.log('Mobile tab resumed. Reconnecting signaling broker...');
    peer.reconnect();
  }
});