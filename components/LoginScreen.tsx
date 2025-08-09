

import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Modal } from './ui';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { addToast } = useToast();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addToast(`Password reset instructions sent to ${email}`, 'success');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Forgot Password" size="md">
            <p className="text-brand-text-secondary mb-4">Enter your email address and we'll send you instructions to reset your password.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Send Instructions</Button>
                </div>
            </form>
        </Modal>
    );
};

export const LoginScreen: React.FC = () => {
  const { login, loading } = useAuth();
  const { addToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotModalOpen, setForgotModalOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (!success) {
        addToast('Wrong email or password.', 'error');
    }
  };
  
  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <Card className="max-w-md w-full !bg-brand-primary">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            <span className="text-brand-text-primary">HAWLA</span><span className="text-brand-accent">DER</span>
          </h1>
          <p className="text-brand-text-secondary mt-2">Manufacturing Management</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <h2 className="text-xl font-semibold text-center text-brand-text-primary">Sign In</h2>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"/>
          <div className="text-right">
            <button type="button" onClick={() => setForgotModalOpen(true)} className="text-sm text-brand-accent hover:underline">Forgot password?</button>
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-xs text-brand-text-secondary">
          <p>This is a managed system. Access is restricted.</p>
          <p>Please contact an administrator if you need an account.</p>
        </div>
      </Card>
    </div>
    <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setForgotModalOpen(false)} />
    </>
  );
};