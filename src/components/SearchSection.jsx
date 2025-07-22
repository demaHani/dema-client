import React, { useState } from 'react';
import styled from 'styled-components';

const SearchSection = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Jordanian cities and popular destinations
  const popularDestinations = [
    'Amman', 'Petra', 'Dead Sea', 'Aqaba', 'Wadi Rum', 'Jerash', 
    'Madaba', 'Karak', 'Ajloun', 'Salt', 'Zarqa', 'Irbid', 'Tafilah',
    'Ma\'an', 'Al Mafraq', 'Al Karak', 'Al Tafilah', 'Al Aqabah'
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      const filtered = popularDestinations.filter(destination =>
        destination.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setShowSuggestions(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
  };

  return (
    <SearchContainer>
      <SearchForm onSubmit={handleSearchSubmit}>
        <SearchInputWrapper>
          <SearchIcon>
            <i className="fas fa-search"></i>
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search hotels, cities, or destinations in Jordan..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {searchTerm && (
            <ClearButton onClick={handleClearSearch} type="button">
              <i className="fas fa-times"></i>
            </ClearButton>
          )}
        </SearchInputWrapper>
        
        <SearchButton type="submit">
          <i className="fas fa-search"></i>
          Search
        </SearchButton>
      </SearchForm>

      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsDropdown>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <i className="fas fa-map-marker-alt"></i>
              {suggestion}
            </SuggestionItem>
          ))}
        </SuggestionsDropdown>
      )}

      <PopularDestinations>
        <PopularTitle>Popular Destinations:</PopularTitle>
        <PopularTags>
          {popularDestinations.slice(0, 8).map((destination, index) => (
            <PopularTag
              key={index}
              onClick={() => handleSuggestionClick(destination)}
            >
              {destination}
            </PopularTag>
          ))}
        </PopularTags>
      </PopularDestinations>
    </SearchContainer>
  );
};

const SearchContainer = styled.div`
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  margin-bottom: var(--spacing-xl);
  position: relative;
`;

const SearchForm = styled.form`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-tertiary);
  z-index: 2;
  
  i {
    font-size: 1rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) calc(var(--spacing-lg) + 1.5rem);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: var(--transition-fast);
  
  &::placeholder {
    color: var(--text-tertiary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: var(--white);
    box-shadow: 0 0 0 3px var(--primary-lighter);
  }
  
  &:hover {
    border-color: var(--border-medium);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: 50%;
  transition: var(--transition-fast);
  z-index: 2;
  
  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }
  
  i {
    font-size: 0.875rem;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  i {
    font-size: 0.875rem;
  }
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: var(--spacing-xs);
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--primary-color);
  }
  
  &:first-child {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }
  
  i {
    color: var(--primary-color);
    font-size: 0.875rem;
    width: 16px;
  }
`;

const PopularDestinations = styled.div`
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-lg);
`;

const PopularTitle = styled.h3`
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PopularTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

const PopularTag = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--primary-lighter);
    color: var(--primary-color);
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }
`;

export default SearchSection; 