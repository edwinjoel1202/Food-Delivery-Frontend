import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // Placeholder for /api/discovery/search
  };

  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1>Welcome to FoodDelivery</h1>
        <p className="lead">
          Discover delicious meals from your favorite restaurants, delivered to
          your door.
        </p>
        <form className="d-flex justify-content-center mt-4" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search restaurants, cuisines, or dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary ms-2">Search</button>
        </form>
      </div>
    </div>
  );
}

export default HomePage;