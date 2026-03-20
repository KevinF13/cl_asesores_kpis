import React, { useState, useEffect } from 'react';
import Login from './Login';
import FormularioKpi from './FormularioKpi';
import AdminDashboard from './AdminDashboard';

function App() {
  const [user, setUser] = useState(null);

  // Al cargar la app, verificar si ya hay una sesión guardada
  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const nombre = localStorage.getItem('nombre');

    if (token && rol) {
      setUser({ 
        rol: rol, 
        nombre: nombre || 'Usuario' 
      });
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = "/"; 
  };

  if (!user) {
    return <Login onLogin={(data) => setUser(data)} />;
  }

  return (
    <div className="App" style={{ fontFamily: '"Segoe UI", Roboto, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar Moderno con Nombre y Rol */}
      <nav style={styles.navbar}>
        <div style={styles.brandSection}>
          <div style={styles.logoBadge}>CL</div>
          <span style={styles.brandName}>Casa Linda</span>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user.nombre}</span>
            <span style={styles.userRol}>{user.rol.toUpperCase()}</span>
          </div>
          
          <button 
            onClick={handleLogout} 
            style={styles.logoutBtn}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenedor Principal: Ocupa el 100% del ancho como antes */}
      <main style={styles.mainContent}>
        {user.rol === 'admin' ? <AdminDashboard /> : <FormularioKpi />}
      </main>
    </div>
  );
}

// --- Estilos actualizados para Full Width ---
const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 25px', // Un poco más ajustado a los bordes
    height: '70px',
    backgroundColor: '#2a6784',
    color: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  brandSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoBadge: {
    backgroundColor: 'white',
    color: '#2a6784',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  brandName: {
    fontSize: '1.2rem',
    fontWeight: '700',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    borderRight: '1px solid rgba(255,255,255,0.2)', // Línea divisoria sutil
    paddingRight: '15px',
  },
  userName: {
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  userRol: {
    fontSize: '0.7rem',
    color: '#d1dce2',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'background 0.2s ease',
  },
  mainContent: {
    flex: 1, // Empuja el contenido para llenar el resto de la pantalla
    backgroundColor: '#f4f7fa',
    padding: '20px', // Mantenemos un padding pequeño para que el contenido no choque con los bordes
    width: '100%', // Asegura el ancho completo
    boxSizing: 'border-box'
  }
};

export default App;