import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function WelcomePage() {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1>FoodDelivery</h1>
        <p className="lead">Your favorite meals, delivered fast and fresh!</p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link to="/login" className="btn btn-outline-primary btn-lg px-4">
            Login
          </Link>
          <Link to="/register" className="btn btn-outline-primary btn-lg px-4">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;