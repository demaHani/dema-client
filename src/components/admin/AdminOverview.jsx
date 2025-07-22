import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent bookings
      const bookingsResponse = await fetch('http://localhost:5000/api/admin/bookings/recent', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setRecentBookings(bookingsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading dashboard data...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <OverviewContainer>
      <PageHeader>
        <PageTitle>Dashboard Overview</PageTitle>
        <PageSubtitle>Welcome to your admin dashboard</PageSubtitle>
      </PageHeader>

      {/* Statistics Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon className="fas fa-hotel" color="primary" />
          <StatContent>
            <StatValue>{stats.totalHotels}</StatValue>
            <StatLabel>Total Hotels</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon className="fas fa-calendar-check" color="success" />
          <StatContent>
            <StatValue>{stats.totalBookings}</StatValue>
            <StatLabel>Total Bookings</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon className="fas fa-users" color="info" />
          <StatContent>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon className="fas fa-dollar-sign" color="warning" />
          <StatContent>
            <StatValue>${stats.totalRevenue.toLocaleString()}</StatValue>
            <StatLabel>Total Revenue</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Recent Bookings */}
      <ContentCard>
        <CardHeader>
          <CardTitle>
            <i className="fas fa-clock me-2"></i>
            Recent Bookings
          </CardTitle>
          <RefreshButton onClick={fetchDashboardData}>
            <i className="fas fa-sync-alt"></i>
          </RefreshButton>
        </CardHeader>
        <CardBody>
          {recentBookings.length === 0 ? (
            <EmptyState>
              <EmptyIcon className="fas fa-calendar-times"></EmptyIcon>
              <EmptyTitle>No Recent Bookings</EmptyTitle>
              <EmptyText>There are no recent bookings to display.</EmptyText>
            </EmptyState>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Hotel</TableHeader>
                    <TableHeader>Guest</TableHeader>
                    <TableHeader>Check-in</TableHeader>
                    <TableHeader>Check-out</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Total</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <HotelInfo>
                          <HotelName>{booking.hotelName}</HotelName>
                        </HotelInfo>
                      </TableCell>
                      <TableCell>
                        <GuestInfo>
                          <GuestName>{booking.userName}</GuestName>
                          <GuestEmail>{booking.userEmail}</GuestEmail>
                        </GuestInfo>
                      </TableCell>
                      <TableCell>
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={getStatusColor(booking.status)}>
                          {booking.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <Price>${booking.totalPrice}</Price>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </ContentCard>
    </OverviewContainer>
  );
};

// Styled Components
const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-lg);
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
`;

const PageSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`;

const StatCard = styled.div`
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: var(--transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const StatIcon = styled.i`
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--white);
  background: ${props => {
    switch (props.color) {
      case 'primary': return 'var(--primary-color)';
      case 'success': return 'var(--success)';
      case 'info': return 'var(--info)';
      case 'warning': return 'var(--warning)';
      default: return 'var(--gray-500)';
    }
  }};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const RefreshButton = styled.button`
  background: var(--gray-100);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background: var(--gray-200);
    color: var(--text-primary);
  }
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

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: var(--spacing-md);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: var(--spacing-md);
  vertical-align: middle;
`;

const HotelInfo = styled.div``;

const HotelName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const GuestInfo = styled.div``;

const GuestName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const GuestEmail = styled.div`
  font-size: 0.875rem;
  color: var(--text-tertiary);
`;

const StatusBadge = styled.span`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => {
    switch (props.status) {
      case 'success': return 'var(--secondary-lighter)';
      case 'warning': return '#fef3c7';
      case 'danger': return '#fee2e2';
      default: return 'var(--gray-100)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success': return 'var(--secondary-dark)';
      case 'warning': return '#92400e';
      case 'danger': return '#dc2626';
      default: return 'var(--text-secondary)';
    }
  }};
`;

const Price = styled.div`
  font-weight: 600;
  color: var(--text-primary);
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

export default AdminOverview; 