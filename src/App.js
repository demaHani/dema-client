import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background: linear-gradient(135deg, #f5d6e6 0%, #c9e4f6 50%, #f6f1d6 100%);
    min-height: 100vh;
    margin: 0;
    padding: 0;
    transition: background 0.5s;
  }
`;

function App() {
  const [page, setPage] = useState('login');

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        {page === 'login' && (
          <LoginForm
            onSwitchToSignup={() => setPage('signup')}
            onSwitchToForgotPassword={() => setPage('forgot')}
          />
        )}
        {page === 'signup' && (
          <SignupForm onSwitchToLogin={() => setPage('login')} />
        )}
        {page === 'forgot' && (
          <ForgotPasswordForm onBackToLogin={() => setPage('login')} />
        )}
      </AppContainer>
    </>
  );
}

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #f5d6e6 0%, #c9e4f6 50%, #f6f1d6 100%);
  transition: background 0.5s;
`;

export default App; 