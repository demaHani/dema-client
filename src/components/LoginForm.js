import React, { useState } from 'react';
import styled from 'styled-components';

const LoginForm = ({ onSwitchToSignup, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => password.length >= 8;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
      setErrors({ general: `Account temporarily locked. Please try again in ${remainingTime} minutes.` });
      return;
    }
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setLoginAttempts(0);
      setLockoutUntil(null);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      // Redirect or show success (implement as needed)
      alert('Login successful!');
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION);
        setErrors({ general: `Too many failed attempts. Account locked for 15 minutes.` });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        {errors.general && <div className="error-message">{errors.general}</div>}
        <div className="flex-column">
          <label>Email</label>
        </div>
        <div className={`inputForm${errors.email ? ' error' : ''}`}>
          <svg height={20} viewBox="0 0 32 32" width={20} xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" /></g></svg>
          <input type="email" className="input" placeholder="Enter your Email" name="email" value={formData.email} onChange={handleInputChange} disabled={isLoading || (lockoutUntil && Date.now() < lockoutUntil)} />
        </div>
        {errors.email && <div className="field-error">{errors.email}</div>}
        <div className="flex-column">
          <label>Password</label>
        </div>
        <div className={`inputForm${errors.password ? ' error' : ''}`}>
          <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" /></svg>
          <input type={showPassword ? 'text' : 'password'} className="input" placeholder="Enter your Password" name="password" value={formData.password} onChange={handleInputChange} disabled={isLoading || (lockoutUntil && Date.now() < lockoutUntil)} />
          <button type="button" className="password-toggle" onClick={togglePasswordVisibility} disabled={isLoading || (lockoutUntil && Date.now() < lockoutUntil)}>
            {showPassword ? (
              <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" /></svg>
            ) : (
              <svg viewBox="0 0 640 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 66.4-149.9C592 164.3 497.2 64 384 64c-50.1 0-97.4 13.7-137.9 37.4L38.8 5.1zM384 112c44.2 0 80 35.8 80 80c0 25.3-12.1 47.9-30.7 62.1L384 194.1V112zM288 236.8c0 53-43 96-96 96s-96-43-96-96s43-96 96-96s96 43 96 96zM192 144c-51.2 0-96 44.8-96 96s44.8 96 96 96s96-44.8 96-96s-44.8-96-96-96z" /></svg>
            )}
          </button>
        </div>
        {errors.password && <div className="field-error">{errors.password}</div>}
        <div className="flex-row">
          <div>
            <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} disabled={isLoading || (lockoutUntil && Date.now() < lockoutUntil)} />
            <label>Remember me</label>
          </div>
          <span className="span" onClick={onSwitchToForgotPassword}>Forgot password?</span>
        </div>
        <button className={`button-submit${isLoading ? ' loading' : ''}`} type="submit" disabled={isLoading || (lockoutUntil && Date.now() < lockoutUntil)}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
        <p className="p">Don't have an account? <span className="span" onClick={onSwitchToSignup}>Sign Up</span></p>
        <p className="p line">Or With</p>
        <div className="flex-row">
          <button type="button" className="btn google">
            <svg version="1.1" width={20} id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{enableBackground: 'new 0 0 512 512'}} xmlSpace="preserve">
              <path style={{fill: '#FBBB00'}} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256
      	c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456
      	C103.821,274.792,107.225,292.797,113.47,309.408z" />
              <path style={{fill: '#518EF8'}} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451
      	c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535
      	c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" />
              <path style={{fill: '#28B446'}} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512
      	c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771
      	c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" />
              <path style={{fill: '#F14336'}} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012
      	c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0
      	C318.115,0,375.068,22.126,419.404,58.936z" />
            </svg>
            Google
          </button>
          <button type="button" className="btn apple">
            <svg version="1.1" height={20} width={20} id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22.773 22.773" style={{enableBackground: 'new 0 0 22.773 22.773'}} xmlSpace="preserve"> <g> <g> <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z" /> <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334 c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0 c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019 c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464 c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648 c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z" /> </g></g></svg>
            Apple
          </button>
        </div>
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
  .field-error {
    color: #c33;
    font-size: 12px;
    margin-top: -5px;
    margin-bottom: 5px;
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
    position: relative;
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
  .password-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    margin-right: 10px;
    color: #666;
    transition: color 0.2s ease-in-out;
  }
  .password-toggle:hover {
    color: #2d79f3;
  }
  .password-toggle:disabled {
    color: #ccc;
    cursor: not-allowed;
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
  .btn {
    margin-top: 10px;
    width: 100%;
    height: 50px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    gap: 10px;
    border: 1px solid #ededef;
    background-color: white;
    cursor: pointer;
    transition: 0.2s ease-in-out;
  }
  .btn:hover {
    border: 1px solid #2d79f3;
  }
`;

export default LoginForm; 