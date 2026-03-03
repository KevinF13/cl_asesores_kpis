import React, { useState } from 'react';
import './FormularioKpi.css';

const FormularioKpi = () => {
    const [loading, setLoading] = useState(false);
    // Asegúrate de que usas estos nombres exactos en el estado inicial:
    const [formData, setFormData] = useState({
        kpi: 'VISITAS DIARIAS',
        razon_social: '',
        nombre_comercial: '',
        a_quien_visito: '',
        area: '',
        telefono: '',
        desarrollo_visita: '',
        pendientes: '',
        us_venta: 0,   // Importante: que sea número
        us_cobro: 0,    // Importante: que sea número
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

        // Formatear datos para la BD
        const dataToSend = {
            ...formData,
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
                alert("✅ Registro guardado exitosamente");
                // Resetear campos manteniendo fecha/hora
                setFormData(prev => ({
                    ...prev,
                    razon_social: '',
                    nombre_comercial: '',
                    a_quien_visito: '',
                    telefono: '',
                    desarrollo_visita: '',
                    pendientes: '',
                    us_venta: '',
                    us_cobro: '',
                    fecha_prox_visita: ''
                }));
            } else {
                alert("❌ Error al guardar. Verifique su sesión.");
            }
        } catch (error) {
            alert("Hubo un fallo en la conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <header className="form-header">
                <h2>FORMATO VISITAS DIARIAS</h2>
                <p>Registro de gestión comercial y cobranzas</p>
            </header>

            <form className="kpi-grid" onSubmit={handleSubmit}>
                {/* Metadatos */}
                <div className="field-group">
                    <label>Fecha</label>
                    <input type="date" value={formData.fecha_ingreso} readOnly className="readonly-field" />
                </div>
                <div className="field-group">
                    <label>Hora</label>
                    <input type="time" name="hora_ingreso" value={formData.hora_ingreso} onChange={handleChange} />
                </div>
                <div className="field-group">
                    <label>Tipo de Gestión (KPI)</label>
                    <select name="kpi" value={formData.kpi} onChange={handleChange}>
                        <option value="VISITAS DIARIAS">VISITAS DIARIAS</option>
                        <option value="LLAMADAS COBRANZA">LLAMADAS COBRANZA</option>
                        <option value="LLAMADAS CLIENTES">LLAMADAS CLIENTES</option>
                        <option value="ALIMENTACION">ALIMENTACION</option>
                    </select>
                </div>

                <div className="section-title">Información del Cliente</div>
                
                <div className="field-group">
                    <label>Razón Social</label>
                    <input type="text" name="razon_social" value={formData.razon_social} onChange={handleChange} required placeholder="Nombre Legal" />
                </div>
                <div className="field-group">
                    <label>Nombre Comercial</label>
                    <input type="text" name="nombre_comercial" value={formData.nombre_comercial} onChange={handleChange} placeholder="Ej: Almacén Gladys" />
                </div>
                <div className="field-group">
                    <label>A quién visitó</label>
                    <input type="text" name="a_quien_visito" value={formData.a_quien_visito} onChange={handleChange} placeholder="Nombre del contacto" />
                </div>
                <div className="field-group">
                    <label>Área / Cargo</label>
                    <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Ej: Dueño, Dependiente" />
                </div>
                <div className="field-group">
                    <label>Teléfono</label>
                    <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
                </div>

                <div className="section-title">Detalles de la Gestión</div>

                <div className="field-group full-width">
                    <label>Desarrollo de la Visita</label>
                    <textarea name="desarrollo_visita" rows="3" value={formData.desarrollo_visita} onChange={handleChange} placeholder="¿Qué sucedió en la visita?"></textarea>
                </div>
                <div className="field-group full-width">
                    <label>Pendientes</label>
                    <textarea name="pendientes" rows="2" value={formData.pendientes} onChange={handleChange} placeholder="Compromisos adquiridos..."></textarea>
                </div>

                <div className="section-title">Valores y Próxima Cita</div>

                <div className="field-group">
                    <label>US Venta ($)</label>
                    <input type="number" step="0.01" name="us_venta" value={formData.us_venta} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="field-group">
                    <label>US Cobro ($)</label>
                    <input type="number" step="0.01" name="us_cobro" value={formData.us_cobro} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="field-group">
                    <label>Fecha Próxima Visita</label>
                    <input type="date" name="fecha_prox_visita" value={formData.fecha_prox_visita} onChange={handleChange} />
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Guardando en Base de Datos...' : 'Enviar Reporte Diario'}
                </button>
            </form>
        </div>
    );
};

export default FormularioKpi;