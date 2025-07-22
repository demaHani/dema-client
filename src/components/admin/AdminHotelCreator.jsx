import React, { useState } from 'react';
import styled from 'styled-components';

const AdminHotelCreator = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    city: '',
    country: 'Jordan',
    price: '',
    rating: '',
    amenities: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          city: formData.city,
          country: formData.country,
          price: formData.price,
          rating: formData.rating,
          amenities: formData.amenities.split(',').map(a => a.trim()),
          image: formData.imageUrl
        })
      });

      if (response.ok) {
        setMessage('Hotel created successfully!');
        setFormData({
          name: '',
          description: '',
          location: '',
          city: '',
          country: 'Jordan',
          price: '',
          rating: '',
          amenities: '',
          imageUrl: ''
        });
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to create hotel');
      }
    } catch (error) {
      console.error('Error creating hotel:', error);
      setMessage('An error occurred while creating the hotel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreatorContainer>
      <PageHeader>
        <PageTitle>Create New Hotel</PageTitle>
        <PageSubtitle>Add a new hotel to your system</PageSubtitle>
      </PageHeader>

      <FormCard>
        <CardHeader>
          <CardTitle>
            <i className="fas fa-plus me-2"></i>
            Hotel Information
          </CardTitle>
        </CardHeader>
        
        <CardBody>
          {message && (
            <MessageAlert success={message.includes('successfully')}>
              <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              {message}
            </MessageAlert>
          )}

          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <FormLabel>Hotel Name *</FormLabel>
                <FormInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>City *</FormLabel>
                <FormInput
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Country</FormLabel>
                <FormInput
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter country name"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Price per Night ($) *</FormLabel>
                <FormInput
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Rating *</FormLabel>
                <FormSelect
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Image URL</FormLabel>
                <FormInput
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <FormLabel>Location/Address *</FormLabel>
              <FormInput
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter full address or location"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Description *</FormLabel>
              <FormTextarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the hotel, its features, and what makes it special..."
                rows="4"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Amenities</FormLabel>
              <FormTextarea
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                placeholder="WiFi, Pool, Gym, Restaurant, etc. (comma-separated)"
                rows="3"
              />
            </FormGroup>

            <FormActions>
              <CancelButton type="button" onClick={() => window.history.back()}>
                Cancel
              </CancelButton>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinnerSmall />
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Create Hotel
                  </>
                )}
              </SubmitButton>
            </FormActions>
          </form>
        </CardBody>
      </FormCard>
    </CreatorContainer>
  );
};

// Styled Components
const CreatorContainer = styled.div`
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

const FormCard = styled.div`
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const CardHeader = styled.div`
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
  background: var(--gray-50);
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

const MessageAlert = styled.div`
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => props.success ? 'var(--secondary-lighter)' : '#fee2e2'};
  color: ${props => props.success ? 'var(--secondary-dark)' : '#dc2626'};
  border: 1px solid ${props => props.success ? 'var(--secondary-light)' : '#fecaca'};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
`;

const FormInput = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  transition: var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-lighter);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const FormSelect = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--white);
  cursor: pointer;
  transition: var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-lighter);
  }
`;

const FormTextarea = styled.textarea`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-lighter);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
`;

const CancelButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--white);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background: var(--gray-50);
    color: var(--text-primary);
  }
`;

const SubmitButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  background: var(--primary-color);
  color: var(--white);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  &:hover:not(:disabled) {
    background: var(--primary-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinnerSmall = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

export default AdminHotelCreator; 