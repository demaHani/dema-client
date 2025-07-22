import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AdminHotelManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [updateData, setUpdateData] = useState({});

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/hotels', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHotels(data || []);
      } else {
        setMessage('Failed to fetch hotels');
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setMessage('An error occurred while fetching hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/hotels/${hotelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setMessage('Hotel deleted successfully!');
        fetchHotels();
      } else {
        setMessage('Failed to delete hotel');
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      setMessage('An error occurred while deleting the hotel');
    }
  };

  const handleOpenUpdateModal = (hotel) => {
    setEditingHotel(hotel);
    setUpdateData({
      name: hotel.name,
      description: hotel.description,
      location: hotel.location,
      city: hotel.city,
      price: hotel.price,
      rating: hotel.rating,
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : '',
      image: hotel.image,
    });
    setShowUpdateModal(true);
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingHotel) return;
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/hotels/${editingHotel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...updateData,
          amenities: updateData.amenities.split(',').map(a => a.trim())
        })
      });
      if (response.ok) {
        setMessage('Hotel updated successfully!');
        setShowUpdateModal(false);
        fetchHotels();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to update hotel');
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
      setMessage('An error occurred while updating the hotel');
    }
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <h2>Hotel Management</h2>
      <SearchBar
        type="text"
        placeholder="Search hotels by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {message && <Message>{message}</Message>}
      {loading ? (
        <p>Loading hotels...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHotels.map(hotel => (
              <tr key={hotel.id}>
                <td>{hotel.name}</td>
                <td>{hotel.location}</td>
                <td>${hotel.price}</td>
                <td>{hotel.rating}</td>
                <td>
                  <ActionButton onClick={() => handleOpenUpdateModal(hotel)}>
                    Edit
                  </ActionButton>
                  <ActionButton onClick={() => handleDeleteHotel(hotel.id)} danger>
                    Delete
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {showUpdateModal && editingHotel && (
        <Modal>
          <ModalContent>
            <CloseButton onClick={() => setShowUpdateModal(false)}>&times;</CloseButton>
            <h2>Edit Hotel: {editingHotel.name}</h2>
            <Form onSubmit={handleUpdateSubmit}>
              <FormGroup>
                <label>Name</label>
                <input type="text" name="name" value={updateData.name} onChange={handleUpdateInputChange} />
              </FormGroup>
              <FormGroup>
                <label>Description</label>
                <textarea name="description" value={updateData.description} onChange={handleUpdateInputChange}></textarea>
              </FormGroup>
              <FormGroup>
                <label>Location</label>
                <input type="text" name="location" value={updateData.location} onChange={handleUpdateInputChange} />
              </FormGroup>
              <FormGroup>
                <label>City</label>
                <input type="text" name="city" value={updateData.city} onChange={handleUpdateInputChange} />
              </FormGroup>
              <FormGroup>
                <label>Price per Night</label>
                <input type="number" name="price" value={updateData.price} onChange={handleUpdateInputChange} />
              </FormGroup>
              <FormGroup>
                <label>Rating</label>
                <input type="number" step="0.1" name="rating" value={updateData.rating} onChange={handleUpdateInputChange} />
              </FormGroup>
              <FormGroup>
                <label>Amenities (comma-separated)</label>
                <input type="text" name="amenities" value={updateData.amenities} onChange={handleUpdateInputChange} />
              </FormGroup>
              <FormGroup>
                <label>Image URL</label>
                <input type="text" name="image" value={updateData.image} onChange={handleUpdateInputChange} />
              </FormGroup>
              <SubmitButton type="submit">Update Hotel</SubmitButton>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AdminHotelManagement;

// Styled Components
const Container = styled.div`
  padding: 2rem;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: green;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  margin-right: 5px;
  cursor: pointer;
  background-color: ${props => props.danger ? '#f44336' : '#008CBA'};
  color: white;
  border: none;
`;

const Modal = styled.div`
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
`;

const ModalContent = styled.div`
  background-color: #fefefe;
  margin: 10% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 600px;
  position: relative;
`;

const CloseButton = styled.span`
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
`;

const Form = styled.form``;
const FormGroup = styled.div`
  margin-bottom: 1rem;
`;
const SubmitButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
`; 