import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../requests';
import './FilmDetail.css';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function FilmDetail() {
  const { isAdmin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('http://localhost:5000/films')
      .then(res => {
        const match = res.data.find(f => f.id === id);
        setFilm(match);
        if (!match) setError('Film not found');
      })
      .catch(err => {
        console.error('Error fetching film:', err);
        setError('Error loading film');
      });
  }, [id]);

  const handleDelete = async () => {
    const password = prompt('Enter admin password to confirm delete:');
    if (!password) return;

    try {
      const verify = await api.post('http://localhost:5000/auth/verify-password', { password });
      if (!verify.data.verified) {
        toast.error('Incorrect password');
        return;
      }

      await api.delete(`http://localhost:5000/films/${id}`);
      toast.success('Film deleted successfully');
      navigate('/films');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Could not delete film.');
    }
  };

  if (error) return <p style={{ textAlign: 'center' }}>{error}</p>;
  if (!film) return <p style={{ textAlign: 'center' }}>Loading film…</p>;

  const posterSrc = film.poster?.startsWith('http')
    ? film.poster
    : `/uploads/${film.poster}`;

  return (
    <div className="film-detail-container">
      <div className="film-detail-main">
        {/* Poster */}
        {film.poster && (
          <div className="poster-container">
            <img
              src={posterSrc}
              alt={`${film.title} Poster`}
              className="film-poster"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/150x220?text=No+Image')}
            />
          </div>
        )}

        <h2>{film.title}</h2>
        <p><strong>Release Year:</strong> {film.releaseYear}</p>

        <p><strong>Genre:</strong>{' '}
          {Array.isArray(film.genre)
            ? film.genre.join(', ')
            : film.genre || '—'}
        </p>

        <p><strong>Director:</strong> {film.director}</p>
        <p><strong>Summary:</strong> {film.summary}</p>

        {/* Trailer Link */}
        {film.trailer && (
          <p>
            <strong>Trailer:</strong>{' '}
            <a href={film.trailer} target="_blank" rel="noopener noreferrer">
              Watch Trailer 🎥
            </a>
          </p>
        )}

        {isAdmin && (
          <>
            <Link to={`/edit/${film.id}`} className="edit-button">✏️ Edit</Link>
            <button onClick={handleDelete} className="delete-button">🗑 Delete</button>
          </>
        )}

        <Link to="/films" className="back-link">← Back to Film List</Link>
      </div>

      <div className="film-detail-side">
        {Array.isArray(film.cast) && film.cast.length > 0 && (
          <div>
            <strong>Cast:</strong>
            <ul>
              {film.cast.map((actor, idx) => (
                <li key={idx}>{actor}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
