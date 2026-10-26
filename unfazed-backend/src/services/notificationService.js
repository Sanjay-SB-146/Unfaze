export const notificationQueue = [];

export const triggerNotification = ({ type, recipientName, recipientPhone, message }) => {
  const event = {
    id: `notif_${Date.now()}`,
    type,
    recipientName,
    recipientPhone,
    message,
    status: 'delivered',
    timestamp: new Date().toISOString()
  };
  notificationQueue.unshift(event);
  console.log(`[NotificationService] Event dispatched: ${type} to ${recipientPhone}`);
  return event;
};
