import React, { useState } from 'react';
import './FormularioKpi.css';

const FormularioKpi = () => {
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        kpi: 'VISITAS DIARIAS',
        razon_social: '',
        nombre_comercial: '',
        a_quien_visito: '',
        telefono: '',
        area: '',
        desarrollo_visita: '',
        pendientes: '',
        clientes_nuevos: 0,
        prospectos_new: 0,
        num_clientes_visitados: 0,
        llamadas_clientes: 0,
        llamadas_cobranzas: 0,
        viajes: 0,
        alimentacion: 0,
        us_venta: 0,
        us_cobro: 0,
        fecha_ingreso: new Date().toISOString().split('T')[0],
        hora_ingreso: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        fecha_prox_visita: '' 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        // Aseguramos que los valores numéricos se envíen correctamente
        const dataToSend = {
            ...formData,
            clientes_nuevos: parseInt(formData.clientes_nuevos) || 0,
            prospectos_new: parseInt(formData.prospectos_new) || 0,
            num_clientes_visitados: parseInt(formData.num_clientes_visitados) || 0,
            llamadas_clientes: parseInt(formData.llamadas_clientes) || 0,
            llamadas_cobranzas: parseInt(formData.llamadas_cobranzas) || 0,
            viajes: parseFloat(formData.viajes) || 0,
            alimentacion: parseFloat(formData.alimentacion) || 0,
            us_venta: parseFloat(formData.us_venta) || 0,
            us_cobro: parseFloat(formData.us_cobro) || 0
        };

        try {
            const response = await fetch('http://localhost:8000/api/guardar-kpi', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                alert(`✅ ${formData.kpi} registrado con éxito`);
                // Limpieza de campos post-envío
                setFormData(prev => ({
                    ...prev,
                    razon_social: '', nombre_comercial: '', a_quien_visito: '',
                    telefono: '', area: '', desarrollo_visita: '', pendientes: '',
                    us_venta: 0, us_cobro: 0, clientes_nuevos: 0, prospectos_new: 0,
                    num_clientes_visitados: 0, llamadas_clientes: 0, llamadas_cobranzas: 0,
                    viajes: 0, alimentacion: 0, fecha_prox_visita: ''
                }));
            } else {
                alert("❌ Error al guardar. Revise su sesión.");
            }
        } catch (error) {
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <header className="form-header">
                <h2>GESTIÓN DE INDICADORES - CASA LINDA</h2>
                <p>Registro oficial de actividades diarias</p>
            </header>

            <form className="kpi-grid" onSubmit={handleSubmit}>
                <div className="field-group full-width">
                    <label className="main-label">¿Qué actividad desea registrar?</label>
                    <select name="kpi" value={formData.kpi} onChange={handleChange} className="kpi-main-selector">
                        <option value="VISITAS DIARIAS">📍 VISITAS DIARIAS</option>
                        <option value="CLIENTES NUEVOS">🆕 CLIENTES NUEVOS</option>
                        <option value="PROSPECTOS NUEVOS">🎯 PROSPECTOS NUEVOS</option>
                        <option value="NUMERO DE CLIENTES VISITADOS">👥 NÚMERO DE CLIENTES VISITADOS</option>
                        <option value="LLAMADAS TELEFONICAS CLIENTES">📞 LLAMADAS TELEFÓNICAS CLIENTES</option>
                        <option value="LLAMADAS COBRANZAS">💰 LLAMADAS COBRANZAS</option>
                        <option value="VIAJES">🚗 VIAJES / MOVILIDAD</option>
                        <option value="ALIMENTACION">🍽️ ALIMENTACIÓN</option>
                    </select>
                </div>

                <div className="section-title">Información General</div>

                {/* Campos de Cliente: Se ocultan en gastos de Viaje/Alimentación */}
                {!['VIAJES', 'ALIMENTACION'].includes(formData.kpi) && (
                    <>
                        <div className="field-group">
                            <label>Razón Social</label>
                            <input type="text" name="razon_social" value={formData.razon_social} onChange={handleChange} required />
                        </div>
                        <div className="field-group">
                            <label>Nombre Comercial</label>
                            <input type="text" name="nombre_comercial" value={formData.nombre_comercial} onChange={handleChange} />
                        </div>
                        <div className="field-group">
                            <label>A quién visitó</label>
                            <input type="text" name="a_quien_visito" value={formData.a_quien_visito} onChange={handleChange} />
                        </div>
                        <div className="field-group">
                            <label>Área</label>
                            <input type="text" name="area" value={formData.area} onChange={handleChange} />
                        </div>
                        <div className="field-group">
                            <label>Teléfono de Contacto</label>
                            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
                        </div>
                    </>
                )}

                {/* Registro de Tiempo - Siempre visible */}
                <div className="field-group">
                    <label>Hora de Gestión</label>
                    <input type="time" name="hora_ingreso" value={formData.hora_ingreso} onChange={handleChange} />
                </div>

                {/* --- SECCIÓN DINÁMICA DE KPIs --- */}
                <div className="section-title">Métricas del KPI</div>

                {formData.kpi === 'VISITAS DIARIAS' && (
                    <div className="field-group">
                        <label>Venta Realizada ($)</label>
                        <input type="number" name="us_venta" value={formData.us_venta} onChange={handleChange} step="0.01" />
                    </div>
                )}

                {formData.kpi === 'CLIENTES NUEVOS' && (
                    <div className="field-group">
                        <label>Cantidad de Cierres</label>
                        <input type="number" name="clientes_nuevos" value={formData.clientes_nuevos} onChange={handleChange} />
                    </div>
                )}

                {formData.kpi === 'PROSPECTOS NUEVOS' && (
                    <div className="field-group">
                        <label>Cantidad de Prospectos</label>
                        <input type="number" name="prospectos_new" value={formData.prospectos_new} onChange={handleChange} />
                    </div>
                )}

                {formData.kpi === 'NUMERO DE CLIENTES VISITADOS' && (
                    <div className="field-group">
                        <label>Total Clientes Visitados</label>
                        <input type="number" name="num_clientes_visitados" value={formData.num_clientes_visitados} onChange={handleChange} />
                    </div>
                )}

                {formData.kpi === 'LLAMADAS TELEFONICAS CLIENTES' && (
                    <div className="field-group">
                        <label>Cantidad de Llamadas</label>
                        <input type="number" name="llamadas_clientes" value={formData.llamadas_clientes} onChange={handleChange} />
                    </div>
                )}

                {formData.kpi === 'LLAMADAS COBRANZAS' && (
                    <>
                        <div className="field-group">
                            <label>Monto Cobrado ($)</label>
                            <input type="number" name="us_cobro" value={formData.us_cobro} onChange={handleChange} step="0.01" />
                        </div>
                        <div className="field-group">
                            <label>N° de Gestiones Realizadas</label>
                            <input type="number" name="llamadas_cobranzas" value={formData.llamadas_cobranzas} onChange={handleChange} />
                        </div>
                    </>
                )}

                {formData.kpi === 'VIAJES' && (
                    <div className="field-group">
                        <label>Gasto en Movilidad ($)</label>
                        <input type="number" name="viajes" value={formData.viajes} onChange={handleChange} step="0.01" />
                    </div>
                )}

                {formData.kpi === 'ALIMENTACION' && (
                    <div className="field-group">
                        <label>Gasto en Alimentación ($)</label>
                        <input type="number" name="alimentacion" value={formData.alimentacion} onChange={handleChange} step="0.01" />
                    </div>
                )}

                {/* --- SECCIÓN DE CIERRE Y SEGUIMIENTO --- */}
                {!['VIAJES', 'ALIMENTACION'].includes(formData.kpi) && (
                    <>
                        <div className="section-title">Seguimiento y Compromisos</div>
                        <div className="field-group full-width">
                            <label>Desarrollo de la Gestión</label>
                            <textarea name="desarrollo_visita" value={formData.desarrollo_visita} onChange={handleChange} rows="3" placeholder="¿Qué se habló con el cliente?"></textarea>
                        </div>
                        <div className="field-group full-width">
                            <label>Pendientes / Tareas a realizar</label>
                            <textarea name="pendientes" value={formData.pendientes} onChange={handleChange} rows="2" placeholder="Compromisos para la siguiente visita..."></textarea>
                        </div>
                        <div className="field-group">
                            <label>Fecha Próxima Visita</label>
                            <input type="date" name="fecha_prox_visita" value={formData.fecha_prox_visita} onChange={handleChange} />
                        </div>
                    </>
                )}

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Guardando en Servidor...' : `Confirmar Registro: ${formData.kpi}`}
                </button>
            </form>
        </div>
    );
};

export default FormularioKpi;