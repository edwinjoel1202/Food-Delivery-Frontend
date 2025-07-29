import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  getCurrentUser,
  updateUser,
  updateUserCoordinates,
  getOwnedRestaurants,
  updateRestaurant,
} from '../services/api';
import CoordinatesPicker from './CoordinatesPicker';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    vehicleDetails: '',
  });
  const [coordinates, setCoordinates] = useState(null);
  const [ownedRestaurants, setOwnedRestaurants] = useState([]);
  const [restaurantCoordinates, setRestaurantCoordinates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user and role-specific data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userResponse = await getCurrentUser();
        const userData = userResponse.data;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          vehicleDetails: userData.vehicleDetails || '',
        });
        setCoordinates([userData.latitude || 51.505, userData.longitude || -0.09]);

        if (userData.role === 'RESTAURANT_OWNER') {
          const restaurantsResponse = await getOwnedRestaurants();
          setOwnedRestaurants(restaurantsResponse.data);
          const initialRestaurantCoords = {};
          restaurantsResponse.data.forEach((restaurant) => {
            initialRestaurantCoords[restaurant.restaurantId] = [
              restaurant.latitude || 51.505,
              restaurant.longitude || -0.09,
            ];
          });
          setRestaurantCoordinates(initialRestaurantCoords);
        }
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle user details update
  const handleUserUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateUser(formData);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle user coordinates update
  const handleUserCoordinatesUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateUserCoordinates({ latitude: coordinates[0], longitude: coordinates[1] });
      setSuccess('Coordinates updated successfully.');
    } catch (err) {
      setError('Failed to update coordinates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle restaurant coordinates update
  const handleRestaurantCoordinatesUpdate = async (restaurantId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const coords = restaurantCoordinates[restaurantId];
      await updateRestaurant(restaurantId, {
        ...ownedRestaurants.find((r) => r.restaurantId === restaurantId),
        latitude: coords[0],
        longitude: coords[1],
      });
      setSuccess(`Restaurant ${restaurantId} coordinates updated successfully.`);
    } catch (err) {
      setError('Failed to update restaurant coordinates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle coordinates change from CoordinatesPicker
  const handleCoordinatesChange = (newCoordinates) => {
    setCoordinates(newCoordinates);
  };

  // Handle restaurant coordinates change
  const handleRestaurantCoordinatesChange = (restaurantId, newCoordinates) => {
    setRestaurantCoordinates({
      ...restaurantCoordinates,
      [restaurantId]: newCoordinates,
    });
  };

  if (loading && !user) {
    return <div className="container mt-5">Loading...</div>;
  }

  if (!user) {
    return <div className="container mt-5">Error loading profile.</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Manage Profile</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* User Details Form */}
      <div className="card mb-4">
        <div className="card-header">Personal Details ({user.role})</div>
        <div className="card-body">
          <form onSubmit={handleUserUpdate}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            {/* Customer-specific fields */}
            {user.role === 'CUSTOMER' && (
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Delivery Person-specific fields */}
            {user.role === 'DELIVERY_PERSON' && (
              <div className="mb-3">
                <label htmlFor="vehicleDetails" className="form-label">Vehicle Details</label>
                <input
                  type="text"
                  className="form-control"
                  id="vehicleDetails"
                  name="vehicleDetails"
                  value={formData.vehicleDetails}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Details'}
            </button>
          </form>
        </div>
      </div>

      {/* User Coordinates */}
      {(user.role === 'CUSTOMER' || user.role === 'DELIVERY_PERSON') && (
        <div className="card mb-4">
          <div className="card-header">Set Your Location</div>
          <div className="card-body">
            <CoordinatesPicker
              initialPosition={coordinates}
              onCoordinatesChange={handleCoordinatesChange}
            />
            <button
              className="btn btn-primary"
              onClick={handleUserCoordinatesUpdate}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Coordinates'}
            </button>
          </div>
        </div>
      )}

      {/* Restaurant Owner: Manage Restaurants */}
      {user.role === 'RESTAURANT_OWNER' && (
        <div className="card mb-4">
          <div className="card-header">Your Restaurants</div>
          <div className="card-body">
            {ownedRestaurants.length > 0 ? (
              ownedRestaurants.map((restaurant) => (
                <div key={restaurant.restaurantId} className="mb-4">
                  <h5>{restaurant.name}</h5>
                  <p>
                    <strong>Cuisine:</strong> {restaurant.cuisineType}<br />
                    <strong>Location:</strong> {restaurant.location}<br />
                    <strong>Status:</strong> {restaurant.status}
                  </p>
                  <CoordinatesPicker
                    initialPosition={restaurantCoordinates[restaurant.restaurantId]}
                    onCoordinatesChange={(coords) =>
                      handleRestaurantCoordinatesChange(restaurant.restaurantId, coords)
                    }
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRestaurantCoordinatesUpdate(restaurant.restaurantId)}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : `Save Coordinates for ${restaurant.name}`}
                  </button>
                </div>
              ))
            ) : (
              <p>No restaurants found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;