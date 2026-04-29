import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../stores/notificationStore';
import { Bell, X, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

export const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, closePanel } = useNotificationStore();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 overflow-hidden z-50">
      <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-surface-600 dark:text-surface-300" />
          <span className="font-semibold text-surface-900 dark:text-surface-100">
            Notificações
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer"
              title="Marcar todas como lidas"
            >
              <Check size={16} />
            </button>
          )}
          <button
            onClick={closePanel}
            className="p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-surface-500 dark:text-surface-400">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = iconMap[notification.type] || Info;
            return (
              <div
                key={notification.id}
                className={`p-4 border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700/50 cursor-pointer ${
                  !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full ${
                    notification.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                    notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                    notification.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' :
                    'bg-red-100 dark:bg-red-900/30 text-red-500'
                  }`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-surface-900 dark:text-surface-100 truncate">
                        {notification.title}
                      </p>
                      <span className="text-xs text-surface-400 whitespace-nowrap">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="p-1 rounded text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {notification.link && (
                  <Link
                    to={notification.link}
                    className="mt-2 ml-8 text-sm text-primary-500 hover:text-primary-600 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver mais →
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};