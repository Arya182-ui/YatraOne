import React, { useState } from 'react';

const NOTIF_TYPES = [
  { value: 'push', label: 'Push Notification' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
];

const RECIPIENTS = [
  { value: 'all', label: 'All Users' },
  { value: 'users', label: 'Users Only' },
  { value: 'drivers', label: 'Drivers Only' },
  { value: 'custom', label: 'Custom' },
];

const NotificationSender: React.FC = () => {
  const [notifType, setNotifType] = useState('push');
  const [recipient, setRecipient] = useState('all');
  const [customList, setCustomList] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notifType,
          recipient,
          customList: customList.split(/[\s,;]+/).filter(Boolean),
          title,
          message,
        }),
      });
      if (!res.ok) throw new Error('Notification failed');
      setSuccess('Notification sent!');
      setTitle('');
      setMessage('');
      setCustomList('');
    } catch (err: any) {
      setError(err.message || 'Notification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-white dark:bg-gray-900 shadow mt-6">
      <h2 className="text-lg font-bold mb-2">Send Notification</h2>
      <div className="mb-2">
        <label className="mr-2 font-medium">Type:</label>
        <select value={notifType} onChange={e => setNotifType(e.target.value)} className="border rounded px-2 py-1">
          {NOTIF_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="mr-2 font-medium">Recipients:</label>
        <select value={recipient} onChange={e => setRecipient(e.target.value)} className="border rounded px-2 py-1">
          {RECIPIENTS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      {recipient === 'custom' && (
        <div className="mb-2">
          <label className="block font-medium mb-1">Custom List (comma, space, or semicolon separated):</label>
          <input
            type="text"
            value={customList}
            onChange={e => setCustomList(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter emails or phone numbers"
          />
        </div>
      )}
      <div className="mb-2">
        <label className="block font-medium mb-1">Title:</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          placeholder="Notification title"
        />
      </div>
      <div className="mb-2">
        <label className="block font-medium mb-1">Message:</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          rows={3}
          placeholder="Notification message"
        />
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleSend}
        disabled={loading || !title || !message}
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </div>
  );
};

export default NotificationSender;
