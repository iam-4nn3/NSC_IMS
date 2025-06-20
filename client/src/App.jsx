// App.jsx  – final, working version
import { Routes, Route } from 'react-router-dom';
import NavBar   from './components/NavBar';
import Home     from './pages/Home';
import FilmList from './pages/FilmList';
import FilmDetail from './pages/FilmDetail';
import AddFilm  from './pages/AddFilm';
import EditFilm from './pages/EditFilm';
import './components/NavBar.css';
import './pages/Home.css';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import { Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './pages/Dashboard.css';

export default function App() {
  const { isAdmin } = useAuth();
  return (
    <>
      <NavBar />
      <main className="page-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/films" element={<FilmList />} />
        <Route path="/films/:id" element={<FilmDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={isAdmin ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/add" element={isAdmin ? <AddFilm /> : <Navigate to="/login" />} />
        <Route path="/edit/:id" element={isAdmin ? <EditFilm /> : <Navigate to="/login" />} />

        <Route path="*" element={<p style={{ textAlign: 'center' }}>404 – Page Not Found</p>} />

      </Routes>
      
      </main>
    </>
  );
}
