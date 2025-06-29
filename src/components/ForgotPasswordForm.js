import React, { useState } from 'react';
import styled from 'styled-components';

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }
      setIsSuccess(true);
    } catch (error) {
      setError(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <StyledWrapper>
        <div className="form">
          <div className="success-message">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#28a745" strokeWidth="2"/>
            </svg>
            <h2>Check Your Email</h2>
            <p>We've sent a password reset link to:</p>
            <p className="email-display">{email}</p>
            <p>Click the link in the email to reset your password. The link will expire in 1 hour.</p>
            <button className="button-submit" onClick={() => { setIsSuccess(false); setEmail(''); }}>Send Another Link</button>
            <p className="p">Remember your password? <span className="span" onClick={onBackToLogin}>Sign In</span></p>
          </div>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <div className="header">
          <h2>Forgot Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="flex-column">
          <label>Email</label>
        </div>
        <div className={`inputForm${error ? ' error' : ''}`}>
          <svg height={20} viewBox="0 0 32 32" width={20} xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" /></g></svg>
          <input type="email" className="input" placeholder="Enter your email" value={email} onChange={handleEmailChange} disabled={isLoading} />
        </div>
        <button className={`button-submit${isLoading ? ' loading' : ''}`} type="submit" disabled={isLoading}>
          {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </button>
        <p className="p">Remember your password? <span className="span" onClick={onBackToLogin}>Sign In</span></p>
      </form>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #ffffff;
    padding: 30px;
    width: 450px;
    border-radius: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  .header h2 {
    color: #151717;
    margin: 0 0 10px 0;
    font-size: 24px;
    font-weight: 600;
  }
  .header p {
    color: #666;
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }
  .success-message {
    text-align: center;
    padding: 20px 0;
  }
  .success-message h2 {
    color: #28a745;
    margin: 15px 0 10px 0;
    font-size: 24px;
    font-weight: 600;
  }
  .success-message p {
    color: #666;
    margin: 10px 0;
    font-size: 14px;
    line-height: 1.5;
  }
  .email-display {
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 8px;
    font-weight: 600;
    color: #151717;
    margin: 15px 0;
  }
  .error-message {
    background-color: #fee;
    color: #c33;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #fcc;
    font-size: 14px;
    text-align: center;
    margin-bottom: 10px;
  }
  ::placeholder {
    font-family: inherit;
  }
  .form button {
    align-self: flex-end;
  }
  .flex-column > label {
    color: #151717;
    font-weight: 600;
  }
  .inputForm {
    border: 1.5px solid #ecedec;
    border-radius: 10px;
    height: 50px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    transition: 0.2s ease-in-out;
  }
  .inputForm.error {
    border-color: #c33;
  }
  .input {
    margin-left: 10px;
    border-radius: 10px;
    border: none;
    width: 85%;
    height: 100%;
    outline: none;
  }
  .input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  .inputForm:focus-within {
    border: 1.5px solid #2d79f3;
  }
  .span {
    font-size: 14px;
    margin-left: 5px;
    color: #2d79f3;
    font-weight: 500;
    cursor: pointer;
  }
  .button-submit {
    margin: 20px 0 10px 0;
    background-color: #151717;
    border: none;
    color: white;
    font-size: 15px;
    font-weight: 500;
    border-radius: 10px;
    height: 50px;
    width: 100%;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }
  .button-submit:hover:not(:disabled) {
    background-color: #252727;
  }
  .button-submit:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  .button-submit.loading {
    background-color: #666;
  }
  .p {
    text-align: center;
    color: black;
    font-size: 14px;
    margin: 5px 0;
  }
`;

export default ForgotPasswordForm; 