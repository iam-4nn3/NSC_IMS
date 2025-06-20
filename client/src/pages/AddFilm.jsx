// src/pages/AddFilm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../requests';
import { toast } from 'react-toastify';
import './AddFilm.css';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AddFilm() {
  const { isAdmin } = useAuth();



  /* ────────────────────────── STATE ────────────────────────── */
  const [posterFile, setPosterFile] = useState(null);          // local file
  const [posterUrl,  setPosterUrl]  = useState('');            // external URL preview

  const [formData, setFormData] = useState({
    title: '',
    releaseYear: '',
    genre: '',       // comma‑separated in UI
    director: '',
    summary: '',
    trailer: '',     // optional trailer link
    cast: [''],
  });

  const navigate = useNavigate();

  /* ────────────────────────── HANDLERS ─────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* Cast helpers */
  const handleCastChange = (idx, val) =>
    setFormData(prev => ({ ...prev, cast: prev.cast.map((c, i) => i === idx ? val : c) }));

  const addActor    = () => setFormData(prev => ({ ...prev, cast: [...prev.cast, ''] }));
  const removeActor = (idx) => setFormData(prev => ({ ...prev, cast: prev.cast.filter((_, i) => i !== idx) }));

  /* Poster file preview */
  const handlePosterFile = (file) => {
    setPosterFile(file);
    setPosterUrl('');                     // clear external URL preview
  };

  /* External poster URL preview (if no file) */
  const handlePosterUrl = (val) => {
    setPosterUrl(val);
    setPosterFile(null);                  // clear file if URL entered
  };

  /* ────────────────────────── SUBMIT ───────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. sanitise arrays
    const cleanedCast = formData.cast.map(a => a.trim()).filter(Boolean);
    const genres = formData.genre.split(',').map(g => g.trim()).filter(Boolean);

    // 2. build FormData
    const data = new FormData();
    data.append('title',        formData.title);
    data.append('releaseYear',  formData.releaseYear);
    data.append('genre',        JSON.stringify(genres));
    data.append('director',     formData.director);
    data.append('summary',      formData.summary);
    data.append('trailer',      formData.trailer);
    data.append('cast',         JSON.stringify(cleanedCast));

    if (posterFile) {
      data.append('poster', posterFile);          // file upload
    } else if (posterUrl) {
      data.append('posterUrl', posterUrl);        // save url instead
    }

    try {
      await api.post('/films', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Film added ✔');
      navigate('/films');
    } catch (err) {
      console.error('Error adding film:', err);
      toast.error('Failed to add film');
    }
  };

  /* ────────────────────────── PREVIEW URL ──────────────────── */
  const previewSrc = posterFile
    ? URL.createObjectURL(posterFile)
    : (posterUrl || '');

  /* cleanup objectURL */
  useEffect(() => {
    let objectUrl;
    if (posterFile) {
      objectUrl = URL.createObjectURL(posterFile);
      setPosterUrl(objectUrl);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [posterFile]);
  

  /* ────────────────────────── RENDER ───────────────────────── */
  return (
    <div className="add-film-container">
      {isAdmin && (
  <div style={{ marginTop: '1rem' }}>
    <Link to="/dashboard" className="admin-link" style={{ fontWeight: 'bold', color: '#2563eb' }}>
      🔙 Back to Dashboard
    </Link>
  </div>
)}
      <h2>Add New Film</h2>

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

        {/* ───── Trailer URL ───── */}
        <input
          name="trailer"
          value={formData.trailer}
          onChange={handleChange}
          placeholder="Trailer YouTube/Vimeo URL (optional)"
        />

        {/* ───── Poster inputs ───── */}
        <label style={{ marginTop: '1rem' }}>Poster Image:</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePosterFile(e.target.files[0])}
        />

<small style={{ marginBottom: '0.5rem', display: 'block' }}>
  Upload file <strong>OR</strong> enter poster URL below
</small>

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

        {/* ───── Cast list ───── */}
        <label style={{ marginTop: '1rem' }}>Cast / Actors:</label>
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
        <button type="submit">Save Film</button>
      </form>
    </div>
  );
}
