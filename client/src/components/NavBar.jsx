import { Link } from 'react-router-dom';
import './NavBar.css'; // We'll add styles next
import { useAuth } from '../context/AuthContext';




function NavBar() {
  const { isAdmin, logout } = useAuth();

  return (
    <nav className="navbar">
      <h2 className="logo">
  <Link to="/" style={{ textDecoration: 'none', color: '#facc15' }}>🎬 NSC IMS</Link>
</h2>

      <div className="links">
        <Link to="/">Home</Link>
        {isAdmin && <Link to="/dashboard">Dashboard</Link>}
        <Link to="/films">View Films</Link>
        {isAdmin && <Link to="/add">Add Film</Link>}
        

        {isAdmin && <button onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
}

export default NavBar;
