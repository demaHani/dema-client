import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data);
      } else {
        setMessage('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setMessage('User status updated successfully!');
        fetchUsers();
      } else {
        setMessage('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setMessage('An error occurred while updating user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('User deleted successfully!');
        fetchUsers();
      } else {
        setMessage('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('An error occurred while deleting the user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading users...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <ManagementContainer>
      <PageHeader>
        <PageTitle>User Management</PageTitle>
        <PageSubtitle>Manage all users in your system</PageSubtitle>
      </PageHeader>

      <ControlsSection>
        <SearchInput
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </FilterSelect>
        <RefreshButton onClick={fetchUsers}>
          <i className="fas fa-sync-alt"></i>
          Refresh
        </RefreshButton>
      </ControlsSection>

      {message && (
        <MessageAlert success={message.includes('successfully')}>
          {message}
        </MessageAlert>
      )}

      <ContentCard>
        <CardHeader>
          <CardTitle>
            <i className="fas fa-users me-2"></i>
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardBody>
          {filteredUsers.length === 0 ? (
            <EmptyState>
              <EmptyIcon className="fas fa-user-slash"></EmptyIcon>
              <EmptyTitle>No Users Found</EmptyTitle>
              <EmptyText>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No users have been registered yet.'
                }
              </EmptyText>
            </EmptyState>
          ) : (
            <UsersGrid>
              {filteredUsers.map((user) => (
                <UserCard key={user.id}>
                  <UserAvatar>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </UserAvatar>
                  <UserContent>
                    <UserName>{user.fullName || 'Unnamed User'}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                    <UserDetails>
                      <DetailItem>
                        <DetailLabel>Joined:</DetailLabel>
                        <DetailValue>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Status:</DetailLabel>
                        <StatusBadge active={user.isActive}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </DetailItem>
                    </UserDetails>
                    <UserActions>
                      <ActionButton 
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        variant={user.isActive ? 'warning' : 'success'}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleDeleteUser(user.id)}
                        variant="danger"
                      >
                        Delete
                      </ActionButton>
                    </UserActions>
                  </UserContent>
                </UserCard>
              ))}
            </UsersGrid>
          )}
        </CardBody>
      </ContentCard>
    </ManagementContainer>
  );
};

// Styled Components
const ManagementContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const PageHeader = styled.div`
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
`;

const PageSubtitle = styled.p`
  color: var(--text-secondary);
  margin: 0;
`;

const ControlsSection = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
`;

const FilterSelect = styled.select`
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
`;

const RefreshButton = styled.button`
  background: var(--primary-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const MessageAlert = styled.div`
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: ${props => props.success ? 'var(--secondary-lighter)' : '#fee2e2'};
  color: ${props => props.success ? 'var(--secondary-dark)' : '#dc2626'};
`;

const ContentCard = styled.div`
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const CardBody = styled.div`
  padding: var(--spacing-xl);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
`;

const EmptyIcon = styled.i`
  font-size: 3rem;
  color: var(--gray-300);
  margin-bottom: var(--spacing-lg);
`;

const EmptyTitle = styled.h3`
  color: var(--text-secondary);
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 var(--spacing-sm) 0;
`;

const EmptyText = styled.p`
  color: var(--text-tertiary);
  margin: 0;
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
`;

const UserCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-lg);
  transition: var(--transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-lighter);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const UserContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const UserName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const UserEmail = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled.span`
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const DetailValue = styled.span`
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => props.active ? 'var(--secondary-lighter)' : '#fee2e2'};
  color: ${props => props.active ? 'var(--secondary-dark)' : '#dc2626'};
`;

const UserActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
`;

const ActionButton = styled.button`
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  cursor: pointer;
  background: var(--white);
  color: ${props => {
    switch (props.variant) {
      case 'success': return 'var(--secondary-dark)';
      case 'warning': return '#92400e';
      case 'danger': return '#dc2626';
      default: return 'var(--text-secondary)';
    }
  }};

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'success': return 'var(--secondary-lighter)';
        case 'warning': return '#fef3c7';
        case 'danger': return '#fee2e2';
        default: return 'var(--gray-50)';
      }
    }};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
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

export default AdminUserManagement; 