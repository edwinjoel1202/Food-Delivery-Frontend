import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// Fix for Leaflet marker icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map events and updates
function MapUpdater({ position, setPosition, onCoordinatesChange }) {
  const map = useMap();

  // Update map center when position changes
  useEffect(() => {
    map.setView(position, 13);
  }, [position, map]);

  // Handle map clicks and marker drag
  useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      onCoordinatesChange(newPosition);
    },
    dragend(e) {
      const newPosition = [e.target.getLatLng().lat, e.target.getLatLng().lng];
      setPosition(newPosition);
      onCoordinatesChange(newPosition);
    },
  });

  return <Marker position={position} draggable={true} />;
}

function CoordinatesPicker({ initialPosition, onCoordinatesChange }) {
  // Validate initialPosition
  const isValidPosition = initialPosition && 
    Array.isArray(initialPosition) && 
    initialPosition.length === 2 && 
    Number.isFinite(initialPosition[0]) && 
    Number.isFinite(initialPosition[1]);

  const [position, setPosition] = useState(isValidPosition ? initialPosition : [51.505, -0.09]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize position with saved coordinates or geolocation
  useEffect(() => {
    if (isValidPosition) {
      setPosition(initialPosition);
      onCoordinatesChange(initialPosition);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (geoPosition) => {
          const newPosition = [geoPosition.coords.latitude, geoPosition.coords.longitude];
          setPosition(newPosition);
          onCoordinatesChange(newPosition);
          setError('');
        },
        (err) => {
          setError('Unable to access location. Please search or select manually.');
          console.error('Geolocation error:', err);
        },
        { timeout: 10000 }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, [onCoordinatesChange, isValidPosition, initialPosition]);

  // Fetch autocomplete suggestions from Nominatim
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: searchQuery,
            format: 'json',
            addressdetails: 1,
            limit: 5,
          },
          headers: { 'User-Agent': 'FoodDeliveryApp' },
        });
        setSuggestions(response.data);
      } catch (error) {
        setError('Error fetching location suggestions.');
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    const selectedPlace = suggestions.find((s) => s.display_name === searchQuery);
    if (selectedPlace) {
      const newPosition = [parseFloat(selectedPlace.lat), parseFloat(selectedPlace.lon)];
      setPosition(newPosition);
      onCoordinatesChange(newPosition);
      setSuggestions([]);
      setSearchQuery('');
      setError('');
    } else {
      setError('Please select a valid location from the suggestions.');
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    const newPosition = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    setPosition(newPosition);
    onCoordinatesChange(newPosition);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    setError('');
  };

  // Handle manual geolocation
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (geoPosition) => {
          const newPosition = [geoPosition.coords.latitude, geoPosition.coords.longitude];
          setPosition(newPosition);
          onCoordinatesChange(newPosition);
          setError('');
        },
        (err) => {
          setError('Unable to access location.');
          console.error('Geolocation error:', err);
        },
        { timeout: 10000 }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div>
      <h5>Select Location</h5>
      {error && <div className="alert alert-warning">{error}</div>}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'Search'}
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="list-group position-absolute" style={{ zIndex: 1000, maxWidth: '100%' }}>
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="list-group-item list-group-item-action"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ cursor: 'pointer' }}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </form>
      <button
        className="btn btn-secondary mb-3"
        onClick={handleUseMyLocation}
        disabled={loading}
      >
        Use My Location
      </button>
      <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapUpdater
          position={position}
          setPosition={setPosition}
          onCoordinatesChange={onCoordinatesChange}
        />
      </MapContainer>
      <p>
        Selected Coordinates: Latitude: {position[0].toFixed(6)}, Longitude: {position[1].toFixed(6)}
      </p>
    </div>
  );
}

export default CoordinatesPicker;