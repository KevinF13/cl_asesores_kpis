import React, { useState } from 'react';
import './FormularioKpi.css';

const FormularioKpi = () => {
    const [formData, setFormData] = useState({
        razon_social: '',
        a_quien_visito: '',
        area: 'Ventas',
        visitas_diarias: 0,
        periodicidad: 'Diaria',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        hora_ingreso: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        proxima_visita: '',
        observacion: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Conexión al servidor de FARMACID S.A. 192.168.20.3
        try {
            const response = await fetch('http://localhost:8000/api/guardar-kpi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) alert("🚀 ¡Datos guardados exitosamente!");
        } catch (error) {
            alert("Error de conexión con el servidor");
        }
    };

    return (
        <div className="container">
            <h2 className="title">Registro de Asesores</h2>
            <form className="kpi-form" onSubmit={handleSubmit}>
                
                <div className="form-group">
                    <label>Fecha (Auto)</label>
                    <input type="date" name="fecha_ingreso" value={formData.fecha_ingreso} readOnly className="readonly-field" />
                </div>

                <div className="form-group">
                    <label>Hora de Registro</label>
                    <input type="time" name="hora_ingreso" value={formData.hora_ingreso} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Razón Social / Cliente</label>
                    <input type="text" name="razon_social" placeholder="Nombre de la empresa" onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Área Visitada</label>
                    <select name="area" onChange={handleChange} value={formData.area}>
                        <option value="Ventas">Ventas</option>
                        <option value="Cobranzas">Cobranzas</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sistemas">Sistemas</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Periodicidad</label>
                    <select name="periodicidad" onChange={handleChange} value={formData.periodicidad}>
                        <option value="Diaria">Diaria</option>
                        <option value="Semanal">Semanal</option>
                        <option value="Quincenal">Quincenal</option>
                        <option value="Mensual">Mensual</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Próxima Visita</label>
                    <input type="date" name="proxima_visita" onChange={handleChange} required />
                </div>

                <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea name="observacion" rows="3" onChange={handleChange} placeholder="Detalles importantes de la visita..."></textarea>
                </div>

                <button type="submit" className="submit-btn">Guardar en Base de Datos</button>
            </form>
        </div>
    );
};

export default FormularioKpi;