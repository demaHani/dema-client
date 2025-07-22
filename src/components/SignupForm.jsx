import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  console.log('=== SIGNUP FORM RENDER ===');
  console.log('Form data:', { ...formData, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field change: ${name} = ${name.includes('password') ? '[HIDDEN]' : value}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validatePassword = (password) => {
    console.log('Validating password...');
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const validation = {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    };
    
    console.log('Password validation result:', validation);
    return validation;
  };

  const validateForm = () => {
    console.log('=== FORM VALIDATION START ===');
    
    // Check for empty fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      console.log('Validation failed: Empty fields detected');
      setError('Please fill in all fields');
      return false;
    }

    // Name validation
    if (formData.name.length < 2) {
      console.log('Validation failed: Name too short');
      setError('Name must be at least 2 characters long');
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      console.log('Validation failed: Invalid name format');
      setError('Name can only contain letters and spaces');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log('Validation failed: Invalid email format');
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      console.log('Validation failed: Password requirements not met');
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      setError('Passwords do not match');
      return false;
    }

    console.log('=== FORM VALIDATION SUCCESS ===');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== SIGNUP SUBMIT START ===');
    console.log('Form submission initiated');
    
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!validateForm()) {
        console.log('Form validation failed, stopping submission');
        setIsLoading(false);
        return;
      }

      // Prepare request data
      const requestData = {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
      
      console.log('Request data prepared:', { ...requestData, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' });

      // Make API request
      console.log('Making API request to http://localhost:5000/api/auth/signup...');
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        console.log('=== SIGNUP SUCCESS ===');
        console.log('User registered successfully, redirecting to login...');
        
        // Do NOT set authToken or user here - redirect to login instead
        navigate('/login', { state: { signupSuccess: true } });
      } else {
        console.log('=== SIGNUP FAILED ===');
        console.log('Server returned error:', data);
        
        // Handle specific error types
        if (data.error === 'User already exists with this email address') {
          setError('An account with this email already exists. Please log in instead.');
        } else if (data.error === 'Validation failed') {
          const validationErrors = data.details?.map(err => err.msg).join(', ');
          setError(`Validation error: ${validationErrors}`);
        } else {
          setError(data.message || data.error || 'Signup failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('=== SIGNUP ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    console.log('Toggling password visibility');
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    console.log('Toggling confirm password visibility');
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrength = () => {
    const validation = validatePassword(formData.password);
    const strength = [validation.minLength, validation.hasUpperCase, validation.hasLowerCase, validation.hasNumbers, validation.hasSpecialChar].filter(Boolean).length;
    
    if (strength <= 2) return { level: 'weak', color: '#e74c3c' };
    if (strength <= 3) return { level: 'medium', color: '#f39c12' };
    if (strength <= 4) return { level: 'strong', color: '#27ae60' };
    return { level: 'very strong', color: '#2ecc71' };
  };

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <div className="flex-column">
          <label>Full Name</label>
        </div>
        <div className="inputForm">
          <svg height={20} viewBox="0 0 24 24" width={20} xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <input 
            type="text" 
            className="input" 
            placeholder="Enter your full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="flex-column">
          <label>Email</label>
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
            placeholder="Enter your Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="flex-column">
          <label>Password</label>
        </div>
        <div className="inputForm">
          <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg">
            <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
            <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
          </svg>
          <input 
            type={showPassword ? "text" : "password"} 
            className="input" 
            placeholder="Create a password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <PasswordToggle onClick={togglePasswordVisibility} disabled={isLoading}>
            <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
            </svg>
          </PasswordToggle>
        </div>
        {formData.password && (
          <PasswordStrength>
            <PasswordStrengthBar>
              <PasswordStrengthFill 
                strength={getPasswordStrength().level}
                color={getPasswordStrength().color}
              />
            </PasswordStrengthBar>
            <PasswordStrengthText color={getPasswordStrength().color}>
              {getPasswordStrength().level}
            </PasswordStrengthText>
          </PasswordStrength>
        )}
        
        <div className="flex-column">
          <label>Confirm Password</label>
        </div>
        <div className="inputForm">
          <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg">
            <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
            <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
          </svg>
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            className="input" 
            placeholder="Confirm your password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <PasswordToggle onClick={toggleConfirmPasswordVisibility} disabled={isLoading}>
            <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
            </svg>
          </PasswordToggle>
        </div>
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <PasswordMismatch>
            <i className="fas fa-exclamation-triangle"></i>
            Passwords do not match
          </PasswordMismatch>
        )}
        
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
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
        
        <p className="p">
          Already have an account? <Link to="/login" className="span">Sign In</Link>
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
    position: relative;
    display: flex;
    align-items: center;
    background-color: #f6f6f6;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    padding: 0 15px;
    transition: border-color 0.3s ease;
  }

  .inputForm:focus-within {
    border-color: #667eea;
  }

  .inputForm svg {
    margin-right: 10px;
    color: #666;
  }

  .input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    padding: 15px 0;
    color: #151717;
  }

  .input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .button-submit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 15px 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    margin-top: 10px;
  }

  .button-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  .button-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .p {
    text-align: center;
    color: #666;
    font-size: 14px;
    margin-top: 20px;
  }

  .span {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }

  .span:hover {
    text-decoration: underline;
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

const PasswordToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    color: #667eea;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PasswordStrength = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
`;

const PasswordStrengthBar = styled.div`
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
`;

const PasswordStrengthFill = styled.div`
  height: 100%;
  background: ${props => props.color};
  width: ${props => {
    switch(props.strength) {
      case 'weak': return '25%';
      case 'medium': return '50%';
      case 'strong': return '75%';
      case 'very strong': return '100%';
      default: return '0%';
    }
  }};
  transition: width 0.3s ease;
`;

const PasswordStrengthText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
`;

const PasswordMismatch = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #ffeaa7;
`;

export default SignupForm; 