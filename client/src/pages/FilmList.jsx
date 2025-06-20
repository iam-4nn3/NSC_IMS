import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../requests';
import './FilmList.css';

export default function FilmList() {
  const { isAdmin } = useAuth();


  const [films, setFilms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [directorFilter, setDirectorFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  

  useEffect(() => {
    api.get('/films')
      .then(res => setFilms(res.data))
      .catch(err => console.error('Error loading films:', err));
  }, []);

  const { genres, years, directors, actors } = useMemo(() => {
    const gSet = new Set(), ySet = new Set(), dSet = new Set(), aSet = new Set();
    films.forEach(f => {
      if (Array.isArray(f.genre)) f.genre.forEach(g => gSet.add(g));
      else if (typeof f.genre === 'string') gSet.add(f.genre); // fallback

      if (f.releaseYear) ySet.add(f.releaseYear);
      if (f.director) dSet.add(f.director);
      if (Array.isArray(f.cast)) f.cast.forEach(a => aSet.add(a));
    });
    return {
      genres: [...gSet].sort(),
      years: [...ySet].sort((a, b) => b - a),
      directors: [...dSet].sort(),
      actors: [...aSet].sort()
    };
  }, [films]);

  const filteredFilms = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return films.filter(f => {
      const matchesSearch =
        !term ||
        f.title?.toLowerCase().includes(term) ||
        (Array.isArray(f.genre) && f.genre.some(g => g.toLowerCase().includes(term))) ||
        f.director?.toLowerCase().includes(term) ||
        f.releaseYear?.toString().includes(term) ||
        (Array.isArray(f.cast) && f.cast.some(actor => actor.toLowerCase().includes(term)));

      const matchesGenre = !genreFilter || (
        Array.isArray(f.genre) && f.genre.includes(genreFilter)
      );

      const matchesYear = !yearFilter || f.releaseYear?.toString() === yearFilter;
      const matchesDirector = !directorFilter || f.director === directorFilter;
      const matchesActor = !actorFilter || (
        Array.isArray(f.cast) && f.cast.includes(actorFilter)
      );

      return matchesSearch && matchesGenre && matchesYear && matchesDirector && matchesActor;
    }).sort((a, b) => b.releaseYear - a.releaseYear);
  }, [films, searchTerm, genreFilter, yearFilter, directorFilter, actorFilter]);

  const highlight = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="film-list-container">
      {isAdmin && (
  <div style={{ marginTop: '1rem' }}>
    <Link to="/dashboard" className="admin-link" style={{ fontWeight: 'bold', color: '#2563eb' }}>
      🔙 Back to Dashboard
    </Link>
  </div>
)}
      <h2>🎬 All Films</h2>

      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="filter-row">
        <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}>
          <option value="">Genre (all)</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
          <option value="">Year (all)</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select value={directorFilter} onChange={e => setDirectorFilter(e.target.value)}>
          <option value="">Director (all)</option>
          {directors.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={actorFilter} onChange={e => setActorFilter(e.target.value)}>
          <option value="">Actor (all)</option>
          {actors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <ul className="film-list">
        {filteredFilms.length > 0 ? (
          filteredFilms.map(film => (
            <li key={film.id}>
              <Link
                to={`/films/${film.id}`}
                dangerouslySetInnerHTML={{
                  __html: `${highlight(film.title)} (${film.releaseYear})`
                }}
              />
              {Array.isArray(film.genre) && (
                <p className="genre-tags">
                  {film.genre.map(g => (
                    <span key={g} className="genre-tag">{g}</span>
                  ))}
                </p>
              )}
            </li>
          ))
        ) : (
          <p>No films match your search or filters.</p>
        )}
      </ul>
    </div>
  );
}
