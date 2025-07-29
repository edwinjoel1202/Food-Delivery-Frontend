import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { searchRestaurants, getPopularRestaurants, getFavoriteRestaurants, getCurrentUser } from '../services/api';

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]); // New state for all restaurants
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user data and initial content
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch current user
        const userResponse = await getCurrentUser();
        setUser(userResponse.data);

        // Fetch popular restaurants
        const popularResponse = await getPopularRestaurants();
        setPopularRestaurants(popularResponse.data);

        // Fetch favorite restaurants
        const favoritesResponse = await getFavoriteRestaurants();
        setFavoriteRestaurants(favoritesResponse.data);

        // Fetch all restaurants
        const allRestaurantsResponse = await searchRestaurants({}); // No keyword for all active restaurants
        setAllRestaurants(allRestaurantsResponse.data);
      } catch (err) {
        setError('Failed to load initial data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await searchRestaurants({ keyword: searchQuery });
      setRestaurants(response.data);
    } catch (err) {
      setError('Failed to search restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Restaurant card component
  const RestaurantCard = ({ restaurant }) => (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        {restaurant.imageUrl && (
          <img
            src={restaurant.imageUrl}
            className="card-img-top"
            alt={restaurant.name}
            style={{ height: '200px', objectFit: 'cover' }}
          />
        )}
        <div className="card-body">
          <h5 className="card-title">{restaurant.name}</h5>
          <p className="card-text">
            <strong>Cuisine:</strong> {restaurant.cuisineType}<br />
            <strong>Location:</strong> {restaurant.location}<br />
            <strong>Rating:</strong> {restaurant.averageRating.toFixed(1)} ({restaurant.totalReviews} reviews)<br />
            <strong>Dietary:</strong> {restaurant.dietaryPreference || 'N/A'}
          </p>
          <Link to={`/restaurants/${restaurant.restaurantId}`} className="btn btn-primary">
            View Menu
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mt-5">
      {/* Welcome Message */}
      <div className="text-center mb-5">
        <h1>Welcome{user ? `, ${user.name}` : ''}!</h1>
        <p className="lead">Discover delicious meals from your favorite restaurants.</p>
      </div>

      {/* Search Bar */}
      <form className="d-flex justify-content-center mb-5" onSubmit={handleSearch}>
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search restaurants, cuisines, or dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary ms-2" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Error Message */}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Search Results */}
      {restaurants.length > 0 && (
        <div className="mb-5">
          <h3>Search Results</h3>
          <div className="row">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.restaurantId} restaurant={restaurant} />
            ))}
          </div>
        </div>
      )}

      {/* Favorite Restaurants */}
      {favoriteRestaurants.length > 0 && (
        <div className="mb-5">
          <h3>Your Favorite Restaurants</h3>
          <div className="row">
            {favoriteRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.restaurantId} restaurant={restaurant} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Restaurants */}
      <div className="mb-5">
        <h3>Popular Restaurants</h3>
        {loading ? (
          <p>Loading popular restaurants...</p>
        ) : popularRestaurants.length > 0 ? (
          <div className="row">
            {popularRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.restaurantId} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <p>No popular restaurants found.</p>
        )}
      </div>

      {/* All Restaurants */}
      <div className="mb-5">
        <h3>All Restaurants</h3>
        {loading ? (
          <p>Loading all restaurants...</p>
        ) : allRestaurants.length > 0 ? (
          <div className="row">
            {allRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.restaurantId} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <p>No restaurants found.</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;