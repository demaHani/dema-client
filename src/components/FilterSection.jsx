import React, { useState } from 'react';
import styled from 'styled-components';

const FilterSection = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    priceRange: 'all',
    rating: 'all',
    amenities: []
  });

  const [showFilters, setShowFilters] = useState(false);

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-100', label: 'Under $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200-300', label: '$200 - $300' },
    { value: '300+', label: 'Over $300' }
  ];

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' },
    { value: '3.0', label: '3.0+ Stars' }
  ];

  const availableAmenities = [
    'WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Beach Access', 
    'Parking', 'Air Conditioning', 'Room Service', 'Business Center',
    'Diving Center', 'Desert Tours', 'Stargazing', 'Traditional Food'
  ];

  const handleFilterChange = (filterType, value) => {
    let newFilters = { ...filters };

    if (filterType === 'amenities') {
      if (filters.amenities.includes(value)) {
        newFilters.amenities = filters.amenities.filter(item => item !== value);
      } else {
        newFilters.amenities = [...filters.amenities, value];
      }
    } else {
      newFilters[filterType] = value;
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      priceRange: 'all',
      rating: 'all',
      amenities: []
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange !== 'all') count++;
    if (filters.rating !== 'all') count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    return count;
  };

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterToggle onClick={() => setShowFilters(!showFilters)}>
          <i className={`fas fa-${showFilters ? 'times' : 'filter'}`}></i>
          Filters
          {getActiveFiltersCount() > 0 && (
            <FilterBadge>{getActiveFiltersCount()}</FilterBadge>
          )}
        </FilterToggle>
        
        {getActiveFiltersCount() > 0 && (
          <ClearFiltersButton onClick={handleClearFilters}>
            <i className="fas fa-times"></i>
            Clear All
          </ClearFiltersButton>
        )}
      </FilterHeader>

      {showFilters && (
        <FilterContent>
          <FilterGroup>
            <FilterLabel>Price Range</FilterLabel>
            <FilterOptions>
              {priceRanges.map((range) => (
                <FilterOption
                  key={range.value}
                  active={filters.priceRange === range.value}
                  onClick={() => handleFilterChange('priceRange', range.value)}
                >
                  {range.label}
                </FilterOption>
              ))}
            </FilterOptions>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Rating</FilterLabel>
            <FilterOptions>
              {ratingOptions.map((rating) => (
                <FilterOption
                  key={rating.value}
                  active={filters.rating === rating.value}
                  onClick={() => handleFilterChange('rating', rating.value)}
                >
                  <i className="fas fa-star"></i>
                  {rating.label}
                </FilterOption>
              ))}
            </FilterOptions>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Amenities</FilterLabel>
            <AmenitiesGrid>
              {availableAmenities.map((amenity) => (
                <AmenityCheckbox
                  key={amenity}
                  active={filters.amenities.includes(amenity)}
                  onClick={() => handleFilterChange('amenities', amenity)}
                >
                  <CheckboxIcon>
                    {filters.amenities.includes(amenity) && (
                      <i className="fas fa-check"></i>
                    )}
                  </CheckboxIcon>
                  {amenity}
                </AmenityCheckbox>
              ))}
            </AmenitiesGrid>
          </FilterGroup>

          {filters.amenities.length > 0 && (
            <SelectedAmenities>
              <SelectedLabel>Selected Amenities:</SelectedLabel>
              <SelectedTags>
                {filters.amenities.map((amenity) => (
                  <SelectedTag
                    key={amenity}
                    onClick={() => handleFilterChange('amenities', amenity)}
                  >
                    {amenity}
                    <i className="fas fa-times"></i>
                  </SelectedTag>
                ))}
              </SelectedTags>
            </SelectedAmenities>
          )}
        </FilterContent>
      )}
    </FilterContainer>
  );
};

const FilterContainer = styled.div`
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
`;

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  position: relative;
  
  &:hover {
    color: var(--primary-color);
  }
  
  i {
    font-size: 0.875rem;
  }
`;

const FilterBadge = styled.span`
  background: var(--primary-color);
  color: var(--white);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: var(--spacing-xs);
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--error);
  color: var(--white);
  border: none;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--button-danger-hover);
    transform: translateY(-1px);
  }
  
  i {
    font-size: 0.75rem;
  }
`;

const FilterContent = styled.div`
  padding: var(--spacing-xl);
`;

const FilterGroup = styled.div`
  margin-bottom: var(--spacing-xl);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.h3`
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

const FilterOption = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: ${props => props.active ? 'var(--primary-color)' : 'var(--bg-secondary)'};
  color: ${props => props.active ? 'var(--white)' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-light)'};
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  
  &:hover {
    background: ${props => props.active ? 'var(--primary-dark)' : 'var(--bg-tertiary)'};
    transform: translateY(-1px);
  }
  
  i {
    font-size: 0.75rem;
    color: ${props => props.active ? 'var(--warning)' : 'var(--text-tertiary)'};
  }
`;

const AmenitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-sm);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AmenityCheckbox = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: ${props => props.active ? 'var(--primary-lighter)' : 'var(--bg-secondary)'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-light)'};
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
  
  &:hover {
    background: ${props => props.active ? 'var(--primary-lighter)' : 'var(--bg-tertiary)'};
    transform: translateY(-1px);
  }
`;

const CheckboxIcon = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-medium);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  flex-shrink: 0;
  
  i {
    font-size: 0.75rem;
    color: var(--primary-color);
  }
`;

const SelectedAmenities = styled.div`
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-lg);
  margin-top: var(--spacing-lg);
`;

const SelectedLabel = styled.h4`
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SelectedTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

const SelectedTag = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }
  
  i {
    font-size: 0.625rem;
  }
`;

export default FilterSection; 