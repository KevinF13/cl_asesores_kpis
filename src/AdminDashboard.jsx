import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
    const [registros, setRegistros] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('http://127.0.0.1:8000/api/admin/kpis', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setRegistros(data);
        };
        fetchData();
    }, []);

    return (
        <div style={{padding: '20px', overflowX: 'auto'}}>
            <h2>Panel de Control KPIs</h2>
            <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead style={{background: '#f2f2f2'}}>
                    <tr>
                        <th>ID Asesor</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>KPI Visitas</th>
                        <th>Observación</th>
                    </tr>
                </thead>
                <tbody>
                    {registros.map(r => (
                        <tr key={r.id}>
                            <td>{r.usuario_id}</td>
                            <td>{r.razon_social}</td>
                            <td>{r.fecha_ingreso}</td>
                            <td>{r.visitas_diarias}</td>
                            <td>{r.observacion}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;