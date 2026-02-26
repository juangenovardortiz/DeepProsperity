import { NavLink } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="app-navigation" aria-label="Navegación principal">
      <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} aria-label="Inicio">
        <span className="nav-icon" aria-hidden="true">🏠</span>
        <span className="nav-label">Inicio</span>
      </NavLink>

      <NavLink to="/summary" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} aria-label="Ver resumen">
        <span className="nav-icon" aria-hidden="true">📈</span>
        <span className="nav-label">Resumen</span>
      </NavLink>

      <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} aria-label="Ver historial">
        <span className="nav-icon" aria-hidden="true">📊</span>
        <span className="nav-label">Historial</span>
      </NavLink>
    </nav>
  );
}
