// src/pages/EditFilm.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../requests';
import './EditFilm.css';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function EditFilm() {
  const { isAdmin } = useAuth();



  const { id } = useParams();
  const navigate = useNavigate();

  const [posterFile, setPosterFile] = useState(null);    // for file upload
  const [posterUrl, setPosterUrl]   = useState('');      // for external URL preview

  const [formData, setFormData] = useState({
    title: '',
    releaseYear: '',
    genre: '',
    director: '',
    summary: '',
    trailer: '',
    poster: '',
    cast: [''],
  });

  const previewSrc = posterFile
    ? URL.createObjectURL(posterFile)
    : (posterUrl || formData.poster);

  // ── load existing film ──────────────────────────────
  useEffect(() => {
    api.get(`/films/${id}`)
      .then(res => {
        const film = res.data;
        setFormData({
          ...film,
          genre: Array.isArray(film.genre) ? film.genre.join(', ') : film.genre || '',
          cast: Array.isArray(film.cast) ? film.cast : [''],
          trailer: film.trailer || '',
          poster: film.poster || '',
        });
        setPosterUrl(film.poster || '');
      })
      .catch(err => {
        console.error('Error loading film:', err);
        toast.error('Film not found');
        navigate('/films');
      });
  }, [id, navigate]);

  // ── handlers ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCastChange = (idx, value) => {
    const updated = [...formData.cast];
    updated[idx] = value;
    setFormData(prev => ({ ...prev, cast: updated }));
  };

  const addActor = () => setFormData(prev => ({ ...prev, cast: [...prev.cast, ''] }));
  const removeActor = (idx) => setFormData(prev => ({
    ...prev,
    cast: prev.cast.filter((_, i) => i !== idx),
  }));

  const handlePosterFile = (file) => {
    setPosterFile(file);
    setPosterUrl('');
  };

  const handlePosterUrl = (val) => {
    setPosterUrl(val);
    setPosterFile(null);
  };

  // ── submit ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedCast = formData.cast.map(a => a.trim()).filter(Boolean);
    const genres = formData.genre.split(',').map(g => g.trim()).filter(Boolean);

    const data = new FormData();
    data.append('title',        formData.title);
    data.append('releaseYear',  formData.releaseYear);
    data.append('genre',        JSON.stringify(genres));
    data.append('director',     formData.director);
    data.append('summary',      formData.summary);
    data.append('trailer',      formData.trailer);
    data.append('cast',         JSON.stringify(cleanedCast));

    if (posterFile) {
      data.append('poster', posterFile);
    } else if (posterUrl) {
      data.append('posterUrl', posterUrl);
    }

    try {
      await api.put(`/films/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Film updated ✔');
      navigate(`/films/${id}`);
    } catch (err) {
      console.error('Error updating film:', err);
      toast.error('Failed to update film');
    }
  };

  useEffect(() => {
    return () => {
      if (posterFile) URL.revokeObjectURL(previewSrc);
    };
  }, [posterFile, previewSrc]);

  // ── render ──────────────────────────────────────────
  return (
    <div className="edit-film-container">
      {isAdmin && (
  <div style={{ marginTop: '1rem' }}>
    <Link to="/dashboard" className="admin-link" style={{ fontWeight: 'bold', color: '#2563eb' }}>
      🔙 Back to Dashboard
    </Link>
  </div>
)}
      <h2>Edit Film</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />

        <select name="releaseYear" value={formData.releaseYear} onChange={handleChange} required>
          <option value="">Release Year</option>
          {Array.from({ length: 50 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>

        <input
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          placeholder="Genres (e.g. Drama, Thriller)"
        />

        <input name="director" value={formData.director} onChange={handleChange} placeholder="Director" />

        <textarea
          name="summary"
          rows="4"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Summary"
        />

        <input
          name="trailer"
          value={formData.trailer}
          onChange={handleChange}
          placeholder="Trailer YouTube/Vimeo URL (optional)"
        />

        <label>Poster Image:</label>
        <small style={{ marginBottom: '0.5rem', display: 'block' }}>Upload file OR enter URL</small>
        <input type="file" accept="image/*" onChange={(e) => handlePosterFile(e.target.files[0])} />
        <input
          type="url"
          placeholder="...or Poster Image URL"
          value={posterUrl}
          onChange={(e) => handlePosterUrl(e.target.value)}
        />

        {previewSrc && (
          <div className="poster-preview">
            <img
              src={previewSrc}
              alt="Poster Preview"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/150x220?text=No+Image')}
            />
          </div>
        )}

        <label>Cast / Actors:</label>
        {formData.cast.map((actor, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              value={actor}
              onChange={(e) => handleCastChange(idx, e.target.value)}
              placeholder={`Actor ${idx + 1}`}
            />
            {formData.cast.length > 1 && (
              <button type="button" onClick={() => removeActor(idx)}>Remove</button>
            )}
          </div>
        ))}

        <button type="button" onClick={addActor}>+ Add Actor</button>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
