import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetAttempts, setResetAttempts] = useState(0);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Rate limiting check
    if (resetAttempts >= 3) {
      setError('Too many reset attempts. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setResetAttempts(0);
      } else {
        const newAttempts = resetAttempts + 1;
        setResetAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setError('Too many reset attempts. Please try again later.');
        } else {
          setError(data.message || data.error || 'Failed to send reset email');
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <StyledWrapper>
        <div className="form">
          <SuccessMessage>
            <SuccessIcon>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </SuccessIcon>
            <SuccessTitle>Check Your Email</SuccessTitle>
            <SuccessText>
              We've sent a password reset link to <strong>{email}</strong>
            </SuccessText>
            <SuccessInstructions>
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </SuccessInstructions>
            <BackToLogin to="/login" className="span">
              ← Back to Login
            </BackToLogin>
          </SuccessMessage>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <div className="form-header">
          <BackButton to="/login">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </BackButton>
          <h2>Forgot Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        
        <div className="flex-column">
          <label>Email Address</label>
        </div>
        <div className="inputForm">
          <svg height={20} viewBox="0 0 32 32" width={20} xmlns="http://www.w3.org/2000/svg">
            <g id="Layer_3" data-name="Layer 3">
              <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
            </g>
          </svg>
          <input 
            type="email" 
            className="input" 
            placeholder="Enter your email address"
            value={email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        
        <button 
          className="button-submit" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="spinner" viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              Sending Reset Link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
        
        <p className="p">
          Remember your password? <Link to="/login" className="span">Sign In</Link>
        </p>
        
        <p className="p">
          Don't have an account? <Link to="/signup" className="span">Sign Up</Link>
        </p>
      </form>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #ffffff;
    padding: 30px;
    width: 450px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .form-header {
    text-align: center;
    margin-bottom: 20px;
    position: relative;
  }

  .form-header h2 {
    color: #151717;
    font-size: 24px;
    font-weight: 700;
    margin: 10px 0 5px 0;
  }

  .form-header p {
    color: #666;
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
  }

  ::placeholder {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
    position: relative;
  }

  .input {
    margin-left: 10px;
    border-radius: 10px;
    border: none;
    width: 85%;
    height: 100%;
    font-size: 14px;
  }

  .input:focus {
    outline: none;
  }

  .inputForm:focus-within {
    border: 1.5px solid #2d79f3;
  }

  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }

  .flex-row > div > label {
    font-size: 14px;
    color: black;
    font-weight: 400;
  }

  .span {
    font-size: 14px;
    margin-left: 5px;
    color: #2d79f3;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
  }

  .span:hover {
    text-decoration: underline;
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
    transition: 0.2s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .button-submit:hover:not(:disabled) {
    background-color: #252727;
  }

  .button-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .p {
    text-align: center;
    color: black;
    font-size: 14px;
    margin: 5px 0;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #fcc;
  margin-bottom: 10px;
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 0;
  left: 0;
  color: #666;
  text-decoration: none;
  padding: 5px;
  border-radius: 4px;
  transition: 0.2s ease-in-out;
  
  &:hover {
    color: #333;
    background: #f5f5f5;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const SuccessIcon = styled.div`
  color: #27ae60;
  margin-bottom: 20px;
`;

const SuccessTitle = styled.h2`
  color: #151717;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 10px 0;
`;

const SuccessText = styled.p`
  color: #666;
  font-size: 16px;
  margin: 0 0 15px 0;
  line-height: 1.5;
`;

const SuccessInstructions = styled.p`
  color: #888;
  font-size: 14px;
  margin: 0 0 30px 0;
  line-height: 1.5;
`;

const BackToLogin = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #2d79f3;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: 0.2s ease-in-out;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default ForgotPasswordForm; 