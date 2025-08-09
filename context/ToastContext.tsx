
import React, { useState, useCallback, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- Toast System ---
interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}
interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error') => void;
}
const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Provide a non-crashing fallback, although this should ideally not be reached
    // if the provider is correctly set up at the root.
    console.error('useToast must be used within a ToastProvider');
    return {
        addToast: (message: string, type: 'success' | 'error') => {
            console.log(`Toast (${type}): ${message}`);
        }
    };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, 5000);
  }, []);
  
  const removeToast = (id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2">
        <AnimatePresence>
        {toasts.map(toast => (
          <motion.div 
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            onClick={() => removeToast(toast.id)}
            className={`flex items-center p-4 rounded-lg shadow-lg text-white cursor-pointer ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
