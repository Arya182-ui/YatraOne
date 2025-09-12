import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import NotificationList from './NotificationList';
import { useRealtimeNotifications } from '../../lib/useRealtimeNotifications';

const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-0 sm:p-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

interface NotificationBellProps {
  userType: 'admin' | 'user' | 'driver' | 'officer';
  userId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userType, userId }) => {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const notifications = useRealtimeNotifications(userType, userId);
  const now = Date.now();
  const unreadNotifications = notifications.filter(n => !n.isRead && (!n.expiresAt || new Date(n.expiresAt).getTime() > now));
  const unreadCount = unreadNotifications.length;

  return (
    <div className="relative inline-block text-left">
      <button
        ref={bellRef}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs flex items-center justify-center rounded-full px-1 border-2 border-white dark:border-gray-900">
            {unreadCount}
          </span>
        )}
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 pt-4 pb-2">
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded-t-md text-sm font-medium transition-colors ${!showAll ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setShowAll(false)}
              >
                Unread
              </button>
              <button
                className={`px-3 py-1 rounded-t-md text-sm font-medium transition-colors ${showAll ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setShowAll(true)}
              >
                All
              </button>
            </div>
            <button
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold px-2 py-1"
              onClick={() => { setOpen(false); setShowAll(false); }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="px-0 pb-2">
            <NotificationList
              userType={userType}
              userId={userId}
              onCloseModal={() => {
                setOpen(false);
                setShowAll(false);
              }}
              showAll={showAll}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationBell;
