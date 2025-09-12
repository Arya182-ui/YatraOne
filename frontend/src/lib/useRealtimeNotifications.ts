import { useEffect, useState } from 'react';
import { db } from './firebase';
import { ref, onValue, off } from 'firebase/database';
import { Notification } from '../types';

/**
 * Listen to real-time notifications for any role (user, admin, driver, officer)
 * @param userType - role type (user, admin, driver, officer)
 * @param userId - id of the user/role (for global admin notifications, pass 'global')
 */
export function useRealtimeNotifications(userType: 'admin' | 'user' | 'driver' | 'officer', userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    if (!userType || !userId) return;
    const notifRef = ref(db, `notifications/${userType}/${userId}`);
    const handler = (snapshot: any) => {
      const val = snapshot.val();
      if (!val) return setNotifications([]);
      // Convert object to array, newest first
      const arr = Object.entries(val).map(([id, n]) => ({ id, ...(n as any) }));
      arr.sort((a, b) => (b.createdAt || b.timestamp || '').localeCompare(a.createdAt || a.timestamp || ''));
      setNotifications(arr.reverse());
    };
    onValue(notifRef, handler);
    return () => off(notifRef, 'value', handler);
  }, [userType, userId]);
  return notifications;
}
