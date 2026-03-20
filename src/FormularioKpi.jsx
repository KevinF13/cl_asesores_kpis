import React, { useState, useEffect } from 'react';
import './FormularioKpi.css';

const FormularioKpi = () => {
    const [loading, setLoading] = useState(false);

    // Responsividad dinámica
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

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
        hora_ingreso: new Date().toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        fecha_prox_visita: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const requiereCamposGestion = !['VIAJES', 'ALIMENTACION'].includes(formData.kpi);

    const validarFormulario = () => {
        if (requiereCamposGestion) {
            if (!formData.razon_social.trim()) {
                alert('❌ La Razón Social es obligatoria');
                return false;
            }

            if (!formData.a_quien_visito.trim()) {
                alert('❌ El campo "A quién visitó" es obligatorio');
                return false;
            }

            if (!formData.desarrollo_visita.trim()) {
                alert('❌ El campo "Desarrollo de la Gestión" es obligatorio');
                return false;
            }
        }

        const telefonoLimpio = formData.telefono.replace(/\s/g, '');

        if (telefonoLimpio && telefonoLimpio.length !== 10) {
            alert('❌ El teléfono debe tener 10 dígitos');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setLoading(true);
        const token = localStorage.getItem('token');

        const dataToSend = {
            ...formData,
            razon_social: formData.razon_social.trim(),
            nombre_comercial: formData.nombre_comercial.trim(),
            a_quien_visito: formData.a_quien_visito.trim(),
            telefono: formData.telefono.replace(/\s/g, ''),
            area: formData.area.trim(),
            desarrollo_visita: formData.desarrollo_visita.trim(),
            pendientes: formData.pendientes.trim(),
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/guardar-kpi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok) {
                alert(`✅ ${formData.kpi} registrado con éxito`);

                setFormData((prev) => ({
                    ...prev,
                    razon_social: '',
                    nombre_comercial: '',
                    a_quien_visito: '',
                    telefono: '',
                    area: '',
                    desarrollo_visita: '',
                    pendientes: '',
                    us_venta: 0,
                    us_cobro: 0,
                    clientes_nuevos: 0,
                    prospectos_new: 0,
                    num_clientes_visitados: 0,
                    llamadas_clientes: 0,
                    llamadas_cobranzas: 0,
                    viajes: 0,
                    alimentacion: 0,
                    fecha_prox_visita: '',
                    hora_ingreso: new Date().toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    fecha_ingreso: new Date().toISOString().split('T')[0]
                }));
            } else {
                alert(`❌ ${result.detail || 'Error al guardar. Revise su sesión o los datos ingresados.'}`);
            }
        } catch (error) {
            alert('❌ Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const responsiveGridStyle = {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '15px',
        padding: isMobile ? '10px' : '20px'
    };

    const fullWidthStyle = {
        gridColumn: isMobile ? 'span 1' : 'span 2'
    };

    return (
        <div
            className="form-container"
            style={{
                maxWidth: '900px',
                margin: 'auto',
                padding: isMobile ? '10px' : '20px'
            }}
        >
            <header
                className="form-header"
                style={{
                    textAlign: 'center',
                    marginBottom: '20px'
                }}
            >
                <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.8rem' }}>
                    GESTIÓN DE INDICADORES - CASA LINDA
                </h2>
                <p>Registro oficial de actividades diarias</p>
            </header>

            <form onSubmit={handleSubmit} style={responsiveGridStyle}>
                <div className="field-group" style={fullWidthStyle}>
                    <label className="main-label">¿Qué actividad desea registrar?</label>
                    <select
                        name="kpi"
                        value={formData.kpi}
                        onChange={handleChange}
                        className="kpi-main-selector"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                    >
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

                <div className="section-title" style={fullWidthStyle}>
                    Información General
                </div>

                {requiereCamposGestion && (
                    <>
                        <div className="field-group">
                            <label>Razón Social *</label>
                            <input
                                type="text"
                                name="razon_social"
                                value={formData.razon_social}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="field-group">
                            <label>Nombre Comercial</label>
                            <input
                                type="text"
                                name="nombre_comercial"
                                value={formData.nombre_comercial}
                                onChange={handleChange}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="field-group">
                            <label>A quién visitó *</label>
                            <input
                                type="text"
                                name="a_quien_visito"
                                value={formData.a_quien_visito}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="field-group">
                            <label>Área</label>
                            <input
                                type="text"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="field-group">
                            <label>Teléfono de Contacto</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, '');

                                    if (value.length > 10) return;

                                    if (value.length > 2 && value.length <= 6) {
                                        value = `${value.slice(0, 2)} ${value.slice(2)}`;
                                    } else if (value.length > 6) {
                                        value = `${value.slice(0, 2)} ${value.slice(2, 6)} ${value.slice(6)}`;
                                    }

                                    setFormData((prev) => ({
                                        ...prev,
                                        telefono: value
                                    }));
                                }}
                                placeholder="Ej: 09 1234 5678"
                                inputMode="numeric"
                                maxLength={13}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    </>
                )}

                <div className="field-group">
                    <label>Hora de Gestión</label>
                    <input
                        type="time"
                        name="hora_ingreso"
                        value={formData.hora_ingreso}
                        onChange={handleChange}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                </div>

                <div className="section-title" style={fullWidthStyle}>
                    Métricas del KPI
                </div>

                {formData.kpi === 'VISITAS DIARIAS' && (
                    <>
                        <div className="field-group">
                            <label>Venta Realizada ($)</label>
                            <input
                                type="number"
                                name="us_venta"
                                value={formData.us_venta}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="field-group">
                            <label>Monto Cobrado ($)</label>
                            <input
                                type="number"
                                name="us_cobro"
                                value={formData.us_cobro}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    </>
                )}

                {formData.kpi === 'CLIENTES NUEVOS' && (
                    <div className="field-group">
                        <label>Cantidad de Cierres</label>
                        <input
                            type="number"
                            name="clientes_nuevos"
                            value={formData.clientes_nuevos}
                            onChange={handleChange}
                            min="0"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                )}

                {formData.kpi === 'PROSPECTOS NUEVOS' && (
                    <div className="field-group">
                        <label>Cantidad de Prospectos</label>
                        <input
                            type="number"
                            name="prospectos_new"
                            value={formData.prospectos_new}
                            onChange={handleChange}
                            min="0"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                )}

                {formData.kpi === 'NUMERO DE CLIENTES VISITADOS' && (
                    <div className="field-group">
                        <label>Total Clientes Visitados</label>
                        <input
                            type="number"
                            name="num_clientes_visitados"
                            value={formData.num_clientes_visitados}
                            onChange={handleChange}
                            min="0"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                )}

                {formData.kpi === 'LLAMADAS TELEFONICAS CLIENTES' && (
                    <div className="field-group">
                        <label>Cantidad de Llamadas</label>
                        <input
                            type="number"
                            name="llamadas_clientes"
                            value={formData.llamadas_clientes}
                            onChange={handleChange}
                            min="0"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                )}

                {formData.kpi === 'LLAMADAS COBRANZAS' && (
                    <>
                        <div className="field-group">
                            <label>Monto Cobrado ($)</label>
                            <input
                                type="number"
                                name="us_cobro"
                                value={formData.us_cobro}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="field-group">
                            <label>N° de Gestiones Realizadas</label>
                            <input
                                type="number"
                                name="llamadas_cobranzas"
                                value={formData.llamadas_cobranzas}
                                onChange={handleChange}
                                min="0"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    </>
                )}

                {formData.kpi === 'VIAJES' && (
                    <div className="field-group">
                        <label>Gasto en Movilidad ($)</label>
                        <input
                            type="number"
                            name="viajes"
                            value={formData.viajes}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                )}

                {formData.kpi === 'ALIMENTACION' && (
                    <div className="field-group">
                        <label>Gasto en Alimentación ($)</label>
                        <input
                            type="number"
                            name="alimentacion"
                            value={formData.alimentacion}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                )}

                {requiereCamposGestion && (
                    <>
                        <div className="section-title" style={fullWidthStyle}>
                            Seguimiento y Compromisos
                        </div>

                        <div className="field-group" style={fullWidthStyle}>
                            <label>Desarrollo de la Gestión *</label>
                            <textarea
                                name="desarrollo_visita"
                                value={formData.desarrollo_visita}
                                onChange={handleChange}
                                rows="3"
                                required
                                placeholder="¿Qué se habló con el cliente?"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="field-group" style={fullWidthStyle}>
                            <label>Pendientes / Tareas a realizar</label>
                            <textarea
                                name="pendientes"
                                value={formData.pendientes}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Compromisos para la siguiente visita..."
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="field-group">
                            <label>Fecha Próxima Visita</label>
                            <input
                                type="date"
                                name="fecha_prox_visita"
                                value={formData.fecha_prox_visita}
                                onChange={handleChange}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    </>
                )}

                <div style={fullWidthStyle}>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '15px', marginTop: '20px' }}
                    >
                        {loading ? 'Guardando en Servidor...' : `Confirmar Registro: ${formData.kpi}`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioKpi;