import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BookingForm from './BookingForm.jsx';

const HotelModal = ({ hotel, onClose }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sample reviews data - empty for demonstration
  const reviews = [];

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!user && !!token);
    if (user) {
      const userObj = JSON.parse(user);
      setIsAdmin(userObj.isAdmin || false);
    }

    // Check if hotel is in favorites
    if (user && token) {
      checkFavoriteStatus();
    } else {
      const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
      setIsFavorite(favorites.some(fav => fav.id === hotel.id));
    }
  }, [hotel.id]);

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

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSeeAll = () => {
    alert('See All Reviews functionality - This would typically show all reviews or navigate to a reviews page');
  };

  const handleBookNow = () => {
    if (!isLoggedIn) {
      alert('Please log in to book this hotel.');
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingSuccess = async (bookingData) => {
    setShowBookingForm(false);
    onClose();
    alert(`Booking successful for ${hotel.name}!\n\nBooking Details:\n- Hotel: ${hotel.name}\n- Location: ${hotel.location}\n- Total Cost: $${bookingData.totalCost}\n- Check-in: ${bookingData.checkIn}\n- Check-out: ${bookingData.checkOut}\n\nA confirmation email will be sent to your registered email address.`);
  };

  const handleFavoriteToggle = async () => {
    if (!isLoggedIn) {
      alert('Please log in to add hotels to your favorites.');
      return;
    }

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
            hotelId: hotel.id,
            hotelName: hotel.name,
            hotelLocation: hotel.location,
            hotelImage: hotel.image,
            hotelPrice: hotel.price,
            hotelRating: hotel.rating,
            hotelDescription: hotel.description,
            hotelBedrooms: hotel.bedrooms,
            hotelBathrooms: hotel.bathrooms,
            hotelArea: hotel.area,
            hotelSecurity: hotel.security,
            hotelAmenities: hotel.amenities
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
    }
  };

  if (showBookingForm && !isAdmin) {
    return (
      <BookingForm 
        hotel={hotel}
        onClose={() => setShowBookingForm(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    );
  }

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <HotelTitle>{hotel.name}</HotelTitle>
          <CloseButton onClick={onClose}>
            <i className="fas fa-times"></i>
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <ModalLeft>
            <ImageSection>
              <HotelImage src={hotel.image} alt={hotel.name} />
              <ImageOverlay />
              {!isAdmin && (
                <FavoriteButton 
                  onClick={handleFavoriteToggle}
                  isFavorite={isFavorite}
                >
                  <i className={`fas fa-heart ${isFavorite ? 'filled' : ''}`}></i>
                </FavoriteButton>
              )}
              <RatingBadge>
                <i className="fas fa-star"></i>
                {hotel.rating}
              </RatingBadge>
            </ImageSection>

            <HotelInfo>
              <LocationInfo>
                <i className="fas fa-map-marker-alt"></i>
                {hotel.location}
              </LocationInfo>

              <DetailsGrid>
                <DetailItem>
                  <i className="fas fa-bed"></i>
                  <span>{hotel.bedrooms} Bedroom{hotel.bedrooms !== 1 ? 's' : ''}</span>
                </DetailItem>
                <DetailItem>
                  <i className="fas fa-bath"></i>
                  <span>{hotel.bathrooms} Bathroom{hotel.bathrooms !== 1 ? 's' : ''}</span>
                </DetailItem>
                <DetailItem>
                  <i className="fas fa-ruler-combined"></i>
                  <span>{hotel.area}</span>
                </DetailItem>
                <DetailItem>
                  <i className="fas fa-shield-alt"></i>
                  <span>{hotel.security}</span>
                </DetailItem>
              </DetailsGrid>

              <AmenitiesSection>
                <AmenitiesTitle>Amenities</AmenitiesTitle>
                <AmenitiesList>
                  {hotel.amenities.map((amenity, index) => (
                    <AmenityTag key={index}>
                      <i className="fas fa-check"></i>
                      {amenity}
                    </AmenityTag>
                  ))}
                </AmenitiesList>
              </AmenitiesSection>

              <DescriptionSection>
                <DescriptionTitle>Description</DescriptionTitle>
                <DescriptionText>{hotel.description}</DescriptionText>
              </DescriptionSection>
            </HotelInfo>
          </ModalLeft>

          <ModalRight>
            <PriceSection>
              <PriceLabel>Starting from</PriceLabel>
              <Price>${hotel.price}</Price>
              <PriceUnit>/night</PriceUnit>
            </PriceSection>

            {!isAdmin && (
              <BookNowButton onClick={() => setShowBookingForm(true)}>
                <i className="fas fa-calendar-check"></i>
                Book Now
              </BookNowButton>
            )}

            <ReviewsSection>
              <ReviewsHeader>
                <ReviewsTitle>Reviews</ReviewsTitle>
                {reviews.length > 0 && (
                  <SeeAllButton onClick={handleSeeAll}>
                    See All
                  </SeeAllButton>
                )}
              </ReviewsHeader>

              {reviews.length > 0 ? (
                <ReviewsList>
                  {reviews.map(review => (
                    <ReviewCard key={review.id}>
                      <ReviewHeader>
                        <ReviewerAvatar>
                          <img src={review.image} alt={review.name} />
                        </ReviewerAvatar>
                        <ReviewerInfo>
                          <ReviewerName>{review.name}</ReviewerName>
                          <ReviewDate>{review.date}</ReviewDate>
                        </ReviewerInfo>
                      </ReviewHeader>
                      <ReviewText>{review.text}</ReviewText>
                    </ReviewCard>
                  ))}
                </ReviewsList>
              ) : (
                <NoReviewsMessage>
                  <NoReviewsIcon>
                    <i className="fas fa-comment-slash"></i>
                  </NoReviewsIcon>
                  <NoReviewsTitle>No reviews yet</NoReviewsTitle>
                  <NoReviewsText>Be the first to review this hotel!</NoReviewsText>
                </NoReviewsMessage>
              )}
            </ReviewsSection>
          </ModalRight>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
`;

const ModalContainer = styled.div`
  background: var(--white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
`;

const HotelTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: 50%;
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ModalLeft = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
`;

const ImageSection = styled.div`
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
`;

const HotelImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
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
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-normal);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: var(--white);
    transform: scale(1.1);
  }
  
  i {
    font-size: 1.125rem;
    color: var(--gray-400);
    transition: var(--transition-fast);
    
    &.filled {
      color: var(--error);
    }
  }
`;

const RatingBadge = styled.div`
  position: absolute;
  bottom: var(--spacing-md);
  left: var(--spacing-md);
  background: rgba(0, 0, 0, 0.8);
  color: var(--white);
  padding: var(--spacing-sm) var(--spacing-md);
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

const HotelInfo = styled.div``;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: var(--spacing-lg);
  
  i {
    color: var(--primary-color);
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-tertiary);
  font-size: 0.875rem;
  
  i {
    color: var(--primary-color);
    font-size: 0.75rem;
  }
`;

const AmenitiesSection = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const AmenitiesTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
`;

const AmenitiesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

const AmenityTag = styled.span`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--primary-lighter);
  color: var(--primary-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  
  i {
    font-size: 0.625rem;
  }
`;

const DescriptionSection = styled.div``;

const DescriptionTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
`;

const DescriptionText = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

const ModalRight = styled.div`
  width: 300px;
  background: var(--bg-secondary);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PriceSection = styled.div`
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
`;

const PriceLabel = styled.div`
  color: var(--text-tertiary);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-xs);
`;

const Price = styled.div`
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
`;

const PriceUnit = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const BookNowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  i {
    font-size: 0.875rem;
  }
`;

const ReviewsSection = styled.div`
  flex: 1;
`;

const ReviewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const ReviewsTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
`;

const SeeAllButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  
  &:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const ReviewCard = styled.div`
  background: var(--white);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
`;

const ReviewerAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ReviewerInfo = styled.div``;

const ReviewerName = styled.div`
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
`;

const ReviewDate = styled.div`
  color: var(--text-tertiary);
  font-size: 0.75rem;
`;

const ReviewText = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
`;

const NoReviewsMessage = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-tertiary);
`;

const NoReviewsIcon = styled.div`
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
`;

const NoReviewsTitle = styled.h4`
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
`;

const NoReviewsText = styled.p`
  color: var(--text-tertiary);
  font-size: 0.875rem;
  margin: 0;
`;

export default HotelModal;