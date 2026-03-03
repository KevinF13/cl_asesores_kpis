import React, { useEffect, useState, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    LabelList, ComposedChart, AreaChart, Area, Line, PieChart, Pie, Cell, LineChart 
} from 'recharts';

const AdminDashboard = () => {
    const [registros, setRegistros] = useState([]);
    const [filtroAsesor, setFiltroAsesor] = useState('todos');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:8000/api/admin/kpis', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRegistros(data);
                }
            } catch (error) {
                console.error("Error conectando al servidor:", error);
            }
        };
        fetchData();
    }, []);

    // 1. Filtrado dinámico
    const datosFiltrados = useMemo(() => {
        return registros.filter(r => {
            const cumpleAsesor = filtroAsesor === 'todos' || r.asesor_nombre === filtroAsesor;
            const cumpleFecha = (!fechaInicio || r.fecha >= fechaInicio) && 
                               (!fechaFin || r.fecha <= fechaFin);
            return cumpleAsesor && cumpleFecha;
        });
    }, [registros, filtroAsesor, fechaInicio, fechaFin]);

    // 2. Agregación por Cliente (Razón Social) - Enfocado en DINERO
    const dataClientes = useMemo(() => {
        const temp = {};
        datosFiltrados.forEach(r => {
            const key = r.nombre_comercial || r.razon_social || "Sin Nombre";
            if (!temp[key]) {
                temp[key] = { 
                    name: key, 
                    ventas: 0, 
                    cobros: 0, 
                    visitas: 0 
                };
            }
            temp[key].ventas += parseFloat(r.us_venta || 0);
            temp[key].cobros += parseFloat(r.us_cobro || 0);
            temp[key].visitas += 1;
        });
        return Object.values(temp).sort((a, b) => b.ventas - a.ventas); // Ordenar por mejores ventas
    }, [datosFiltrados]);

    const listaNombresAsesores = useMemo(() => [...new Set(registros.map(r => r.asesor_nombre))], [registros]);
    const COLORS = ['#2563eb', '#10b981']; // Azul para Ventas, Verde para Cobros

    return (
        <div style={{ padding: '30px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            
            {/* PANEL DE CONTROL SUPERIOR */}
            <div style={headerStyle}>
                <div>
                    <h1 style={{ color: '#0f172a', margin: 0, fontSize: '24px' }}>Centro de Mando Casa Linda</h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Seguimiento Comercial y Recuperación de Cartera</p>
                </div>
                <div style={filterGroupStyle}>
                    <div style={filterItem}>
                        <label>Asesor</label>
                        <select value={filtroAsesor} onChange={(e) => setFiltroAsesor(e.target.value)} style={inputStyle}>
                            <option value="todos">Todos los Asesores</option>
                            {listaNombresAsesores.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div style={filterItem}>
                        <label>Rango de Fechas</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={inputStyle} />
                            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                </div>
            </div>

            {/* INDICADORES CLAVE (Financieros) */}
            <div style={kpiGrid}>
                <KPICard title="Venta Total" value={`$${dataClientes.reduce((a,b)=>a+b.ventas,0).toLocaleString()}`} sub="Monto facturado" color="#2563eb" />
                <KPICard title="Cobro Realizado" value={`$${dataClientes.reduce((a,b)=>a+b.cobros,0).toLocaleString()}`} sub="Recuperación de cartera" color="#16a34a" />
                <KPICard title="Efectividad" value={`${((dataClientes.reduce((a,b)=>a+b.cobros,0) / dataClientes.reduce((a,b)=>a+b.ventas,1)) * 100).toFixed(1)}%`} sub="Cobro vs Venta" color="#8b5cf6" />
                <KPICard title="Total Gestiones" value={datosFiltrados.length} sub="Visitas/Llamadas" color="#64748b" />
            </div>

            {/* SECCIÓN DE GRÁFICOS */}
            <div style={mainGrid}>
                {/* 1. Comparativa Venta vs Cobro por Cliente */}
                <div style={chartCard}>
                    <h3 style={chartTitle}>Top 10 Clientes: Ventas vs Cobros ($)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={dataClientes.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value}`} />
                            <Legend />
                            <Bar dataKey="ventas" fill="#2563eb" name="Venta ($)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="cobros" fill="#10b981" name="Cobro ($)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Distribución de Carga de Trabajo (KPIs) */}
                <div style={chartCard}>
                    <h3 style={chartTitle}>Composición de la Gestión</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie 
                                data={[
                                    { name: 'Visitas', value: datosFiltrados.filter(r => r.kpi === 'VISITAS DIARIAS').length },
                                    { name: 'Llamadas Cobro', value: datosFiltrados.filter(r => r.kpi === 'LLAMADAS COBRANZA').length },
                                    { name: 'Otros', value: datosFiltrados.filter(r => r.kpi !== 'VISITAS DIARIAS' && r.kpi !== 'LLAMADAS COBRANZA').length },
                                ]} 
                                cx="50%" cy="50%" outerRadius={100} dataKey="value" label
                            >
                                <Cell fill="#2563eb" />
                                <Cell fill="#f43f5e" />
                                <Cell fill="#64748b" />
                            </Pie>
                            <Tooltip /> <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TABLA DE AUDITORÍA (Ajustada a la nueva DB) */}
            <div style={tableCard}>
                <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Registro Detallado de Visitas y Cobranzas</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={thStyle}>Fecha</th>
                                <th style={thStyle}>Asesor</th>
                                <th style={thStyle}>Cliente / Contacto</th>
                                <th style={thStyle}>Gestión Realizada</th>
                                <th style={thStyle}>Venta ($)</th>
                                <th style={thStyle}>Cobro ($)</th>
                                <th style={thStyle}>Próxima Visita</th>
                                <th style={thStyle}>Pendientes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datosFiltrados.map((r, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>{r.fecha}<br/><small>{r.hora}</small></td>
                                    <td style={tdStyle}><strong>{r.asesor_nombre}</strong></td>
                                    <td style={tdStyle}>
                                        {r.nombre_comercial}<br/>
                                        <small style={{color: '#64748b'}}>{r.a_quien_visito}</small>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ ...badgeStyle, background: r.kpi.includes('COBRANZA') ? '#fff1f2' : '#dbeafe', color: r.kpi.includes('COBRANZA') ? '#be123c' : '#1e40af' }}>
                                            {r.kpi}
                                        </span>
                                    </td>
                                    <td style={{...tdStyle, fontWeight: 'bold', color: '#1e40af'}}>${parseFloat(r.us_venta || 0).toFixed(2)}</td>
                                    <td style={{...tdStyle, fontWeight: 'bold', color: '#15803d'}}>${parseFloat(r.us_cobro || 0).toFixed(2)}</td>
                                    <td style={tdStyle}>{r.fecha_prox_visita || 'N/A'}</td>
                                    <td style={{...tdStyle, color: '#dc2626', fontSize: '11px', maxWidth: '200px'}}>{r.pendientes || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// COMPONENTES DE APOYO
const KPICard = ({ title, value, sub, color }) => (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', borderLeft: `6px solid ${color}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{title}</p>
        <h2 style={{ margin: '8px 0', fontSize: '24px', color: '#1e293b', fontWeight: '800' }}>{value}</h2>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{sub}</span>
    </div>
);

// ESTILOS (IDEM ANTERIOR CON AJUSTES)
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', background: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const filterGroupStyle = { display: 'flex', gap: '20px' };
const filterItem = { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: '#475569', fontWeight: 'bold' };
const inputStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' };
const kpiGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' };
const mainGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' };
const chartCard = { background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' };
const chartTitle = { fontSize: '15px', color: '#334155', marginBottom: '20px', fontWeight: '700' };
const tableCard = { background: '#fff', padding: '25px', borderRadius: '20px', marginTop: '35px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '12px', textAlign: 'left', color: '#475569', fontSize: '11px', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', color: '#1e293b', fontSize: '12px' };
const badgeStyle = { padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' };

export default AdminDashboard;