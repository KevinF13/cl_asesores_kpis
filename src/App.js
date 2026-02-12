import React, { useState } from 'react';
import Login from './Login';
import FormularioKpi from './FormularioKpi';
import AdminDashboard from './AdminDashboard';

function App() {
  const [user, setUser] = useState(null); // { token, rol }

  if (!user) {
    return <Login onLogin={(data) => setUser(data)} />;
  }

  return (
    <div>
      <nav style={{padding: '10px', background: '#0056b3', color: 'white', display: 'flex', justifyContent: 'space-between'}}>
        <span>Farmacid - Sesión {user.rol}</span>
        <button onClick={() => setUser(null)} style={{background: 'red', color: 'white', border: 'none'}}>Salir</button>
      </nav>
      {user.rol === 'admin' ? <AdminDashboard /> : <FormularioKpi />}
    </div>
  );
}

export default App;