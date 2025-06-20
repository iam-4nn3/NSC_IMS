import './Home.css';
import { Link } from 'react-router-dom';
import logo from '../assets/nsc-logo.png';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAdmin } = useAuth();
  return (
    <div className="home-container">
      <div
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${logo})`
        }}
      >
        <h1 className="hero-text">Welcome to the NSC Film Database</h1>
      </div>

      <div className="home-buttons">
  <Link to="/films" className="view-films-button">🎬 Browse Films</Link>
  {isAdmin && <Link to="/add" className="admin-button">➕ Add Film</Link>}
</div>

      <section className="about">
        <h2>About the Nollywood Studies Centre</h2>
        <p>
          The Nollywood Studies Centre (NSC), based at the School of Media and Communication,
          Pan-Atlantic University, is dedicated to preserving and researching Nigerian cinema.
          With a growing archive of over 10,000 films, NSC is a vital resource for academics,
          filmmakers, and cultural institutions.
        </p>

        <Link to="/films" className="view-films-button">📽 View Films</Link>
      </section>
    </div>
  );
}
