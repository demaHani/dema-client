import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import styled from 'styled-components';

const Navigation = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const isLoggedIn = !!user;
  const isAdmin = user?.isAdmin || false;

  const handleLogout = () => {
    logout();
    localStorage.removeItem('userFavorites');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <NavContainer>
      <NavContent>
        <LogoSection>
          <Logo to="/" onClick={closeMobileMenu}>
            <LogoIcon>🏨</LogoIcon>
            <LogoText>Jordan Travel</LogoText>
          </Logo>
        </LogoSection>

        <DesktopNav>
          <NavLinks>
            <NavLink 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              Home
            </NavLink>
            <NavLink 
              to="/camping" 
              className={isActive('/camping') ? 'active' : ''}
            >
              Camping
            </NavLink>
            <NavLink 
              to="/car-rent" 
              className={isActive('/car-rent') ? 'active' : ''}
            >
              Car Rent
            </NavLink>
            {isAdmin && (
              <AdminNavLink 
                to="/admin" 
                className={location.pathname.startsWith('/admin') ? 'active' : ''}
              >
                👑 Admin Dashboard
              </AdminNavLink>
            )}
          </NavLinks>
        </DesktopNav>

        <AuthSection>
          {isLoggedIn ? (
            <UserMenu>
              <UserButton onClick={() => navigate(isAdmin ? '/admin' : '/profile')}>
                <UserAvatar isAdmin={isAdmin}>
                  {isAdmin ? '👑' : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
                </UserAvatar>
                <UserName>{isAdmin ? 'Admin' : (user?.fullName || 'User')}</UserName>
                <DropdownIcon className="fas fa-chevron-down" />
              </UserButton>
              <DropdownMenu>
                {!isAdmin && (
                  <DropdownItem onClick={() => navigate('/profile')}>
                    <i className="fas fa-user"></i>
                    Profile
                  </DropdownItem>
                )}
                {isAdmin && (
                  <DropdownItem onClick={() => navigate('/admin')}>
                    <i className="fas fa-crown"></i>
                    Admin Dashboard
                  </DropdownItem>
                )}
                <LogoutDropdownItem onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </LogoutDropdownItem>
              </DropdownMenu>
            </UserMenu>
          ) : (
            <AuthButtons>
              <LoginButton to="/login">
                <i className="fas fa-sign-in-alt"></i>
                Login
              </LoginButton>
              <SignupButton to="/signup">
                <i className="fas fa-user-plus"></i>
                Sign Up
              </SignupButton>
            </AuthButtons>
          )}
        </AuthSection>

        <MobileMenuButton onClick={toggleMobileMenu}>
          <i className={`fas fa-${showMobileMenu ? 'times' : 'bars'}`}></i>
        </MobileMenuButton>
      </NavContent>

      <MobileMenu className={showMobileMenu ? 'open' : ''}>
        <MobileNavLinks>
          <MobileNavLink 
            to="/" 
            onClick={closeMobileMenu}
            className={isActive('/') ? 'active' : ''}
          >
            <i className="fas fa-home"></i>
            Home
          </MobileNavLink>
          <MobileNavLink 
            to="/camping" 
            onClick={closeMobileMenu}
            className={isActive('/camping') ? 'active' : ''}
          >
            <i className="fas fa-campground"></i>
            Camping
          </MobileNavLink>
          <MobileNavLink 
            to="/car-rent" 
            onClick={closeMobileMenu}
            className={isActive('/car-rent') ? 'active' : ''}
          >
            <i className="fas fa-car"></i>
            Car Rent
          </MobileNavLink>
          {isAdmin && (
            <MobileNavLink 
              to="/admin" 
              onClick={closeMobileMenu}
              className={location.pathname.startsWith('/admin') ? 'active' : ''}
            >
              <i className="fas fa-crown"></i>
              Admin Dashboard
            </MobileNavLink>
          )}
        </MobileNavLinks>
        
        <MobileAuthSection>
          {isLoggedIn ? (
            <MobileUserInfo>
              <MobileUserAvatar isAdmin={isAdmin}>
                {isAdmin ? '👑' : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
              </MobileUserAvatar>
              <MobileUserName>{isAdmin ? 'Admin' : (user?.fullName || 'User')}</MobileUserName>
            </MobileUserInfo>
          ) : (
            <MobileAuthButtons>
              <MobileLoginButton to="/login" onClick={closeMobileMenu}>
                <i className="fas fa-sign-in-alt"></i>
                Login
              </MobileLoginButton>
              <MobileSignupButton to="/signup" onClick={closeMobileMenu}>
                <i className="fas fa-user-plus"></i>
                Sign Up
              </MobileSignupButton>
            </MobileAuthButtons>
          )}
          
          {isLoggedIn && (
            <MobileLogoutButton onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </MobileLogoutButton>
          )}
        </MobileAuthSection>
      </MobileMenu>
    </NavContainer>
  );
};

const NavContainer = styled.nav`
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  
  @media (max-width: 768px) {
    padding: 0 var(--spacing-md);
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.25rem;
  transition: var(--transition-fast);
  
  &:hover {
    color: var(--primary-color);
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.span`
  font-size: 1.5rem;
`;

const LogoText = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
`;

const NavLink = styled(Link)`
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  position: relative;
  
  &:hover {
    color: var(--primary-color);
    background: var(--primary-lighter);
  }
  
  &.active {
    color: var(--primary-color);
    background: var(--primary-lighter);
  }
  
  &.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: var(--primary-color);
    border-radius: 1px;
  }
`;

const AdminNavLink = styled(NavLink)`
  background: var(--warning);
  color: var(--white);
  font-weight: 600;
  
  &:hover {
    background: var(--warning);
    color: var(--white);
    filter: brightness(1.1);
  }
  
  &.active {
    background: var(--warning);
    color: var(--white);
    filter: brightness(1.1);
  }
  
  &.active::after {
    background: var(--white);
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const LoginButton = styled(Link)`
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  &:hover {
    color: var(--primary-color);
    background: var(--primary-lighter);
  }
  
  i {
    font-size: 0.875rem;
  }
`;

const SignupButton = styled(Link)`
  background: var(--primary-color);
  color: var(--white);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  i {
    font-size: 0.875rem;
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  &:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--gray-100);
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.isAdmin ? 'var(--warning)' : 'var(--primary-color)'};
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserName = styled.span`
  color: var(--text-primary);
  font-weight: 500;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const DropdownIcon = styled.i`
  color: var(--text-tertiary);
  font-size: 0.75rem;
  transition: var(--transition-fast);
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: var(--transition-normal);
  z-index: 1000;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid var(--white);
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: var(--spacing-md);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-primary);
  font-weight: 500;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  &:hover {
    background: var(--gray-50);
    color: var(--primary-color);
  }
  
  &:first-child {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  
  i {
    width: 16px;
    color: var(--text-tertiary);
  }
`;

const LogoutDropdownItem = styled(DropdownItem)`
  color: var(--error);
  border-top: 1px solid var(--border-light);
  
  &:hover {
    background: #fef2f2;
    color: var(--error);
  }
  
  &:last-child {
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }
  
  i {
    color: var(--error);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 1.25rem;
  padding: var(--spacing-sm);
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: var(--white);
  border-top: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: var(--transition-normal);
  z-index: 999;
  max-height: calc(100vh - 70px);
  overflow-y: auto;
  
  &.open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
`;

const MobileNavLinks = styled.div`
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  margin-bottom: var(--spacing-sm);
  
  &:hover {
    background: var(--gray-50);
    color: var(--primary-color);
  }
  
  &.active {
    background: var(--primary-lighter);
    color: var(--primary-color);
  }
  
  i {
    width: 20px;
    color: var(--text-tertiary);
  }
`;

const MobileAuthSection = styled.div`
  padding: var(--spacing-lg);
`;

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
`;

const MobileUserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isAdmin ? 'var(--warning)' : 'var(--primary-color)'};
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
`;

const MobileUserName = styled.span`
  color: var(--text-primary);
  font-weight: 600;
`;

const MobileAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const MobileLoginButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  
  &:hover {
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
`;

const MobileSignupButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background: var(--primary-color);
  color: var(--white);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--primary-dark);
  }
`;

const MobileLogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background: #fef2f2;
  color: var(--error);
  border: 1px solid var(--error);
  font-weight: 500;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  cursor: pointer;
  
  &:hover {
    background: var(--error);
    color: var(--white);
  }
`;

export default Navigation; 