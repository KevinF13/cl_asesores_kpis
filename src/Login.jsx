import React, { useState } from 'react';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL;

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            console.log('API_URL:', API_URL);

            const response = await fetch(`${API_URL}/token`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('token', data.access_token);
                localStorage.setItem('rol', data.rol);
                localStorage.setItem('nombre', data.nombre);

                onLogin({ rol: data.rol, nombre: data.nombre });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error login:', errorData);
                setError(errorData.detail || '⚠️ Credenciales incorrectas.');
            }
        } catch (err) {
            console.error('Error conectando al servidor:', err);
            setError('No se pudo conectar al servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h2 style={{ margin: 0, color: '#0056b3' }}>Bienvenido</h2>
                    <span className="badge">Login</span>
                </div>
                <p>Sistema de Gestión de Asesores</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            className="password-toggle"
                        >
                            {showPassword ? 'Ocultar' : 'Mostrar'}
                        </button>
                    </div>

                    {error && (
                        <p className="muted" style={{ color: '#c43' }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;