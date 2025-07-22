import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../App.jsx';

const BookingForm = ({ hotel, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    rooms: 1,
    specialRequests: '',
    guestName: '',
    guestEmail: '',
    guestPhone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const totalGuests = bookingData.adults + bookingData.children;
  const nights = bookingData.checkIn && bookingData.checkOut 
    ? Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))
    : 0;
  const totalCost = hotel.price * nights * bookingData.rooms;

  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        guestName: user.fullName || user.name || '',
        guestEmail: user.email || ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!bookingData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!bookingData.checkOut) newErrors.checkOut = 'Check-out date is required';
    if (bookingData.checkIn && bookingData.checkOut) {
      if (new Date(bookingData.checkIn) <= new Date()) {
        newErrors.checkIn = 'Check-in date must be in the future';
      }
      if (new Date(bookingData.checkOut) <= new Date(bookingData.checkIn)) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }
    if (!bookingData.guestName.trim()) newErrors.guestName = 'Guest name is required';
    if (!bookingData.guestEmail.trim()) newErrors.guestEmail = 'Email is required';
    if (!bookingData.guestPhone.trim()) newErrors.guestPhone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to make a booking.');
      return;
    }
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hotelId: hotel.id,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          adults: bookingData.adults,
          children: bookingData.children,
          rooms: bookingData.rooms,
          totalCost,
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          specialRequests: bookingData.specialRequests
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Booking created successfully!');
        onBookingSuccess({
          ...bookingData,
          totalCost,
          nights
        });
        onClose();
      } else {
        const error = await response.json();
        alert(`Booking failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormOverlay onClick={onClose}>
      <FormContainer onClick={(e) => e.stopPropagation()}>
        <FormHeader>
          <h2>Book Your Stay</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </FormHeader>

        <HotelInfo>
          <HotelImage src={hotel.image} alt={hotel.name} />
          <HotelDetails>
            <h3>{hotel.name}</h3>
            <p>{hotel.location}</p>
            <p>Starting from ${hotel.price}/night</p>
          </HotelDetails>
        </HotelInfo>

        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Travel Dates</SectionTitle>
            <DateRow>
              <FormGroup>
                <Label>Check-in Date</Label>
                <Input
                  type="date"
                  value={bookingData.checkIn}
                  onChange={(e) => handleInputChange('checkIn', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  error={errors.checkIn}
                />
                {errors.checkIn && <ErrorMessage>{errors.checkIn}</ErrorMessage>}
              </FormGroup>
              <FormGroup>
                <Label>Check-out Date</Label>
                <Input
                  type="date"
                  value={bookingData.checkOut}
                  onChange={(e) => handleInputChange('checkOut', e.target.value)}
                  min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  error={errors.checkOut}
                />
                {errors.checkOut && <ErrorMessage>{errors.checkOut}</ErrorMessage>}
              </FormGroup>
            </DateRow>
          </FormSection>

          <FormSection>
            <SectionTitle>Guest Information</SectionTitle>
            <GuestRow>
              <FormGroup>
                <Label>Adults</Label>
                <Select
                  value={bookingData.adults}
                  onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Children</Label>
                <Select
                  value={bookingData.children}
                  onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                >
                  {[0, 1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Rooms</Label>
                <Select
                  value={bookingData.rooms}
                  onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </Select>
              </FormGroup>
            </GuestRow>
          </FormSection>

          <FormSection>
            <SectionTitle>Contact Information</SectionTitle>
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={bookingData.guestName}
                onChange={(e) => handleInputChange('guestName', e.target.value)}
                placeholder="Enter your full name"
                error={errors.guestName}
              />
              {errors.guestName && <ErrorMessage>{errors.guestName}</ErrorMessage>}
            </FormGroup>
            <FormRow>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={bookingData.guestEmail}
                  onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                  placeholder="Enter your email"
                  error={errors.guestEmail}
                />
                {errors.guestEmail && <ErrorMessage>{errors.guestEmail}</ErrorMessage>}
              </FormGroup>
              <FormGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={bookingData.guestPhone}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  placeholder="Enter your phone number"
                  error={errors.guestPhone}
                />
                {errors.guestPhone && <ErrorMessage>{errors.guestPhone}</ErrorMessage>}
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>Special Requests</SectionTitle>
            <FormGroup>
              <TextArea
                value={bookingData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any special requests or requirements..."
                rows="3"
              />
            </FormGroup>
          </FormSection>

          <BookingSummary>
            <SummaryTitle>Booking Summary</SummaryTitle>
            <SummaryRow>
              <span>Nights:</span>
              <span>{nights}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Guests:</span>
              <span>{totalGuests} ({bookingData.adults} adults, {bookingData.children} children)</span>
            </SummaryRow>
            <SummaryRow>
              <span>Rooms:</span>
              <span>{bookingData.rooms}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Price per night:</span>
              <span>${hotel.price}</span>
            </SummaryRow>
            <TotalRow>
              <span>Total Cost:</span>
              <span>${totalCost}</span>
            </TotalRow>
          </BookingSummary>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </FormOverlay>
  );
};

// Styled Components
const FormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const HotelInfo = styled.div`
  display: flex;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  gap: 16px;
`;

const HotelImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
`;

const HotelDetails = styled.div`
  flex: 1;

  h3 {
    margin: 0 0 4px 0;
    color: #1f2937;
    font-size: 1.125rem;
    font-weight: 600;
  }

  p {
    margin: 0 0 4px 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const Form = styled.form`
  padding: 24px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
`;

const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const GuestRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 6px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${props => props.error ? '#ef4444' : '#d1d5db'};
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 4px;
`;

const BookingSummary = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const SummaryTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #6b7280;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

export default BookingForm; 