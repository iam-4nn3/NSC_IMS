import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../requests'; // adjust path if needed
import './Dashboard.css';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('http://localhost:5000/films')
      .then(res => setFilms(res.data))
      .catch(err => {
        console.error('Error fetching films:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/login');
        } else {
          setError('Could not load film data.');
        }
      });
  }, []);

  const recent = films.slice(-3).reverse(); // last 3 films
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard-container">
      <h2>{greeting}, Admin 👋</h2>
      <p>You have {films.length} films in the database.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="dashboard-links">
        <Link to="/add" className="dashboard-link">➕ Add New Film</Link>
        <Link to="/films" className="dashboard-link">🎬 View All Films</Link>
        <button onClick={logout} className="logout-button">🚪 Log Out</button>
      </div>

      {recent.length > 0 && (
        <div className="recent-films">
          <h3>📽 Recently Added Films</h3>
          <ul>
            {recent.map(film => (
              <li key={film.id}>
                <strong>{film.title}</strong> ({film.releaseYear})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
