import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import BriefcaseIcon from './components/BriefcaseIcon';
import Sidebar from './components/Sidebar'; // ✅ Make sure to import the Sidebar
import Login from './pages/Login';
import './App.css';
import { jobApi } from '../src/services/api';
import ApiDocs from './pages/ApiDocs';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// ✅ Naya Layout Wrapper Component banaya gaya hai jisme useLocation() chal sake
const AppLayout = ({ isAuthenticated, setIsAuthenticated, handleLogout }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    // Sidebar toggle state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className={isAdminRoute ? "admin-layout-wrapper" : ""}>

            {/* --- ADMIN LAYOUT: Left Sidebar (Sirf tab dikhega jab user /admin par hoga) --- */}
            {isAdminRoute && isAuthenticated && (
                <Sidebar 
                    handleLogout={handleLogout} 
                    isOpen={isSidebarOpen} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} // ✅ FIX: Toggle function yahan pass kiya hai
                />
            )}

            {/* --- PUBLIC LAYOUT: Top Navbar (Admin pages par hide ho jayega) --- */}
            {!isAdminRoute && (
                <nav className="navbar">
                    <Link to="/" className="brand-logo">
                        <BriefcaseIcon className="brand-icon" />
                        <div className="brand-text">
                            <span className="brand-title">JobPortal</span>
                            <span className="brand-subtitle">Find Your Dream Job</span>
                        </div>
                    </Link>

                    <ul>
                        {isAuthenticated ? (
                            <>
                                {/* Agar logged in hai, to Dashboard jane ka link dikhaye */}
                                <li><Link to="/admin">Dashboard</Link></li>
                                <li>
                                    <button onClick={handleLogout} className="logout-btn">
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li><Link to="/login">Login</Link></li>
                        )}
                    </ul>
                </nav>
            )}

            {/* --- MAIN CONTENT AREA --- */}
            <main className={isAdminRoute ? "admin-main-content" : ""}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

                    {/* ✅ ONLY ONE ADMIN ROUTE */}
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    
                    {/* ✅ NEW API Docs Route */}
                    <Route
                        path="/admin/api-docs"
                        element={
                            <ProtectedRoute>
                                <ApiDocs />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ✅ Auto login on refresh using token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogout = async () => {
        try {
            await jobApi.logoutApi();
        } catch (error) {
            console.error("Logout API error:", error);
        }

        // ✅ clear frontend auth
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        localStorage.removeItem("role");

        setIsAuthenticated(false);

        // optional redirect
        window.location.href = "/";
    };

    return (
        <Router>
            {/* AppLayout ko yahan call kiya gaya hai */}
            <AppLayout
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
                handleLogout={handleLogout}
            />
        </Router>
    );
}

export default App;