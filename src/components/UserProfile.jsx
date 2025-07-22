import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import HotelCard from './HotelCard.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is admin (should be redirected to admin dashboard)
    if (user.isAdmin) {
      navigate('/admin');
      return;
    }

    // Load user data for regular users
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Load bookings
      const bookingsResponse = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        // Handle both formats: { bookings: [...] } and [...]
        const bookingsArray = bookingsData.bookings || bookingsData;
        setBookings(bookingsArray);
      } else {
        console.error('Failed to load bookings:', await bookingsResponse.text());
      }

      // Load favorites
      const favoritesResponse = await fetch('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        // Handle both formats: { favorites: [...] } and [...]
        const favoritesArray = favoritesData.favorites || favoritesData;
        setFavorites(favoritesArray);
        
        // Update localStorage for compatibility with new structure
        const formattedFavorites = favoritesArray.map(fav => ({
          id: fav.hotelId,
          name: fav.hotel?.name || 'Hotel',
          location: fav.hotel?.location || 'Location',
          image: fav.hotel?.image || '/default-hotel.jpg',
          price: fav.hotel?.price || 0,
          rating: fav.hotel?.rating || 0,
          description: fav.hotel?.description || '',
          bedrooms: 1,
          bathrooms: 1,
          area: '50 sqm',
          security: true,
          amenities: fav.hotel?.amenities || []
        }));
        localStorage.setItem('userFavorites', JSON.stringify(formattedFavorites));
      } else {
        console.error('Failed to load favorites:', await favoritesResponse.text());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setBookings(bookings.filter(booking => booking.id !== bookingId));
        } else {
          const error = await response.json();
          alert(`Failed to cancel booking: ${error.message}`);
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleUpdateBooking = (booking) => {
    setEditingBooking(booking);
    setUpdateData({
      checkIn: booking.checkInDate.split('T')[0],
      checkOut: booking.checkOutDate.split('T')[0],
      numGuests: booking.numGuests,
      numRooms: booking.numRooms,
      roomType: booking.roomType,
      specialRequests: booking.specialRequests || '',
      guestPhone: booking.guestPhone || '',
      paymentMethod: booking.paymentMethod || 'credit_card'
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          checkInDate: updateData.checkIn,
          checkOutDate: updateData.checkOut,
          numGuests: updateData.numGuests,
          numRooms: updateData.numRooms,
          roomType: updateData.roomType,
          specialRequests: updateData.specialRequests,
          guestPhone: updateData.guestPhone,
          paymentMethod: updateData.paymentMethod
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh bookings to get updated data
        await loadUserData();
        setShowUpdateModal(false);
        setEditingBooking(null);
        alert('Booking updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update booking: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateInputChange = (field, value) => {
    setUpdateData(prev => ({ ...prev, [field]: value }));
  };

  const handleRemoveFavorite = async (hotelId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/favorites/${hotelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.hotelId !== hotelId));
        
        // Update localStorage
        const localStorageFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        const updatedFavorites = localStorageFavorites.filter(fav => fav.id !== hotelId);
        localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
      } else {
        const error = await response.json();
        alert(`Failed to remove from favorites: ${error.message}`);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBookingStatus = (booking) => {
    const checkIn = new Date(booking.checkInDate);
    const today = new Date();
    
    if (booking.status === 'cancelled') {
      return { status: 'cancelled', color: '#e74c3c', text: 'Cancelled' };
    } else if (checkIn > today) {
      return { status: 'upcoming', color: '#3498db', text: 'Upcoming' };
    } else if (new Date(booking.checkOutDate) < today) {
      return { status: 'completed', color: '#27ae60', text: 'Completed' };
    } else {
      return { status: 'active', color: '#f39c12', text: 'Active' };
    }
  };

  // Filter out cancelled bookings
  const activeBookings = bookings.filter(booking => booking.status !== 'cancelled');

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      // Ignore errors for now
    }
    localStorage.removeItem('userFavorites');
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <ProfileContainer>
        <ProfileContent>
          <LoadingSpinner>Redirecting to login...</LoadingSpinner>
        </ProfileContent>
      </ProfileContainer>
    );
  }

  if (isLoading) {
    return (
      <ProfileContainer>
        <ProfileContent>
          <LoadingSpinner>Loading...</LoadingSpinner>
        </ProfileContent>
      </ProfileContainer>
    );
  }

  if (error) {
    return (
      <ProfileContainer>
        <ProfileContent>
          <h1>User Profile</h1>
          <p>Error: {error}</p>
          <button onClick={loadUserData}>Retry</button>
        </ProfileContent>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <UserInfo>
          <Avatar>
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <UserDetails>
            <h1>{user.fullName || 'User'}</h1>
            <p>{user.email}</p>
          </UserDetails>
        </UserInfo>
        <LogoutButton onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </LogoutButton>
      </ProfileHeader>

      <ProfileContent>
        <TabContainer>
          <TabButton 
            active={activeTab === 'bookings'} 
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings ({activeBookings.length})
          </TabButton>
          <TabButton 
            active={activeTab === 'favorites'} 
            onClick={() => setActiveTab('favorites')}
          >
            Favorites ({favorites.length})
          </TabButton>
        </TabContainer>

        {activeTab === 'bookings' && (
          <TabContent>
            {activeBookings.length === 0 ? (
              <EmptyState>
                <EmptyIcon>📅</EmptyIcon>
                <h3>No bookings yet</h3>
                <p>You haven't made any bookings yet. Start exploring our hotels!</p>
              </EmptyState>
            ) : (
              <BookingsList>
                {activeBookings.map(booking => {
                  const status = getBookingStatus(booking);
                  return (
                    <BookingCard key={booking.id}>
                      <BookingImage src={booking.hotel?.image || "/default-hotel.jpg"} alt={booking.hotel?.name || "Hotel"} />
                      <BookingDetails>
                        <BookingHeader>
                          <h3>{booking.hotel?.name || `Hotel #${booking.hotelId}`}</h3>
                          <StatusBadge color={status.color}>
                            {status.text}
                          </StatusBadge>
                        </BookingHeader>
                        <BookingInfo>
                          <p><strong>Location:</strong> {booking.hotel?.location || 'N/A'}</p>
                          <p><strong>Room Type:</strong> {booking.roomType}</p>
                          <p><strong>Check-in:</strong> {formatDate(booking.checkInDate)}</p>
                          <p><strong>Check-out:</strong> {formatDate(booking.checkOutDate)}</p>
                          <p><strong>Guests:</strong> {booking.numGuests}</p>
                          <p><strong>Rooms:</strong> {booking.numRooms}</p>
                          <p><strong>Total Cost:</strong> ${booking.totalPrice}</p>
                          <p><strong>Booking Date:</strong> {formatDate(booking.createdAt)}</p>
                        </BookingInfo>
                        <BookingActions>
                          {status.status !== 'cancelled' && (
                            <>
                              <UpdateButton onClick={() => handleUpdateBooking(booking)}>
                                Update Booking
                              </UpdateButton>
                              <CancelButton onClick={() => handleRemoveBooking(booking.id)}>
                                Cancel Booking
                              </CancelButton>
                            </>
                          )}
                        </BookingActions>
                      </BookingDetails>
                    </BookingCard>
                  );
                })}
              </BookingsList>
            )}
          </TabContent>
        )}

        {activeTab === 'favorites' && (
          <TabContent>
            {favorites.length === 0 ? (
              <EmptyState>
                <EmptyIcon>❤️</EmptyIcon>
                <h3>No favorites yet</h3>
                <p>You haven't added any hotels to your favorites yet. Start exploring!</p>
              </EmptyState>
            ) : (
              <FavoritesGrid>
                {favorites.map(favorite => {
                  const hotel = {
                    id: favorite.hotelId,
                    name: favorite.hotel?.name || 'Hotel',
                    location: favorite.hotel?.location || 'Location',
                    image: favorite.hotel?.image || '/default-hotel.jpg',
                    price: favorite.hotel?.price || 0,
                    rating: favorite.hotel?.rating || 0,
                    description: favorite.hotel?.description || '',
                    bedrooms: 1,
                    bathrooms: 1,
                    area: '50 sqm',
                    security: true,
                    amenities: favorite.hotel?.amenities || []
                  };
                  
                  return (
                    <FavoriteCard key={favorite.id}>
                      <HotelCard hotel={hotel} onClick={() => {}} />
                      <RemoveButton onClick={() => handleRemoveFavorite(favorite.hotelId)}>
                        Remove from Favorites
                      </RemoveButton>
                    </FavoriteCard>
                  );
                })}
              </FavoritesGrid>
            )}
          </TabContent>
        )}
      </ProfileContent>

      {/* Update Booking Modal */}
      {showUpdateModal && editingBooking && (
        <ModalOverlay onClick={() => setShowUpdateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Update Booking</h3>
              <CloseButton onClick={() => setShowUpdateModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <HotelInfo>
                <h4>{editingBooking.hotel?.name || `Hotel #${editingBooking.hotelId}`}</h4>
                <p>Booking ID: {editingBooking.id}</p>
                <p>Location: {editingBooking.hotel?.location || 'N/A'}</p>
              </HotelInfo>
              
              <UpdateForm onSubmit={handleUpdateSubmit}>
                <FormRow>
                  <FormGroup>
                    <Label>Check-in Date</Label>
                    <Input
                      type="date"
                      value={updateData.checkIn}
                      onChange={(e) => handleUpdateInputChange('checkIn', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Check-out Date</Label>
                    <Input
                      type="date"
                      value={updateData.checkOut}
                      onChange={(e) => handleUpdateInputChange('checkOut', e.target.value)}
                      min={updateData.checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <Label>Number of Guests</Label>
                    <Select
                      value={updateData.numGuests}
                      onChange={(e) => handleUpdateInputChange('numGuests', parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Number of Rooms</Label>
                    <Select
                      value={updateData.numRooms}
                      onChange={(e) => handleUpdateInputChange('numRooms', parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Select>
                  </FormGroup>
                </FormRow>
                
                <FormGroup>
                  <Label>Room Type</Label>
                  <Select
                    value={updateData.roomType}
                    onChange={(e) => handleUpdateInputChange('roomType', e.target.value)}
                  >
                    <option value="Standard Room">Standard Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Suite">Suite</option>
                    <option value="Family Room">Family Room</option>
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={updateData.guestPhone}
                    onChange={(e) => handleUpdateInputChange('guestPhone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Special Requests</Label>
                  <TextArea
                    value={updateData.specialRequests}
                    onChange={(e) => handleUpdateInputChange('specialRequests', e.target.value)}
                    placeholder="Any special requests or preferences..."
                    rows="3"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Payment Method</Label>
                  <Select
                    value={updateData.paymentMethod}
                    onChange={(e) => handleUpdateInputChange('paymentMethod', e.target.value)}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </Select>
                </FormGroup>
                
                <ModalActions>
                  <CancelModalButton onClick={() => setShowUpdateModal(false)}>
                    Cancel
                  </CancelModalButton>
                  <UpdateModalButton type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Booking'}
                  </UpdateModalButton>
                </ModalActions>
              </UpdateForm>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 80px;
`;

const ProfileHeader = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 40px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
`;

const UserDetails = styled.div`
  text-align: left;
  
  h1 {
    margin: 0 0 5px 0;
    color: white;
    font-size: 28px;
  }
  
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
  }
  
  @media (max-width: 600px) {
    text-align: center;
  }
`;

const ProfileContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  margin-bottom: 0;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 20px;
  border: none;
  background: ${props => props.active ? '#667eea' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#5a6fd8' : '#e9ecef'};
  }
`;

const TabContent = styled.div`
  background: white;
  border-radius: 0 0 15px 15px;
  padding: 30px;
  min-height: 400px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: white;
  font-size: 18px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  
  h3 {
    margin: 20px 0 10px 0;
    color: #333;
    font-size: 24px;
  }
  
  p {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
  }
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const BookingCard = styled.div`
  display: flex;
  border: 1px solid #eee;
  border-radius: 15px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BookingImage = styled.img`
  width: 200px;
  height: 150px;
  object-fit: cover;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const BookingDetails = styled.div`
  flex: 1;
  padding: 20px;
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 20px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const StatusBadge = styled.span`
  background: ${props => props.color};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const BookingInfo = styled.div`
  p {
    margin: 0 0 8px 0;
    color: #666;
    font-size: 14px;
    
    strong {
      color: #333;
    }
  }
`;

const BookingActions = styled.div`
  margin-top: 20px;
`;

const UpdateButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
  
  &:hover {
    background: #2980b9;
  }
`;

const CancelButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #c0392b;
  }
`;

const FavoritesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const FavoriteCard = styled.div`
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(231, 76, 60, 0.9);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  z-index: 10;
  
  &:hover {
    background: rgba(231, 76, 60, 1);
  }
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  
  &:hover {
    background: #c82333;
    transform: translateY(-2px);
  }
  
  i {
    font-size: 14px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const ModalBody = styled.div`
  // Add any necessary styles for the modal body
`;

const UpdateForm = styled.form`
  // Add any necessary styles for the update form
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  flex: 1;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const CancelModalButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
  
  &:hover {
    background: #c0392b;
  }
`;

const UpdateModalButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  
  &:hover {
    background: #2980b9;
  }
`;

const HotelInfo = styled.div`
  margin-bottom: 20px;
  
  h4 {
    margin: 0 0 10px 0;
    font-size: 18px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

export default UserProfile; 