import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Placeholder for search functionality
    console.log("Search query:", searchQuery);
    // In the future, this will call /api/discovery/search
  };

  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1>Welcome to FoodDelivery</h1>
        <p className="lead">
          Discover delicious meals from your favorite restaurants, delivered to
          your door.
        </p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-outline-primary btn-lg px-4 hover-primary">
            Login
          </button>
          <button className="btn btn-outline-primary btn-lg px-4">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
