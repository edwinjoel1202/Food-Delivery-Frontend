import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import WelcomePage from './components/WelcomePage';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/favorites" element={<div>Favorites Page (TBD)</div>} />
          <Route path="/cart" element={<div>Cart Page (TBD)</div>} />
          <Route path="/orders" element={<div>My Orders Page (TBD)</div>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/restaurants/:id" element={<div>Restaurant Menu Page (TBD)</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;