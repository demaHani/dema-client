import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const AppNavigation = () => {
  const location = useLocation();

  return (
    <NavContainer>
      <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>
        Authentication
      </NavLink>
      <NavLink to="/booking" className={location.pathname === '/booking' ? 'active' : ''}>
        Travel Booking App
      </NavLink>
    </NavContainer>
  );
};

const NavContainer = styled.nav`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 10px;
  display: flex;
  gap: 10px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const NavLink = styled(Link)`
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  color: #667eea;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
  
  &.active {
    background: #667eea;
    color: white;
  }
`;

export default AppNavigation; 