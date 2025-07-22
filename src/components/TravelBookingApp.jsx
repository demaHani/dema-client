import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SearchSection from './SearchSection.jsx';
import FilterSection from './FilterSection.jsx';
import HotelCard from './HotelCard.jsx';
import HotelModal from './HotelModal.jsx';

const TravelBookingApp = () => {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: 'all',
    rating: 'all',
    amenities: []
  });

  // Fetch hotels from database
  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/hotels');
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      
      const data = await response.json();
      
      // Handle both response formats
      let hotels = [];
      if (data.success && data.hotels) {
        hotels = data.hotels;
      } else if (Array.isArray(data)) {
        hotels = data;
      } else {
        throw new Error('Invalid response format from server');
      }
      
      // Map database fields to frontend expected fields
      const mappedHotels = hotels.map(hotel => ({
        ...hotel,
        image: hotel.image || hotel.getMainImage?.() || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        price: hotel.pricePerNight || hotel.price,
        bedrooms: hotel.totalRooms || 1,
        bathrooms: Math.ceil((hotel.totalRooms || 1) / 2), // Estimate bathrooms
        area: `${(hotel.totalRooms || 1) * 50} sqm`, // Estimate area
        security: hotel.amenities?.includes('Security') || false,
        rating: hotel.rating || hotel.starRating || 3.5
      }));
      
      setAllHotels(mappedHotels);
      setFilteredHotels(mappedHotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Failed to load hotels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = allHotels;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price filter
    if (selectedFilters.priceRange !== 'all') {
      const [min, max] = selectedFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(hotel => {
        const price = parseFloat(hotel.pricePerNight || hotel.price);
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Apply rating filter
    if (selectedFilters.rating !== 'all') {
      const minRating = parseFloat(selectedFilters.rating);
      filtered = filtered.filter(hotel => {
        const rating = parseFloat(hotel.rating || hotel.starRating || 0);
        return rating >= minRating;
      });
    }

    // Apply amenities filter
    if (selectedFilters.amenities.length > 0) {
      filtered = filtered.filter(hotel =>
        selectedFilters.amenities.every(amenity =>
          hotel.amenities?.includes(amenity)
        )
      );
    }

    setFilteredHotels(filtered);
  }, [searchTerm, selectedFilters, allHotels]);

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel);
  };

  const handleCloseModal = () => {
    setSelectedHotel(null);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
  };

  return (
    <AppContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle>Discover Amazing Hotels in Jordan</HeroTitle>
          <HeroSubtitle>
            Experience the perfect blend of luxury, comfort, and authentic Jordanian hospitality
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>

      <MainContent>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner>Loading hotels...</LoadingSpinner>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={fetchHotels}>Try Again</RetryButton>
          </ErrorContainer>
        ) : (
          <>
            <SearchSection onSearch={handleSearch} />
            <FilterSection onFilterChange={handleFilterChange} />
            
            <ContentHeader>
              <HeaderInfo>
                <HeaderTitle>Available Hotels</HeaderTitle>
                <HeaderSubtitle>
                  {filteredHotels.length} hotels found
                  {searchTerm && ` for "${searchTerm}"`}
                </HeaderSubtitle>
              </HeaderInfo>
              <HeaderActions>
                <ViewToggleButton 
                  active={!showMap} 
                  onClick={() => setShowMap(false)}
                >
                  <i className="fas fa-th-large"></i>
                  List View
                </ViewToggleButton>
                <ViewToggleButton 
                  active={showMap} 
                  onClick={() => setShowMap(true)}
                >
                  <i className="fas fa-map-marked-alt"></i>
                  Map View
                </ViewToggleButton>
              </HeaderActions>
            </ContentHeader>

            {showMap ? (
              <MapContainer>
                <GoogleMap hotels={filteredHotels} />
              </MapContainer>
            ) : (
              <HotelsGrid>
                {filteredHotels.map(hotel => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onClick={() => handleHotelClick(hotel)}
                  />
                ))}
              </HotelsGrid>
            )}

            {filteredHotels.length === 0 && !loading && !error && (
              <NoResults>
                <NoResultsIcon>🏨</NoResultsIcon>
                <NoResultsTitle>No hotels found</NoResultsTitle>
                <NoResultsText>
                  Try adjusting your search criteria or filters to find more options
                </NoResultsText>
                <ClearFiltersButton onClick={() => {
                  setSearchTerm('');
                  setSelectedFilters({
                    priceRange: 'all',
                    rating: 'all',
                    amenities: []
                  });
                }}>
                  Clear All Filters
                </ClearFiltersButton>
              </NoResults>
            )}
          </>
        )}
      </MainContent>

      {selectedHotel && (
        <HotelModal
          hotel={selectedHotel}
          onClose={handleCloseModal}
        />
      )}
    </AppContainer>
  );
};

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
`;

const HeroSection = styled.section`
  background: var(--bg-gradient);
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const HeroTitle = styled.h1`
  color: var(--white);
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderInfo = styled.div``;

const HeaderTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
`;

const HeaderSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ViewToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: ${props => props.active ? 'var(--primary-color)' : 'var(--bg-secondary)'};
  color: ${props => props.active ? 'var(--white)' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-light)'};
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-fast);
  
  &:hover {
    background: ${props => props.active ? 'var(--primary-dark)' : 'var(--bg-tertiary)'};
    transform: translateY(-1px);
  }

  i {
    font-size: 0.875rem;
  }
`;

const HotelsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MapContainer = styled.div`
  height: 600px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
`;

const NoResults = styled.div`
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  border: 2px dashed var(--border-medium);
`;

const NoResultsIcon = styled.div`
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
`;

const NoResultsTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
`;

const NoResultsText = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0 0 var(--spacing-lg) 0;
  line-height: 1.6;
`;

const ClearFiltersButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-fast);

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: var(--spacing-2xl);
`;

const LoadingSpinner = styled.div`
  color: var(--text-secondary);
  font-size: 1.2rem;
  text-align: center;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-2xl);
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 1.1rem;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--error-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--error-border);
`;

const RetryButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-fast);

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }
`;

export default TravelBookingApp; 