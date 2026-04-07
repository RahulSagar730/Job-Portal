import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BriefcaseIcon from './BriefcaseIcon';

// ✅ toggleSidebar prop add kiya gaya hai
export default function Sidebar({ handleLogout, isOpen, toggleSidebar }) {
    const [isJobsOpen, setIsJobsOpen] = useState(false);
    const navigate = useNavigate();

    const onLogout = () => {
        handleLogout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                {isOpen && (

                    <div className="sidebar-brand">
                        <BriefcaseIcon className="sidebar-icon" />
                        <h2>JobPortal</h2>
                    </div>

                )}
                {/* ✅ Toggle Button yahan logo ke bagal me add kiya hai */}
                <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                    ☰
                </button>
            </div>

            <ul className="sidebar-menu">
                <li>
                    {/* ✅ Text ko span me wrap kiya hai */}
                    <Link to="/admin" className="menu-item"><span>Dashboard</span></Link>
                </li>

                {/* Dropdown Menu */}
                <li className="dropdown-container">
                    <div className="menu-item" onClick={() => setIsJobsOpen(!isJobsOpen)}>
                        <span>Jobs Management</span>
                        <span className={`arrow ${isJobsOpen ? 'open' : ''}`}>▼</span>
                    </div>
                    {isJobsOpen && (
                        <ul className="dropdown-list">
                            <li><Link to="/admin" className="dropdown-item">All Jobs</Link></li>
                        </ul>
                    )}
                </li>

                {/* --- API DOCS LINK --- */}
                <li>
                    <Link to="/admin/api-docs" className="menu-item"><span>API Docs (Swagger)</span></Link>
                </li>

                <li>
                    <Link to="/" className="menu-item"><span>View Live Website</span></Link>
                </li>
            </ul>

            <div className="sidebar-footer">
                <button className="sidebar-logout-btn" onClick={onLogout}>
                    {/* ✅ Text ko span me wrap kiya hai */}
                    <span className="logout-text">Logout</span>
                </button>
            </div>
        </aside>
    );
}