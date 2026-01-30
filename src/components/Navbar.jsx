import { NavLink } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="logo-icon">📊</span>
                <span className="logo-text">Sales Tracker</span>
            </div>
            <div className="navbar-links">
                <NavLink
                    to="/"
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                    <span className="nav-icon">🏠</span>
                    Dashboard
                </NavLink>
                <NavLink
                    to="/journal"
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                    <span className="nav-icon">📝</span>
                    Sales Journal
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;
