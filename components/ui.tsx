import React, { useState, useCallback, createContext, useContext } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseClasses = 'font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center shadow-lg hover:shadow-xl rounded-lg';
  const variantClasses = {
    primary: 'bg-brand-accent hover:bg-brand-accent-hover focus:ring-brand-accent',
    secondary: 'bg-dark-secondary hover:bg-dark-tertiary focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-lg',
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, gradient = false }) => (
  <div className={`rounded-xl shadow-lg p-6 ${gradient ? 'bg-gradient-card' : 'bg-dark-primary'} ${className}`}>{children}</div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = '4xl' }) => {
  if (!isOpen) return null;
  const sizeClasses = {
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className={`bg-brand-primary rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center p-4 border-b border-dark-secondary">
          <h2 className="text-xl font-bold text-dark-text-primary">{title}</h2>
          <button onClick={onClose} className="text-dark-text-secondary hover:text-dark-text-primary text-3xl font-light">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className }) => (
  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${className}`}>{children}</span>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
export const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
    const unstyled = !label;
    const baseClasses = 'block w-full sm:text-sm';
    const styledClasses = 'px-3 py-2 bg-dark-secondary border border-dark-tertiary rounded-md shadow-sm text-dark-text-primary placeholder-slate-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent';
    const unstyledClasses = 'bg-transparent text-black focus:outline-none focus:ring-0 rounded-sm p-1 -m-1 border-b border-transparent focus:border-gray-400';

    return (
        <div>
            {label && <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>}
            <input id={id} {...props} className={`${baseClasses} ${unstyled ? unstyledClasses : styledClasses} ${props.className}`} />
        </div>
    );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
    valueColor?: string;
    className?: string;
}
export const Select: React.FC<SelectProps> = ({ label, id, children, valueColor, className, ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>}
        <select id={id} {...props} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-tertiary focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md transition-colors bg-dark-secondary text-dark-text-primary ${className}`}>
            {children}
        </select>
    </div>
);


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}
export const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => {
    const unstyled = !label;
    const baseClasses = 'mt-1 block w-full sm:text-sm';
    const styledClasses = 'px-3 py-2 bg-dark-secondary border border-dark-tertiary rounded-md shadow-sm text-dark-text-primary placeholder-slate-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent';
    const unstyledClasses = 'bg-transparent text-black focus:outline-none focus:ring-0 rounded-sm p-1 -m-1 resize-none border-b border-transparent focus:border-gray-400';

    return (
        <div>
            {label && <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>}
            <textarea id={id} {...props} rows={unstyled ? 1 : 3} className={`${baseClasses} ${unstyled ? unstyledClasses : styledClasses} ${props.className}`} />
        </div>
    );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmationWord?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmationWord }) => {
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState('');

  const handleConfirmClick = () => {
    if (confirmationWord) {
      setStep(2);
    } else {
      onConfirm();
    }
  };

  const handleFinalConfirm = () => {
    if (inputValue === confirmationWord) {
      onConfirm();
    } else {
      alert("Confirmation text does not match.");
    }
  };

  const handleClose = () => {
    setStep(1);
    setInputValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
      <div className="text-dark-text-primary">
        {step === 1 ? (
          <>
            <div className="text-dark-text-secondary">{message}</div>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmClick}>
                {confirmationWord ? 'Continue' : 'Confirm Delete'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-dark-text-secondary">This action cannot be undone. To confirm, please type "<strong className="text-red-400">{confirmationWord}</strong>" in the box below.</p>
            <Input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="mt-4"
              autoFocus
            />
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleFinalConfirm} disabled={inputValue !== confirmationWord}>
                Confirm Delete
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>;
export const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="18" y2="18"/></svg>;

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
    throw new Error('useToast must be used within a ToastProvider');
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

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center p-4 rounded-lg shadow-lg text-white animate-fade-in-out ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};