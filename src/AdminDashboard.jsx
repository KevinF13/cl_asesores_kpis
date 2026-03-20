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

    // --- AGREGADO PARA RESPONSIVIDAD ---
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    // -----------------------------------

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/kpis`, {
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

    const rangoFechasTexto = useMemo(() => {
        if (datosFiltrados.length === 0) return "Sin datos";
        const fechas = datosFiltrados.map(r => r.fecha_ingreso).sort();
        return `${fechas[0]} al ${fechas[fechas.length - 1]}`;
    }, [datosFiltrados]);

    const limpiarFiltros = () => {
        setFiltroAsesor('todos');
        setFiltroKpi('todos');
        setBusquedaCliente('');
        setBusquedaObservacion('');
        setFechaInicio('');
        setFechaFin('');
    };

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
                temp[key] = { name: key, ventas: 0, cobros: 0, cierres: 0, prospectos: 0, llamadas: 0, viaticos: 0, visitados: 0 };
            }
            temp[key].ventas += parseFloat(r.us_venta || 0);
            temp[key].cobros += parseFloat(r.us_cobro || 0);
            temp[key].cierres += parseInt(r.clientes_nuevos || 0);
            temp[key].prospectos += parseInt(r.prospectos_new || 0);
            temp[key].visitados += parseInt(r.num_clientes_visitados || 0);
            temp[key].llamadas += (parseInt(r.llamadas_clientes || 0) + parseInt(r.llamadas_cobranzas || 0));
            temp[key].viaticos += (parseFloat(r.viajes || 0) + parseFloat(r.alimentacion || 0));
        });
        return Object.values(temp);
    }, [datosFiltrados]);

    const totalesGlobales = useMemo(() => {
        const v = dataKpiAsesores.reduce((a, b) => a + b.ventas, 0);
        const c = dataKpiAsesores.reduce((a, b) => a + b.cierres, 0);
        const vis = dataKpiAsesores.reduce((a, b) => a + b.visitados, 0);
        return {
            ventaTotal: v,
            cobroTotal: dataKpiAsesores.reduce((a, b) => a + b.cobros, 0),
            cierresNuevos: c,
            visitasTotales: vis,
            gastoTotal: dataKpiAsesores.reduce((a, b) => a + b.viaticos, 0),
            llamadasTotales: dataKpiAsesores.reduce((a, b) => a + b.llamadas, 0),
            eficaciaCierre: vis > 0 ? ((c / vis) * 100).toFixed(1) : 0,
            ticketPromedio: c > 0 ? (v / c).toFixed(2) : 0
        };
    }, [dataKpiAsesores]);

    const listaNombresAsesores = useMemo(() => [...new Set(registros.map(r => r.asesor_nombre))], [registros]);
    const listaKpis = useMemo(() => [...new Set(registros.map(r => r.kpi))], [registros]);
    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return (
        <div style={{ padding: isMobile ? '10px' : '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            
            <div style={{...headerStyle, padding: isMobile ? '15px' : '25px'}}>
                <div style={{ marginBottom: '20px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '15px' }}>
                    <div>
                        <h1 style={{ color: '#0f172a', margin: 0, fontSize: isMobile ? '20px' : '26px' }}>Dashboard Estratégico Casa Linda</h1>
                        <p style={{ color: '#64748b', margin: '5px 0' }}>Control Integral de Gestión y KPIs</p>
                        <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '4px 10px', borderRadius: '15px', fontWeight: 'bold' }}>
                            📅 Periodo: {rangoFechasTexto}
                        </span>
                    </div>
                    <button onClick={descargarCSV} style={{ ...downloadBtnStyle, width: isMobile ? '100%' : 'auto' }}>📥 Exportar Selección a CSV</button>
                </div>
                
                <div style={{ ...filterGridStyle, gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))') }}>
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
                        <label>Fechas Filtro</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={{ ...inputStyle, padding: '8px 4px' }} />
                            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={{ ...inputStyle, padding: '8px 4px' }} />
                        </div>
                    </div>
                    <div style={{ ...filterItem, justifyContent: 'flex-end' }}>
                        <button onClick={limpiarFiltros} style={{ ...clearBtnStyle, width: '100%' }}>Limpiar Filtros</button>
                    </div>
                </div>
            </div>

            {/* SECCIÓN ACTUALIZADA: 2 COLUMNAS EN MÓVIL */}
            <div style={{ 
                ...kpiGrid, 
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))'),
                gap: isMobile ? '10px' : '15px' 
            }}>
                <KPICard title="Venta Total" value={`$${totalesGlobales.ventaTotal.toLocaleString()}`} color="#2563eb" isMobile={isMobile} />
                <KPICard title="Cobro Total" value={`$${totalesGlobales.cobroTotal.toLocaleString()}`} color="#10b981" isMobile={isMobile} />
                <KPICard title="Cierres Nuevos" value={totalesGlobales.cierresNuevos} color="#8b5cf6" isMobile={isMobile} />
                <KPICard title="Eficacia Cierre" value={`${totalesGlobales.eficaciaCierre}%`} color="#f59e0b" subtitle="Cierres vs Visitas" isMobile={isMobile} />
                <KPICard title="Ticket Promedio" value={`$${totalesGlobales.ticketPromedio}`} color="#ec4899" subtitle="Venta / Cierres" isMobile={isMobile} />
                <KPICard title="Cobertura (Visitas)" value={totalesGlobales.visitasTotales} color="#06b6d4" isMobile={isMobile} />
                <KPICard title="Total Llamadas" value={totalesGlobales.llamadasTotales} color="#64748b" isMobile={isMobile} />
                <KPICard title="Gasto Operativo" value={`$${totalesGlobales.gastoTotal.toLocaleString()}`} color="#ef4444" isMobile={isMobile} />
            </div>

            <div style={{ ...mainGrid, gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))') }}>
                <div style={chartCard}>
                    <h3 style={chartTitle}>Visitas vs Cierres por Asesor</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dataKpiAsesores}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} /> <YAxis fontSize={12} /> <Tooltip /> <Legend />
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
                            <XAxis dataKey="name" fontSize={12} /> <YAxis fontSize={12} /> <Tooltip /> <Legend />
                            <Bar dataKey="cierres" fill="#8b5cf6" name="Cierres" />
                            <Line type="monotone" dataKey="prospectos" stroke="#f59e0b" strokeWidth={3} name="Prospectos" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div style={chartCard}>
                    <h3 style={chartTitle}>Gestión Telefónica por Asesor</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={dataKpiAsesores}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} /> <YAxis fontSize={12} /> <Tooltip />
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
                                cx="50%" cy="50%" outerRadius={isMobile ? 60 : 80} dataKey="value" label={!isMobile}
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
                <h3 style={{ margin: '0 0 20px 0' }}>Registro Maestro Detallado ({datosFiltrados.length})</h3>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
                                    <td style={{...tdStyle, minWidth: '200px', maxWidth: '300px'}}>
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

// Estilos base y Componente KPICard con soporte para móvil
const badgeStyle = { background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', color: '#475569', display: 'inline-block' };

const KPICard = ({ title, value, color, subtitle, isMobile }) => (
    <div style={{ 
        background: '#fff', 
        padding: isMobile ? '12px 15px' : '15px 20px', 
        borderRadius: '12px', 
        borderLeft: `5px solid ${color}`, 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
        height: '100%', 
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: isMobile ? '9px' : '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{title}</p>
        <h2 style={{ margin: '5px 0', fontSize: isMobile ? '16px' : '20px', fontWeight: '800', color: '#1e293b' }}>{value}</h2>
        {subtitle && !isMobile && <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>{subtitle}</p>}
    </div>
);

const filterGridStyle = { display: 'grid', gap: '15px' };
const filterItem = { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 'bold', color: '#475569' };
const inputStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '13px', width: '100%', boxSizing: 'border-box' };
const clearBtnStyle = { padding: '8px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
const headerStyle = { display: 'flex', flexDirection: 'column', marginBottom: '25px', background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const kpiGrid = { display: 'grid', marginBottom: '25px' };
const mainGrid = { display: 'grid', gap: '25px' };
const chartCard = { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minWidth: 0 };
const chartTitle = { fontSize: '15px', marginBottom: '15px', color: '#1e293b', fontWeight: 'bold' };
const tableCard = { background: '#fff', padding: '25px', borderRadius: '15px', marginTop: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' };
const thStyle = { padding: '12px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', borderBottom: '2px solid #f1f5f9' };
const tdStyle = { padding: '15px 12px', fontSize: '12px', verticalAlign: 'top' };
const downloadBtnStyle = { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' };

export default AdminDashboard;