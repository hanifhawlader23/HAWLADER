import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card, Input, Button, Modal } from './ui';

export const LoginScreen: React.FC = () => {
  const { login, signUp, loginWithBiometrics, requestPasswordReset, resetPassword } = useData();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Common fields
  const [username, setUsername] = useState(''); // This is now email
  const [password, setPassword] = useState('');
  
  // Sign up specific fields
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [actualUsername, setActualUsername] = useState('');

  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  // Forgot password state
  const [resetStep, setResetStep] = useState(1); // 1: enter email, 2: enter code and new pass, 3: success
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  
  useEffect(() => {
    async function checkBiometrics() {
        if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
            setIsBiometricSupported(true);
        }
    }
    checkBiometrics();
  }, []);

  const resetMainForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setActualUsername('');
    setError('');
    setSuccessMessage('');
  };

  const resetForgotPasswordForm = () => {
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setGeneratedCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetMessage('');
    setResetError('');
  }

  const handleOpenForgotPassword = () => {
    resetForgotPasswordForm();
    setForgotPasswordOpen(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (isSignUp) {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        const result = await signUp({
            username: actualUsername,
            password,
            fullName,
            email: username, // 'username' state is used for email
            phone
        });
        if (result.success) {
            setSuccessMessage(result.message);
            setIsSignUp(false); // Switch to login view
            resetMainForm();
        } else {
            setError(result.message);
        }
    } else {
        const result = await login(username, password);
        if (!result.success) {
            setError(result.message);
        }
    }
  };
  
  const handleBiometricLogin = async () => {
      setError('');
      const result = await loginWithBiometrics();
      if (!result.success) {
          setError(result.message);
      }
  }

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    const result = await requestPasswordReset(resetEmail);
    if (result.success && result.code) {
        setGeneratedCode(result.code);
        setResetStep(2);
    } else {
        setResetError(result.message);
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    if (newPassword !== confirmNewPassword) {
        setResetError("New passwords do not match.");
        return;
    }
    const result = await resetPassword(resetEmail, resetCode, newPassword);
    if (result.success) {
        setResetMessage(result.message);
        setResetStep(3);
    } else {
        setResetError(result.message);
    }
  }


  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            <span className="text-white">HAWLA</span><span className="text-brand-accent">DER</span>
          </h1>
          <p className="text-dark-text-secondary mt-2">Manufacturing Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            placeholder="hanif@hawlader.eu"
            autoComplete="email"
          />
          {isSignUp && (
            <>
              <Input label="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Username" type="text" value={actualUsername} onChange={(e) => setActualUsername(e.target.value)} required />
            </>
          )}
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••••••"
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          {isSignUp && (
             <Input 
                label="Confirm Password" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="••••••••••••"
                autoComplete="new-password"
            />
          )}
          
          <div className="text-right text-xs">
            <button type="button" onClick={handleOpenForgotPassword} className="font-medium text-brand-accent hover:text-brand-accent-hover focus:outline-none">
              Forgot Password?
            </button>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {successMessage && <p className="text-sm text-green-400 text-center">{successMessage}</p>}


          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" size="lg">
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
            {!isSignUp && isBiometricSupported && (
              <Button type="button" variant="secondary" className="w-full" size="lg" onClick={handleBiometricLogin}>
                Login with Fingerprint/Face ID
              </Button>
            )}
          </div>
          
          <p className="text-center text-sm text-dark-text-secondary">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button 
              type="button" 
              onClick={() => {
                  setIsSignUp(!isSignUp);
                  resetMainForm();
              }} 
              className="font-semibold text-brand-accent hover:text-brand-accent-hover ml-1 focus:outline-none"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </form>
      </Card>
    </div>

    <Modal isOpen={isForgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} title="Reset Password">
        {resetStep === 1 && (
            <form onSubmit={handleRequestResetCode} className="space-y-4">
                <p className="text-dark-text-secondary">Enter your account's email address and we will send you a password reset code.</p>
                <Input label="Email" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required autoFocus />
                 {resetError && <p className="text-sm text-red-500">{resetError}</p>}
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
                    <Button type="submit">Send Reset Code</Button>
                </div>
            </form>
        )}
        {resetStep === 2 && (
             <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-green-400 bg-green-900/50 p-3 rounded-md">
                    For demonstration purposes, your reset code is: <strong className="font-bold text-lg tracking-widest">{generatedCode}</strong>
                    <br/>In a real application, this would be sent to your email.
                </p>
                <Input label="Reset Code" type="text" value={resetCode} onChange={e => setResetCode(e.target.value)} required autoFocus />
                <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <Input label="Confirm New Password" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                {resetError && <p className="text-sm text-red-500">{resetError}</p>}
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
                    <Button type="submit">Reset Password</Button>
                </div>
            </form>
        )}
        {resetStep === 3 && (
            <div className="space-y-4">
                <p className="text-green-400">{resetMessage}</p>
                <div className="flex justify-end">
                    <Button onClick={() => setForgotPasswordOpen(false)}>Back to Login</Button>
                </div>
            </div>
        )}
    </Modal>
    </>
  );
};