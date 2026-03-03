import React, { useEffect, useState, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    ComposedChart, AreaChart, Area, Line, PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = () => {
    const [registros, setRegistros] = useState([]);
    const [filtroAsesor, setFiltroAsesor] = useState('todos');
    const [filtroKpi, setFiltroKpi] = useState('todos');
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [busquedaObservacion, setBusquedaObservacion] = useState('');
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

    // 1. Filtrado Dinámico Multicriterio (Añadido: KPI, Cliente y Observación)
    const datosFiltrados = useMemo(() => {
        return registros.filter(r => {
            const cumpleAsesor = filtroAsesor === 'todos' || r.asesor_nombre === filtroAsesor;
            const cumpleKpi = filtroKpi === 'todos' || r.kpi === filtroKpi;
            const cumpleCliente = (r.nombre_comercial || r.razon_social || '').toLowerCase().includes(busquedaCliente.toLowerCase());
            const cumpleObs = (r.desarrollo_visita || '').toLowerCase().includes(busquedaObservacion.toLowerCase());
            const cumpleFecha = (!fechaInicio || r.fecha_ingreso >= fechaInicio) && 
                               (!fechaFin || r.fecha_ingreso <= fechaFin);
            
            return cumpleAsesor && cumpleKpi && cumpleCliente && cumpleObs && cumpleFecha;
        });
    }, [registros, filtroAsesor, filtroKpi, busquedaCliente, busquedaObservacion, fechaInicio, fechaFin]);

    const limpiarFiltros = () => {
        setFiltroAsesor('todos');
        setFiltroKpi('todos');
        setBusquedaCliente('');
        setBusquedaObservacion('');
        setFechaInicio('');
        setFechaFin('');
    };

    // Función de descarga completa con todos los campos
    const descargarCSV = () => {
        if (datosFiltrados.length === 0) return alert("No hay datos para exportar");
        
        const headers = [
            "ID", "Fecha Ingreso", "Hora Ingreso", "Asesor", "KPI", "Razon Social", 
            "Nombre Comercial", "A Quien Visito", "Telefono", "Area", 
            "Venta ($)", "Cobro ($)", "Clientes Nuevos", "Prospectos", 
            "Clientes Visitados", "Llamadas Clientes", "Llamadas Cobranza", 
            "Viajes ($)", "Alimentacion ($)", "Desarrollo Visita", "Pendientes", "Proxima Visita"
        ];

        const rows = datosFiltrados.map(r => [
            r.id, r.fecha_ingreso, r.hora_ingreso, r.asesor_nombre, r.kpi, 
            `"${r.razon_social || ''}"`, `"${r.nombre_comercial || ''}"`, `"${r.a_quien_visito || ''}"`,
            r.telefono || '', r.area || '', r.us_venta, r.us_cobro, 
            r.clientes_nuevos, r.prospectos_new, r.num_clientes_visitados, 
            r.llamadas_clientes, r.llamadas_cobranzas, r.viajes, r.alimentacion, 
            `"${(r.desarrollo_visita || '').replace(/"/g, '""')}"`, 
            `"${(r.pendientes || '').replace(/"/g, '""')}"`, r.fecha_prox_visita || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Completo_CasaLinda_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const dataKpiAsesores = useMemo(() => {
        const temp = {};
        datosFiltrados.forEach(r => {
            const key = r.asesor_nombre;
            if (!temp[key]) {
                temp[key] = { name: key, ventas: 0, cierres: 0, prospectos: 0, llamadas: 0, viaticos: 0, visitados: 0 };
            }
            temp[key].ventas += parseFloat(r.us_venta || 0);
            temp[key].cierres += parseInt(r.clientes_nuevos || 0);
            temp[key].prospectos += parseInt(r.prospectos_new || 0);
            temp[key].visitados += parseInt(r.num_clientes_visitados || 0);
            temp[key].llamadas += (parseInt(r.llamadas_clientes || 0) + parseInt(r.llamadas_cobranzas || 0));
            temp[key].viaticos += (parseFloat(r.viajes || 0) + parseFloat(r.alimentacion || 0));
        });
        return Object.values(temp);
    }, [datosFiltrados]);

    const listaNombresAsesores = useMemo(() => [...new Set(registros.map(r => r.asesor_nombre))], [registros]);
    const listaKpis = useMemo(() => [...new Set(registros.map(r => r.kpi))], [registros]);
    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return (
        <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* PANEL DE CONTROL SUPERIOR CON FILTROS */}
            <div style={headerStyle}>
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ color: '#0f172a', margin: 0, fontSize: '26px' }}>Dashboard Estratégico Casa Linda</h1>
                    <p style={{ color: '#64748b' }}>Control Integral de Gestión y KPIs</p>
                </div>
                
                <div style={filterGridStyle}>
                    <div style={filterItem}>
                        <label>Asesor</label>
                        <select value={filtroAsesor} onChange={(e) => setFiltroAsesor(e.target.value)} style={inputStyle}>
                            <option value="todos">Todos los Asesores</option>
                            {listaNombresAsesores.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div style={filterItem}>
                        <label>KPI</label>
                        <select value={filtroKpi} onChange={(e) => setFiltroKpi(e.target.value)} style={inputStyle}>
                            <option value="todos">Todos los KPIs</option>
                            {listaKpis.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div style={filterItem}>
                        <label>Buscar Cliente</label>
                        <input type="text" placeholder="Nombre..." value={busquedaCliente} onChange={(e) => setBusquedaCliente(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={filterItem}>
                        <label>Observación</label>
                        <input type="text" placeholder="Palabra clave..." value={busquedaObservacion} onChange={(e) => setBusquedaObservacion(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={filterItem}>
                        <label>Fechas</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={inputStyle} />
                            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ ...filterItem, justifyContent: 'flex-end' }}>
                        <button onClick={limpiarFiltros} style={clearBtnStyle}>Limpiar Filtros</button>
                    </div>
                </div>
            </div>

            <div style={kpiGrid}>
                <KPICard title="Venta Total" value={`$${dataKpiAsesores.reduce((a,b)=>a+b.ventas,0).toLocaleString()}`} color="#2563eb" />
                <KPICard title="Cierres Nuevos" value={dataKpiAsesores.reduce((a,b)=>a+b.cierres,0)} color="#10b981" />
                <KPICard title="Cobertura (Visitas)" value={dataKpiAsesores.reduce((a,b)=>a+b.visitados,0)} color="#06b6d4" />
                <KPICard title="Gasto Operativo" value={`$${dataKpiAsesores.reduce((a,b)=>a+b.viaticos,0).toLocaleString()}`} color="#ef4444" />
            </div>

            <div style={mainGrid}>
                <div style={chartCard}>
                    <h3 style={chartTitle}>Visitas vs Cierres</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dataKpiAsesores}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" /> <YAxis /> <Tooltip /> <Legend />
                            <Bar dataKey="visitados" fill="#06b6d4" name="Visitados" />
                            <Bar dataKey="cierres" fill="#10b981" name="Cierres" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={chartCard}>
                    <h3 style={chartTitle}>Desempeño de Prospectos</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={dataKpiAsesores}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" /> <YAxis /> <Tooltip /> <Legend />
                            <Bar dataKey="cierres" fill="#8b5cf6" name="Cierres" />
                            <Line type="monotone" dataKey="prospectos" stroke="#f59e0b" strokeWidth={3} name="Prospectos" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div style={chartCard}>
                    <h3 style={chartTitle}>Gestión Telefónica</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={dataKpiAsesores}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" /> <YAxis /> <Tooltip />
                            <Area type="monotone" dataKey="llamadas" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} name="Llamadas" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={chartCard}>
                    <h3 style={chartTitle}>Distribución de Viáticos ($)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie 
                                data={dataKpiAsesores.map(a => ({ name: a.name, value: a.viaticos }))}
                                cx="50%" cy="50%" outerRadius={80} dataKey="value" label
                            >
                                {dataKpiAsesores.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={tableCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Registro Maestro Detallado ({datosFiltrados.length})</h3>
                    <button onClick={descargarCSV} style={downloadBtnStyle}>
                        📥 Exportar Selección a CSV
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={thStyle}>Fecha/Hora</th>
                                <th style={thStyle}>Asesor</th>
                                <th style={thStyle}>Cliente / Info</th>
                                <th style={thStyle}>Gestión (KPI)</th>
                                <th style={thStyle}>Resultados Financieros</th>
                                <th style={thStyle}>Métricas de Cantidad</th>
                                <th style={thStyle}>Viáticos</th>
                                <th style={thStyle}>Detalle / Pendientes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datosFiltrados.map((r, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>
                                        <div style={{fontWeight:'bold'}}>{r.fecha_ingreso}</div>
                                        <div style={{fontSize:'11px', color:'#64748b'}}>{r.hora_ingreso}</div>
                                    </td>
                                    <td style={tdStyle}><strong>{r.asesor_nombre}</strong></td>
                                    <td style={tdStyle}>
                                        <div style={{fontWeight:'600'}}>{r.nombre_comercial || r.razon_social}</div>
                                        <div style={{fontSize:'11px'}}>{r.a_quien_visito} ({r.area})</div>
                                        <div style={{fontSize:'11px', color:'#2563eb'}}>{r.telefono}</div>
                                    </td>
                                    <td style={tdStyle}><span style={badgeStyle}>{r.kpi}</span></td>
                                    <td style={tdStyle}>
                                        <div style={{color: '#2563eb'}}>Venta: ${r.us_venta}</div>
                                        <div style={{color: '#10b981'}}>Cobro: ${r.us_cobro}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{fontSize:'12px'}}>CN: {r.clientes_nuevos} | P: {r.prospectos_new}</div>
                                        <div style={{fontSize:'12px'}}>Visitados: {r.num_clientes_visitados}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{fontSize:'12px'}}>Vj: ${r.viajes} | Al: ${r.alimentacion}</div>
                                    </td>
                                    <td style={{...tdStyle, maxWidth: '250px'}}>
                                        <div style={{fontSize:'11px', marginBottom:'2px'}}><strong>Obs:</strong> {r.desarrollo_visita}</div>
                                        <div style={{fontSize:'11px', color:'#ef4444'}}><strong>Pend:</strong> {r.pendientes}</div>
                                        {r.fecha_prox_visita && <div style={{fontSize:'10px', color:'#2563eb'}}>Prox: {r.fecha_prox_visita}</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Estilos
const badgeStyle = { background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', color: '#475569' };
const KPICard = ({ title, value, color }) => (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: `5px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{title}</p>
        <h2 style={{ margin: '5px 0', fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{value}</h2>
    </div>
);
const filterGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' };
const filterItem = { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 'bold', color: '#475569' };
const inputStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '13px' };
const clearBtnStyle = { padding: '8px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
const headerStyle = { display: 'flex', flexDirection: 'column', marginBottom: '25px', background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const kpiGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' };
const mainGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' };
const chartCard = { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const chartTitle = { fontSize: '15px', marginBottom: '15px', color: '#1e293b', fontWeight: 'bold' };
const tableCard = { background: '#fff', padding: '25px', borderRadius: '15px', marginTop: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '1100px' };
const thStyle = { padding: '12px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', borderBottom: '2px solid #f1f5f9' };
const tdStyle = { padding: '15px 12px', fontSize: '12px', verticalAlign: 'top' };
const downloadBtnStyle = { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' };

export default AdminDashboard;