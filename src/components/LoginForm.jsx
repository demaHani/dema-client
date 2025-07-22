import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import styled from 'styled-components';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, adminLogin } = useAuth();
  const signupSuccess = location.state?.signupSuccess;

  console.log('=== LOGIN FORM RENDER ===');
  console.log('Form data:', { ...formData, password: '[HIDDEN]' });
  console.log('Signup success flag:', signupSuccess);

  // Check for existing lockout on component mount
  useEffect(() => {
    console.log('=== CHECKING LOCKOUT STATUS ===');
    const savedAttempts = localStorage.getItem('loginAttempts');
    const savedLockoutTime = localStorage.getItem('lockoutTime');
    
    console.log('Saved attempts:', savedAttempts);
    console.log('Saved lockout time:', savedLockoutTime);
    
    if (savedAttempts && savedLockoutTime) {
      const attempts = parseInt(savedAttempts);
      const lockoutTime = parseInt(savedLockoutTime);
      const now = Date.now();
      
      console.log('Current time:', now);
      console.log('Lockout time:', lockoutTime);
      console.log('Time difference:', now - lockoutTime);
      
      if (attempts >= 3 && (now - lockoutTime) < 15 * 60 * 1000) {
        console.log('Account is locked');
        setIsLocked(true);
        setLoginAttempts(attempts);
        setLockoutTime(lockoutTime);
      } else if ((now - lockoutTime) >= 15 * 60 * 1000) {
        console.log('Lockout period expired, resetting');
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field change: ${name} = ${name.includes('password') ? '[HIDDEN]' : value}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    console.log('=== FORM VALIDATION START ===');
    
    // Check for empty fields
    if (!formData.email || !formData.password) {
      console.log('Validation failed: Empty fields detected');
      setError('Please fill in all fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log('Validation failed: Invalid email format');
      setError('Please enter a valid email address');
      return false;
    }

    console.log('=== FORM VALIDATION SUCCESS ===');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== LOGIN SUBMIT START ===');
    console.log('Form submission initiated');
    
    if (isLocked) {
      console.log('Account is locked, preventing submission');
      setError('Account is temporarily locked. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!validateForm()) {
        console.log('Form validation failed, stopping submission');
        setIsLoading(false);
        return;
      }

      // Check if this might be an admin login
      const isAdminLogin = formData.email.toLowerCase().includes('admin') || 
                          formData.email.toLowerCase().includes('administrator');

      console.log('Detected admin login attempt:', isAdminLogin);

      let result;
      if (isAdminLogin) {
        console.log('Attempting admin login...');
        result = await adminLogin(formData.email, formData.password);
      } else {
        console.log('Attempting regular user login...');
        result = await login(formData.email, formData.password);
      }

      console.log('Login result:', result);

      if (result.success) {
        console.log('=== LOGIN SUCCESS ===');
        console.log('Login successful, user data:', result.user);
        
        // Reset login attempts on successful login
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');
        setLoginAttempts(0);
        setIsLocked(false);
        
        console.log('User data stored, redirecting...');
        
        // Redirect based on user type
        if (result.user.isAdmin) {
          console.log('Admin user detected, redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('Regular user detected, redirecting to home');
          navigate('/');
        }
      } else {
        console.log('=== LOGIN FAILED ===');
        console.log('Login failed:', result.error);
        
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());
        
        if (newAttempts >= 3) {
          const lockoutTime = Date.now();
          setLockoutTime(lockoutTime);
          setIsLocked(true);
          localStorage.setItem('lockoutTime', lockoutTime.toString());
          console.log('Account locked due to too many attempts');
          setError('Too many failed attempts. Account locked for 15 minutes.');
        } else {
          // Handle specific error types
          if (result.error === 'Invalid credentials') {
            setError(`Invalid email or password. ${3 - newAttempts} attempts remaining.`);
          } else if (result.error === 'Account is deactivated') {
            setError('Your account has been deactivated. Please contact support.');
          } else if (result.error === 'Account is temporarily locked') {
            setError('Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.');
          } else {
            setError(result.error || `Login failed. ${3 - newAttempts} attempts remaining.`);
          }
        }
      }
    } catch (error) {
      console.error('=== LOGIN ERROR ===');
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

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return 0;
    
    const now = Date.now();
    const elapsed = now - lockoutTime;
    const remaining = (15 * 60 * 1000) - elapsed;
    
    return Math.max(0, Math.ceil(remaining / 1000));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <LoginIcon>🔐</LoginIcon>
          <LoginTitle>Welcome Back</LoginTitle>
          <LoginSubtitle>Sign in to your account to continue</LoginSubtitle>
        </LoginHeader>

        {signupSuccess && (
          <SuccessMessage>
            <i className="fas fa-check-circle"></i>
            Account created successfully! Please sign in.
          </SuccessMessage>
        )}

        {error && (
          <ErrorMessage>
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </ErrorMessage>
        )}

        {isLocked && (
          <LockoutMessage>
            <i className="fas fa-lock"></i>
            Account temporarily locked. Please try again in {formatTime(getRemainingLockoutTime())}.
          </LockoutMessage>
        )}

        <LoginFormElement onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <InputWrapper>
              <FormInput
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLocked}
                required
              />
              <InputIcon className="fas fa-envelope"></InputIcon>
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="password">Password</FormLabel>
            <InputWrapper>
              <FormInput
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLocked}
                required
              />
              <InputIcon className="fas fa-lock"></InputIcon>
              <PasswordToggle
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLocked}
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>

          <FormActions>
            <RememberMe>
              <Checkbox type="checkbox" id="remember" />
              <CheckboxLabel htmlFor="remember">Remember me</CheckboxLabel>
            </RememberMe>
            <ForgotPasswordLink to="/forgot-password">
              Forgot password?
            </ForgotPasswordLink>
          </FormActions>

          <SubmitButton
            type="submit"
            disabled={isLoading || isLocked}
          >
            {isLoading ? (
              <>
                <LoadingSpinner></LoadingSpinner>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </>
            )}
          </SubmitButton>
        </LoginFormElement>

        <Divider>
          <DividerText>or</DividerText>
        </Divider>

        <SignupPrompt>
          <SignupText>Don't have an account?</SignupText>
          <SignupLink to="/signup">
            <i className="fas fa-user-plus"></i>
            Create Account
          </SignupLink>
        </SignupPrompt>


      </LoginCard>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: var(--bg-gradient);
`;

const LoginCard = styled.div`
  background: var(--white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 450px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--bg-gradient-alt);
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-2xl);
`;

const LoginIcon = styled.div`
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
`;

const LoginTitle = styled.h1`
  color: var(--text-primary);
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
`;

const LoginSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
`;

const SuccessMessage = styled.div`
  background: var(--secondary-lighter);
  color: var(--secondary-dark);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border-left: 4px solid var(--success);
  
  i {
    color: var(--success);
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border-left: 4px solid var(--error);
  
  i {
    color: var(--error);
  }
`;

const LockoutMessage = styled.div`
  background: #fef3c7;
  color: #d97706;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border-left: 4px solid var(--warning);
  
  i {
    color: var(--warning);
  }
`;

const LoginFormElement = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const FormLabel = styled.label`
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FormInput = styled.input`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) 3rem;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  transition: var(--transition-normal);
  background: var(--white);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(79, 70, 229, 0.25);
  }
  
  &:disabled {
    background: var(--gray-50);
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const InputIcon = styled.i`
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-tertiary);
  font-size: 1rem;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  
  &:hover:not(:disabled) {
    color: var(--primary-color);
    background: var(--primary-lighter);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
`;

const RememberMe = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary-color);
`;

const CheckboxLabel = styled.label`
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
`;

const ForgotPasswordLink = styled(Link)`
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: var(--transition-fast);
  
  &:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  background: var(--primary-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  
  &:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:disabled {
    background: var(--gray-400);
    cursor: not-allowed;
    transform: none;
  }
  
  i {
    font-size: 0.875rem;
  }
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: var(--spacing-xl) 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-light);
  }
`;

const DividerText = styled.span`
  color: var(--text-tertiary);
  font-size: 0.875rem;
  padding: 0 var(--spacing-md);
`;

const SignupPrompt = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const SignupText = styled.p`
  color: var(--text-secondary);
  margin: 0;
`;

const SignupLink = styled(Link)`
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  &:hover {
    background: var(--primary-color);
    color: var(--white);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  i {
    font-size: 0.875rem;
  }
`;

const AdminNote = styled.div`
  margin-top: var(--spacing-xl);
  padding: var(--spacing-md);
  background: var(--primary-lighter);
  border-radius: var(--radius-md);
  color: var(--primary-dark);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  i {
    color: var(--primary-color);
  }
`;

export default LoginForm; 