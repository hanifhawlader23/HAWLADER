

import React, { useState, useCallback, createContext, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseClasses = 'font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center shadow-lg hover:shadow-xl rounded-lg';
  const variantClasses = {
    primary: 'bg-gradient-to-br from-brand-accent to-deep-rose text-brand-text-on-accent focus:ring-brand-accent border-deep-rose border-b-4 hover:border-b-2 active:border-b-0',
    secondary: 'bg-brand-secondary hover:bg-brand-tertiary text-brand-text-primary focus:ring-brand-accent',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-warm-beige border-red-800 border-b-4 hover:border-b-2 active:border-b-0',
  };
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-lg',
  };
  return (
    <motion.button 
      whileHover={{ y: -2 }}
      whileTap={{ y: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </motion.button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, gradient = false }) => (
  <motion.div className={`rounded-xl shadow-lg p-4 md:p-6 border border-brand-tertiary/50 ${gradient ? 'bg-gradient-card' : 'bg-brand-primary'} ${className}`}>{children}</motion.div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = '4xl' }) => {
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
    <AnimatePresence>
    {isOpen && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-deep-rose bg-opacity-30 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`bg-brand-primary rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
            >
            <div className="flex justify-between items-center p-4 border-b border-brand-tertiary">
              <h2 className="text-xl font-bold text-brand-text-primary">{title}</h2>
              <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary text-3xl font-light">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
            </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
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
    unstyled?: boolean;
}
export const Input: React.FC<InputProps> = ({ label, id, unstyled, ...props }) => {
    const isUnstyled = unstyled || !label;
    const baseClasses = 'block w-full sm:text-sm';
    const styledClasses = 'px-3 py-2 bg-brand-secondary border border-brand-tertiary rounded-md shadow-sm text-brand-text-primary placeholder-brand-text-secondary placeholder-opacity-70 focus:outline-none focus:ring-brand-accent focus:border-brand-accent';
    const unstyledClasses = 'bg-transparent text-brand-text-primary focus:outline-none focus:ring-0 rounded-sm p-1 -m-1 border-b border-transparent focus:border-gray-400';

    return (
        <div>
            {label && <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>}
            <input id={id} {...props} className={`${baseClasses} ${isUnstyled ? unstyledClasses : styledClasses} ${props.className}`} />
        </div>
    );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
    valueColor?: string;
    className?: string;
}

const customArrow = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23B76E79' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

export const Select: React.FC<SelectProps> = ({ label, id, children, valueColor, className, ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>}
        <div className="relative mt-1">
            <select 
                id={id} 
                {...props} 
                className={`
                    appearance-none 
                    block w-full 
                    px-3 py-2 
                    sm:text-sm 
                    rounded-lg 
                    border-2 border-brand-tertiary/50
                    bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary
                    text-brand-text-primary 
                    font-semibold
                    shadow-lg 
                    hover:border-brand-accent/70
                    focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent
                    transition-all
                    ${className}`
                }
                style={{
                    backgroundImage: customArrow,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                }}
            >
                {children}
            </select>
        </div>
    </div>
);


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    unstyled?: boolean;
}
export const Textarea: React.FC<TextareaProps> = ({ label, id, unstyled, ...props }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isUnstyled = unstyled || !label;
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
        }
    }, [props.value]); // Re-run when value changes

    const baseClasses = 'mt-1 block w-full sm:text-sm overflow-hidden';
    const styledClasses = 'px-3 py-2 bg-brand-secondary border border-brand-tertiary rounded-md shadow-sm text-brand-text-primary placeholder-brand-text-secondary placeholder-opacity-70 focus:outline-none focus:ring-brand-accent focus:border-brand-accent';
    const unstyledClasses = 'bg-transparent text-brand-text-primary focus:outline-none focus:ring-0 rounded-sm p-1 -m-1 resize-none border-b border-transparent focus:border-gray-400';

    return (
        <div>
            {label && <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>}
            <textarea
                id={id}
                ref={textareaRef}
                {...props}
                rows={1} // Start with one row
                className={`${baseClasses} ${isUnstyled ? unstyledClasses : styledClasses} ${props.className}`}
            />
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
      <div className="text-brand-text-primary">
        {step === 1 ? (
          <>
            <div className="text-brand-text-secondary">{message}</div>
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
            <p className="text-brand-text-secondary">This action cannot be undone. To confirm, please type "<strong className="text-red-500">{confirmationWord}</strong>" in the box below.</p>
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
