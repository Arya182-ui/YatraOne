import React, { useState } from 'react';
import { useRealtimeNotifications } from '../../lib/useRealtimeNotifications';
import { notificationAPI } from '../../lib/api';

interface Props {
  userType: 'admin' | 'user' | 'driver' | 'officer';
  userId: string;
  onCloseModal?: () => void;
  showAll?: boolean;
}


const NotificationList: React.FC<Props> = ({ userType, userId, onCloseModal, showAll }) => {
  const allNotifications = useRealtimeNotifications(userType, userId);
  // Filter out expired notifications
  const now = Date.now();
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  // If showAll, show all notifications (including read/expired), else only unread and not expired
  const notifications = showAll
    ? allNotifications
    : allNotifications.filter(n => !n.isRead && (!n.expiresAt || new Date(n.expiresAt).getTime() > now));
  const visibleNotifications = notifications.filter(n => !hiddenIds.includes(n.id));

  // Pagination state
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const paginatedNotifications = visibleNotifications.slice(0, page * PAGE_SIZE);
  const hasMore = visibleNotifications.length > paginatedNotifications.length;


  const [loadingAll, setLoadingAll] = useState(false);
  const handleMarkAsRead = async (id: string) => {
    setHiddenIds(ids => [...ids, id]);
    try {
      await notificationAPI.markAsRead(userType, userId, id);
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    setLoadingAll(true);
    try {
      await notificationAPI.markAllAsRead(userType, userId);
      setHiddenIds(notifications.map(n => n.id));
    } catch {}
    setLoadingAll(false);
  };

  // Mark as read on click
  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) await handleMarkAsRead(n.id);
    // If actionUrl, open in new tab
    if (n.actionUrl) window.open(n.actionUrl, '_blank');
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-lg w-full">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
        <div className="flex gap-2">
          <button
            className="text-blue-600 hover:underline text-xs disabled:opacity-60"
            onClick={handleMarkAllAsRead}
            disabled={loadingAll}
          >
            {loadingAll ? 'Marking...' : 'Mark All as Read'}
          </button>
          {onCloseModal && (
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={onCloseModal}
            >
              Close
            </button>
          )}
        </div>
      </div>
      {visibleNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="1.5" d="M12 22c1.104 0 2-.896 2-2h-4c0 1.104.896 2 2 2Zm6-6V9a6 6 0 1 0-12 0v7l-2 2v1h16v-1l-2-2Z"/></svg>
          <div className="mt-2 text-base">No notifications</div>
        </div>
      )}
      <ul className="space-y-3">
        {paginatedNotifications.map(n => (
          <li
            key={n.id}
            className={`group transition border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start justify-between gap-2 shadow-sm hover:shadow-md cursor-pointer bg-white dark:bg-gray-800 ${!n.isRead ? 'ring-2 ring-blue-100 dark:ring-blue-900/30' : ''}`}
            onClick={() => handleNotificationClick(n)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                {n.icon && <span className="inline-block w-5 h-5"><img src={n.icon} alt="icon" className="w-5 h-5" /></span>}
                <span className="truncate">{n.title}</span>
                {n.priority === 'urgent' && <span className="ml-1 text-xs text-red-600 font-bold">URGENT</span>}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-3">{n.message}</div>
              <div className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
              {n.actionUrl && n.actionText && (
                <a
                  href={n.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:underline text-xs"
                  onClick={e => e.stopPropagation()}
                >
                  {n.actionText}
                </a>
              )}
              {n.actions && n.actions.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {n.actions.map((a: any, i: number) => (
                    a.url ? (
                      <a
                        key={i}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        {a.text}
                      </a>
                    ) : (
                      <button
                        key={i}
                        className="text-xs text-blue-600 hover:underline"
                        onClick={e => {
                          e.stopPropagation();
                          if (a.onClickType === 'markAsRead') handleMarkAsRead(n.id);
                          // Add more custom actions as needed
                        }}
                      >
                        {a.text}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                onClick={e => { e.stopPropagation(); handleMarkAsRead(n.id); }}
              >
                Mark as Read
              </button>
              <button
                className="px-2 py-1 text-xs bg-red-100 dark:bg-red-800 rounded hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-700"
                onClick={async e => {
                  e.stopPropagation();
                  setHiddenIds(ids => [...ids, n.id]);
                  try {
                    await notificationAPI.deleteNotification(userType, userId, n.id);
                  } catch (err) {
                    // Optionally show error to user
                    // eslint-disable-next-line no-console
                    console.error('Failed to delete notification', err);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm"
            onClick={() => setPage(p => p + 1)}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
