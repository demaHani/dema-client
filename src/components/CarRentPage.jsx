import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../App.jsx';

const CarRentPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    make: '',
    type: '',
    price_min: '',
    price_max: '',
    transmission: '',
    fuel_type: ''
  });
  const [filteredCars, setFilteredCars] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cars, filters]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/api/carRent/models');
      const data = await response.json();
      
      if (response.ok) {
        setCars(data.data || data || []);
      } else {
        setError(data.error || 'Failed to fetch car data');
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to fetch car data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cars];

    if (filters.make) {
      filtered = filtered.filter(car => 
        car.make?.toLowerCase().includes(filters.make.toLowerCase()) ||
        car.make_display?.toLowerCase().includes(filters.make.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(car => 
        car.type?.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    if (filters.price_min) {
      filtered = filtered.filter(car => 
        car.price_per_day >= parseFloat(filters.price_min)
      );
    }

    if (filters.price_max) {
      filtered = filtered.filter(car => 
        car.price_per_day <= parseFloat(filters.price_max)
      );
    }

    if (filters.transmission) {
      filtered = filtered.filter(car => 
        car.transmission?.toLowerCase() === filters.transmission.toLowerCase()
      );
    }

    if (filters.fuel_type) {
      filtered = filtered.filter(car => 
        car.fuel_type?.toLowerCase() === filters.fuel_type.toLowerCase()
      );
    }

    setFilteredCars(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      make: '',
      type: '',
      price_min: '',
      price_max: '',
      transmission: '',
      fuel_type: ''
    });
  };

  const getQuote = async (carId) => {
    if (!user) {
      alert('Please login to get a quote');
      return;
    }

    // This would typically open a modal or navigate to a quote page
    alert('Quote feature coming soon!');
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner>
          <SpinnerIcon>🚗</SpinnerIcon>
          <LoadingText>Loading car models...</LoadingText>
        </LoadingSpinner>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={fetchCars}>Try Again</RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle>Car Rental in Jordan</HeroTitle>
          <HeroSubtitle>
            Explore Jordan at your own pace with our wide selection of vehicles. 
            From compact cars to luxury SUVs, we have the perfect ride for your journey.
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>

      <MainContent>
        <FilterSection>
          <FilterTitle>Filter Cars</FilterTitle>
          <FilterGrid>
            <FilterGroup>
              <FilterLabel>Make</FilterLabel>
              <FilterInput
                type="text"
                placeholder="e.g., Toyota, BMW"
                value={filters.make}
                onChange={(e) => handleFilterChange('make', e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Type</FilterLabel>
              <FilterSelect
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Luxury">Luxury</option>
                <option value="Sports">Sports</option>
                <option value="Electric">Electric</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Min Price/Day</FilterLabel>
              <FilterInput
                type="number"
                placeholder="Min price"
                value={filters.price_min}
                onChange={(e) => handleFilterChange('price_min', e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Max Price/Day</FilterLabel>
              <FilterInput
                type="number"
                placeholder="Max price"
                value={filters.price_max}
                onChange={(e) => handleFilterChange('price_max', e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Transmission</FilterLabel>
              <FilterSelect
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
              >
                <option value="">All</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Fuel Type</FilterLabel>
              <FilterSelect
                value={filters.fuel_type}
                onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
              >
                <option value="">All</option>
                <option value="Gasoline">Gasoline</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </FilterSelect>
            </FilterGroup>
          </FilterGrid>

          <FilterActions>
            <ClearButton onClick={clearFilters}>Clear Filters</ClearButton>
            <ResultsCount>{filteredCars.length} cars found</ResultsCount>
          </FilterActions>
        </FilterSection>

        <CarsGrid>
          {filteredCars.length === 0 ? (
            <NoResults>
              <NoResultsIcon>🚗</NoResultsIcon>
              <NoResultsTitle>No cars found</NoResultsTitle>
              <NoResultsText>
                Try adjusting your filters to find more options
              </NoResultsText>
            </NoResults>
          ) : (
            filteredCars.map(car => (
              <CarCard key={car.id}>
                <CarImage src={car.image} alt={car.name} />
                <CarContent>
                  <CarHeader>
                    <CarName>
                      {car.make_display || car.make} {car.name || car.model}
                    </CarName>
                    <CarYear>{car.year}</CarYear>
                  </CarHeader>
                  
                  <CarType>{car.type}</CarType>
                  
                  <CarDetails>
                    <CarDetail>
                      <DetailIcon>⛽</DetailIcon>
                      {car.fuel_type}
                    </CarDetail>
                    <CarDetail>
                      <DetailIcon>⚙️</DetailIcon>
                      {car.transmission}
                    </CarDetail>
                    <CarDetail>
                      <DetailIcon>👥</DetailIcon>
                      {car.seats} seats
                    </CarDetail>
                    <CarDetail>
                      <DetailIcon>🚪</DetailIcon>
                      {car.doors} doors
                    </CarDetail>
                  </CarDetails>

                  {car.features && car.features.length > 0 && (
                    <CarFeatures>
                      {car.features.slice(0, 3).map((feature, index) => (
                        <FeatureTag key={index}>{feature}</FeatureTag>
                      ))}
                      {car.features.length > 3 && (
                        <FeatureTag>+{car.features.length - 3} more</FeatureTag>
                      )}
                    </CarFeatures>
                  )}

                  <CarFooter>
                    <CarPrice>
                      <PriceAmount>${car.price_per_day}</PriceAmount>
                      <PriceUnit>per day</PriceUnit>
                    </CarPrice>
                    <QuoteButton onClick={() => getQuote(car.id)}>
                      Get Quote
                    </QuoteButton>
                  </CarFooter>
                </CarContent>
              </CarCard>
            ))
          )}
        </CarsGrid>
      </MainContent>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-gradient);
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const FilterTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterGroup = styled.div``;

const FilterLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ClearButton = styled.button`
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const ResultsCount = styled.span`
  color: var(--text-secondary);
  font-weight: 500;
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const CarCard = styled.div`
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const CarImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CarContent = styled.div`
  padding: 1.5rem;
`;

const CarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const CarName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CarYear = styled.span`
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const CarType = styled.p`
  color: #667eea;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const CarDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const CarDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const DetailIcon = styled.span`
  font-size: 1rem;
`;

const CarFeatures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const FeatureTag = styled.span`
  background: #f8fafc;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const CarFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CarPrice = styled.div`
  text-align: left;
`;

const PriceAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const PriceUnit = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const QuoteButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #5a67d8;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
`;

const SpinnerIcon = styled.div`
  font-size: 3rem;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
`;

const ErrorMessage = styled.div`
  font-size: 1.2rem;
  color: #ef4444;
  text-align: center;
`;

const RetryButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #5a67d8;
  }
`;

const NoResults = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
`;

const NoResultsIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const NoResultsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const NoResultsText = styled.p`
  color: var(--text-secondary);
`;

export default CarRentPage; 