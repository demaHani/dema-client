import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../App.jsx';
import BookingForm from './BookingForm.jsx';

const HotelCard = ({ hotel, onClick, isCompact = false }) => {
  const [isBooking, setIsBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const isLoggedIn = !!user;
  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    if (isLoggedIn) {
      checkFavoriteStatus();
    }
  }, [hotel.id, isLoggedIn]);

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/favorites/check/${hotel.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleBookNow = (e) => {
    e.stopPropagation(); // Prevent opening the modal
    
    if (!isLoggedIn) {
      alert('Please log in to book this hotel.');
      return;
    }
    
    setShowBookingForm(true);
  };

  const handleBookingSuccess = async (bookingData) => {
    setShowBookingForm(false);
    
    // Booking is already created in BookingForm, just show success message
    alert(`Booking successful for ${hotel.name}!\n\nBooking Details:\n- Hotel: ${hotel.name}\n- Location: ${hotel.location}\n- Total Cost: $${bookingData.totalCost}\n- Check-in: ${bookingData.checkIn}\n- Check-out: ${bookingData.checkOut}\n\nA confirmation email will be sent to your registered email address.`);
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation(); // Prevent opening the modal
    
    if (!isLoggedIn) {
      alert('Please log in to add hotels to your favorites.');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`http://localhost:5000/api/favorites/${hotel.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsFavorite(false);
          // Update localStorage
          const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
          const updatedFavorites = favorites.filter(fav => fav.id !== hotel.id);
          localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
        } else {
          const error = await response.json();
          alert(`Failed to remove from favorites: ${error.message}`);
        }
      } else {
        // Add to favorites
        const response = await fetch('http://localhost:5000/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            hotelId: hotel.id
          })
        });

        if (response.ok) {
          setIsFavorite(true);
          // Update localStorage
          const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
          const updatedFavorites = [...favorites, hotel];
          localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
        } else {
          const error = await response.json();
          alert(`Failed to add to favorites: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      alert('Failed to update favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showBookingForm) {
    return (
      <BookingForm 
        hotel={hotel}
        onClose={() => setShowBookingForm(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    );
  }

  return (
    <CardWrapper isCompact={isCompact}>
      <Card onClick={onClick}>
        <CardImageWrapper>
          <CardImage src={hotel.image} alt={hotel.name} />
          <ImageOverlay />
          {!isAdmin && (
            <FavoriteButton 
              onClick={handleFavoriteToggle} 
              isFavorite={isFavorite}
              disabled={isLoading}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <i className={`fas fa-heart ${isFavorite ? 'filled' : ''}`}></i>
            </FavoriteButton>
          )}
          {isAdmin && (
            <AdminBadge>
              <i className="fas fa-crown"></i>
              Admin View
            </AdminBadge>
          )}
          <RatingBadge>
            <i className="fas fa-star"></i>
            {hotel.rating}
          </RatingBadge>
        </CardImageWrapper>
        
        <CardContent>
          <CardHeader>
            <HotelName>{hotel.name}</HotelName>
            <HotelLocation>
              <i className="fas fa-map-marker-alt"></i>
              {hotel.location}
            </HotelLocation>
          </CardHeader>
          
          <CardDetails>
            <DetailItem>
              <i className="fas fa-bed"></i>
              {hotel.bedrooms} Bedroom{hotel.bedrooms !== 1 ? 's' : ''}
            </DetailItem>
            <DetailItem>
              <i className="fas fa-bath"></i>
              {hotel.bathrooms} Bathroom{hotel.bathrooms !== 1 ? 's' : ''}
            </DetailItem>
            <DetailItem>
              <i className="fas fa-ruler-combined"></i>
              {hotel.area}
            </DetailItem>
          </CardDetails>
          
          <AmenitiesList>
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <AmenityTag key={index}>{amenity}</AmenityTag>
            ))}
            {hotel.amenities.length > 3 && (
              <AmenityTag>+{hotel.amenities.length - 3} more</AmenityTag>
            )}
          </AmenitiesList>
          
          <CardFooter>
            <PriceSection>
              <PriceLabel>Price per night</PriceLabel>
              <Price>${hotel.price}</Price>
              <PriceUnit>USD</PriceUnit>
            </PriceSection>
            
            {!isAdmin && (
              <BookNowButton onClick={handleBookNow}>
                <i className="fas fa-calendar-check"></i>
                Book Now
              </BookNowButton>
            )}
            
            {isAdmin && (
              <AdminManageButton onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/admin';
              }}>
                <i className="fas fa-cog"></i>
                Manage
              </AdminManageButton>
            )}
          </CardFooter>
        </CardContent>
      </Card>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  width: 100%;
  height: auto;
`;

const Card = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-sm);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const CardImageWrapper = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-normal);
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: var(--transition-normal);
  color: var(--gray-400);
  backdrop-filter: blur(10px);
  
  &:hover:not(:disabled) {
    background: var(--white);
    transform: scale(1.1);
    color: var(--error);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  i {
    font-size: 1rem;
    transition: var(--transition-fast);
    
    &.filled {
      color: var(--error);
    }
  }
`;

const AdminBadge = styled.div`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: var(--warning);
  color: var(--white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  backdrop-filter: blur(10px);
  z-index: 10;
  
  i {
    font-size: 0.75rem;
  }
`;

const RatingBadge = styled.div`
  position: absolute;
  bottom: var(--spacing-sm);
  left: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.8);
  color: var(--white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  backdrop-filter: blur(10px);
  
  i {
    color: var(--warning);
    font-size: 0.75rem;
  }
`;

const CardContent = styled.div`
  padding: var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  margin-bottom: var(--spacing-md);
`;

const HotelName = styled.h3`
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.4;
`;

const HotelLocation = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  i {
    color: var(--primary-color);
    font-size: 0.75rem;
  }
`;

const CardDetails = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
`;

const DetailItem = styled.span`
  color: var(--text-tertiary);
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  i {
    color: var(--primary-color);
    font-size: 0.75rem;
  }
`;

const AmenitiesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  flex: 1;
`;

const AmenityTag = styled.span`
  background: var(--primary-lighter);
  color: var(--primary-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--spacing-md);
  margin-top: auto;
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const PriceLabel = styled.span`
  color: var(--text-tertiary);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Price = styled.span`
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 700;
`;

const PriceUnit = styled.span`
  color: var(--text-secondary);
  font-size: 0.75rem;
`;

const BookNowButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: var(--transition-fast);
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:disabled {
    background: var(--gray-400);
    cursor: not-allowed;
    transform: none;
  }
  
  i {
    font-size: 0.75rem;
  }
`;

const AdminManageButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--warning);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: var(--transition-fast);
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: var(--warning);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    filter: brightness(1.1);
  }
  
  &:disabled {
    background: var(--gray-400);
    cursor: not-allowed;
    transform: none;
  }
  
  i {
    font-size: 0.75rem;
  }
`;

export default HotelCard; 