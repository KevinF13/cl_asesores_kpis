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
    if (token && rol) {
      setUser({ rol });
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    window.location.href = "/"; // Limpieza total de ruta
  };

  if (!user) {
    // Pasamos setUser como prop para que Login pueda actualizar el estado global
    return <Login onLogin={(data) => setUser(data)} />;
  }

  return (
    <div className="App">
      <header style={{
          padding: '15px', 
          background: '#0056b3', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <strong style={{marginLeft: '10px'}}>
          🚀 Casa Linda - Panel {user.rol.toUpperCase()}
        </strong>
        <button 
            onClick={handleLogout} 
            style={{
              marginRight: '10px', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              padding: '8px 15px', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
        >
          Cerrar Sesión
        </button>
      </header>
      
      <main style={{padding: '20px', backgroundColor: '#f4f7fa', minHeight: 'calc(100vh - 60px)'}}>
        {user.rol === 'admin' ? <AdminDashboard /> : <FormularioKpi />}
      </main>
    </div>
  );
}

export default App;