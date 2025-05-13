'use client';

import { useState } from 'react';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '../utils/notifications';

export default function NotificationSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      await subscribeToPushNotifications();
      setIsSubscribed(true);
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Failed to subscribe to notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsLoading(true);
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      alert('Failed to unsubscribe from notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={isLoading}
        className={`px-4 py-2 rounded-md ${
          isSubscribed
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white disabled:opacity-50`}
      >
        {isLoading
          ? 'Loading...'
          : isSubscribed
          ? 'Unsubscribe from Notifications'
          : 'Subscribe to Notifications'}
      </button>
    </div>
  );
} 