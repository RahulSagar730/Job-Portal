import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BriefcaseIcon from '../components/BriefcaseIcon';
import { jobApi } from '../services/api';
import { Eye, EyeOff } from "lucide-react";

export default function Login({ setIsAuthenticated }) {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/admin");
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        // ✅ prevent multiple clicks
        if (loading) return;

        setLoading(true);
        setError("");

        try {
            if (!credentials.username || !credentials.password) {
                setError('Username and password are required');
                return;
            }

            const result = await jobApi.loginApi(credentials);

            // ✅ safe check
            if (result?.statusCode === 200 && result?.data?.token) {

                // ✅ store auth data
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('refreshToken', result.data.refreshToken);
                localStorage.setItem('username', result.data.username);
                localStorage.setItem('role', result.data.role);

                setIsAuthenticated(true);

                // ✅ redirect
                navigate('/admin');

            } else {
                setError(result?.message || 'Invalid username or password');
            }

        } catch (err) {
            console.error("Login Error:", err);
            setError('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="container login-container">
            <div className="login-box">
                <div className="page-header">
                    <BriefcaseIcon className="page-icon" />
                    <h2>Admin Login</h2>
                </div>

                {error && <p className="error-text">{error}</p>}

                <form onSubmit={handleLogin} className="admin-form">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                    />

                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />

                        <span onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </span>
                    </div>
                    <button type="submit" className="apply-btn" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </section>
    );
}