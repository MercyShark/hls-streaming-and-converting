import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-2 sm:right-4 z-50 animate-slide-in">
      <div className="bg-green-600 text-white rounded-lg shadow-xl p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3 max-w-xs sm:max-w-md border border-green-500">
        <CheckCircle size={20} className="text-green-200 sm:w-6 sm:h-6 flex-shrink-0" />
        <p className="flex-1 font-medium text-sm sm:text-base">{message}</p>
        <button
          onClick={onClose}
          className="text-green-200 hover:text-white transition-colors"
        >
          <X size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </div>
  );
};

export default Notification;