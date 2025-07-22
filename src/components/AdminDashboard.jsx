import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import styled from 'styled-components';

import AdminOverview from './admin/AdminOverview.jsx';
import AdminHotelManagement from './admin/AdminHotelManagement.jsx';
import AdminHotelCreator from './admin/AdminHotelCreator.jsx';
import AdminBookingManagement from './admin/AdminBookingManagement.jsx';
import AdminUserManagement from './admin/AdminUserManagement.jsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.isAdmin) {
      setLoading(false);
    } else if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading Admin Dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <AccessDeniedContainer>
        <AccessDeniedCard>
          <AccessDeniedIcon>🚫</AccessDeniedIcon>
          <AccessDeniedTitle>Access Denied</AccessDeniedTitle>
          <AccessDeniedText>You must be an admin to access this page.</AccessDeniedText>
          <AccessDeniedButton onClick={() => navigate('/')}>Go to Home</AccessDeniedButton>
        </AccessDeniedCard>
      </AccessDeniedContainer>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'hotels':
        return <AdminHotelManagement />;
      case 'create-hotel':
        return <AdminHotelCreator />;
      case 'bookings':
        return <AdminBookingManagement />;
      case 'users':
        return <AdminUserManagement />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <Logo>
              <LogoIcon>🏨</LogoIcon>
              <LogoText>Admin Dashboard</LogoText>
            </Logo>
          </HeaderLeft>
          <HeaderRight>
            <UserInfo>
              <UserAvatar>👑</UserAvatar>
              <UserDetails>
                <UserName>{user.fullName}</UserName>
                <UserRole>Administrator</UserRole>
              </UserDetails>
            </UserInfo>
            <LogoutButton onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </LogoutButton>
          </HeaderRight>
        </HeaderContent>
      </Header>
      <MainContent>
        <Sidebar>
          <SidebarContent>
            <NavSection>
              <NavTitle>Main Menu</NavTitle>
              <NavList>
                <NavItem>
                  <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                    <NavIcon className="fas fa-tachometer-alt"></NavIcon>
                    <NavText>Overview</NavText>
                  </NavButton>
                </NavItem>
                <NavItem>
                  <NavButton active={activeTab === 'hotels'} onClick={() => setActiveTab('hotels')}>
                    <NavIcon className="fas fa-hotel"></NavIcon>
                    <NavText>Hotel Management</NavText>
                  </NavButton>
                </NavItem>
                <NavItem>
                  <NavButton active={activeTab === 'create-hotel'} onClick={() => setActiveTab('create-hotel')}>
                    <NavIcon className="fas fa-plus"></NavIcon>
                    <NavText>Create Hotel</NavText>
                  </NavButton>
                </NavItem>
                <NavItem>
                  <NavButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')}>
                    <NavIcon className="fas fa-calendar-check"></NavIcon>
                    <NavText>Bookings</NavText>
                  </NavButton>
                </NavItem>
                <NavItem>
                  <NavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
                    <NavIcon className="fas fa-users"></NavIcon>
                    <NavText>Users</NavText>
                  </NavButton>
                </NavItem>
              </NavList>
            </NavSection>
          </SidebarContent>
        </Sidebar>
        <ContentArea>
          <ContentWrapper>{renderContent()}</ContentWrapper>
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
`;
const Header = styled.header`
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
`;
const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
`;
const HeaderLeft = styled.div``;
const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;
const LogoIcon = styled.span`
  font-size: 1.5rem;
`;
const LogoText = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;
const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
`;
const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;
const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-lighter);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;
const UserDetails = styled.div``;
const UserName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
`;
const UserRole = styled.div`
  font-size: 0.75rem;
  color: var(--text-tertiary);
`;
const LogoutButton = styled.button`
  background: var(--button-danger);
  color: var(--white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  &:hover { background: var(--button-danger-hover); }
  i { font-size: 0.75rem; }
`;
const MainContent = styled.div`
  display: flex;
  flex: 1;
`;
const Sidebar = styled.aside`
  width: 280px;
  background: var(--white);
  border-right: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  height: calc(100vh - 80px);
  overflow-y: auto;
`;
const SidebarContent = styled.div`
  padding: var(--spacing-lg);
`;
const NavSection = styled.div``;
const NavTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--spacing-md) 0;
`;
const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;
const NavItem = styled.li``;
const NavButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: ${props => props.active ? 'var(--primary-lighter)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: ${props => props.active ? '500' : '400'};
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
  &:hover {
    background: ${props => props.active ? 'var(--primary-lighter)' : 'var(--gray-50)'};
    color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-primary)'};
  }
`;
const NavIcon = styled.i`
  width: 16px;
  text-align: center;
`;
const NavText = styled.span``;
const ContentArea = styled.main`
  flex: 1;
  background: var(--bg-secondary);
`;
const ContentWrapper = styled.div`
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
`;
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--spacing-lg);
`;
const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;
const LoadingText = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
`;
const AccessDeniedContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
`;
const AccessDeniedCard = styled.div`
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  text-align: center;
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  width: 100%;
`;
const AccessDeniedIcon = styled.div`
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
`;
const AccessDeniedTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
`;
const AccessDeniedText = styled.p`
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
`;
const AccessDeniedButton = styled.button`
  background: var(--primary-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  &:hover { background: var(--primary-dark); }
`;

export default AdminDashboard; 