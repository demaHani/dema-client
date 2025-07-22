import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AdminBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || data);
      } else {
        setMessage('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setMessage('An error occurred while fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setMessage('Booking status updated successfully!');
        fetchBookings();
      } else {
        setMessage('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      setMessage('An error occurred while updating booking status');
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
      case 'completed':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         booking.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading bookings...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <ManagementContainer>
      <PageHeader>
        <PageTitle>Booking Management</PageTitle>
        <PageSubtitle>Manage all bookings in your system</PageSubtitle>
      </PageHeader>

      <ControlsSection>
        <SearchInput
          type="text"
          placeholder="Search by hotel, guest name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>
        <RefreshButton onClick={fetchBookings}>
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
            <i className="fas fa-calendar-check me-2"></i>
            Bookings ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardBody>
          {filteredBookings.length === 0 ? (
            <EmptyState>
              <EmptyIcon className="fas fa-calendar-times"></EmptyIcon>
              <EmptyTitle>No Bookings Found</EmptyTitle>
              <EmptyText>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No bookings have been made yet.'
                }
              </EmptyText>
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
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((booking) => (
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
                      <TableCell>
                        <ActionButtons>
                          {booking.status.toLowerCase() === 'pending' && (
                            <>
                              <ActionButton 
                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                variant="success"
                              >
                                Confirm
                              </ActionButton>
                              <ActionButton 
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                variant="danger"
                              >
                                Cancel
                              </ActionButton>
                            </>
                          )}
                          {booking.status.toLowerCase() === 'confirmed' && (
                            <ActionButton 
                              onClick={() => handleUpdateStatus(booking.id, 'completed')}
                              variant="info"
                            >
                              Complete
                            </ActionButton>
                          )}
                        </ActionButtons>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
      case 'info': return '#dbeafe';
      default: return 'var(--gray-100)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success': return 'var(--secondary-dark)';
      case 'warning': return '#92400e';
      case 'danger': return '#dc2626';
      case 'info': return '#1e40af';
      default: return 'var(--text-secondary)';
    }
  }};
`;

const Price = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  cursor: pointer;
  background: var(--white);
  color: ${props => {
    switch (props.variant) {
      case 'success': return 'var(--secondary-dark)';
      case 'danger': return '#dc2626';
      case 'info': return '#1e40af';
      default: return 'var(--text-secondary)';
    }
  }};

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'success': return 'var(--secondary-lighter)';
        case 'danger': return '#fee2e2';
        case 'info': return '#dbeafe';
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

export default AdminBookingManagement; 