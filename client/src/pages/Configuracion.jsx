import { useState, useEffect, useRef } from 'react';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Configuracion() {
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const fileRef = useRef();

    const load = async () => {
        const r = await api.get('/configuracion');
        setConfig(r.data.configuracion || {});
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const handleChange = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(config).forEach(([k, v]) => fd.append(k, v || ''));
            if (logoFile) fd.append('logo', logoFile);
            await api.put('/configuracion', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Configuración guardada');
        } catch { toast.error('Error al guardar'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    const fields = [
        { key: 'empresa_nombre', label: 'Nombre de la Empresa', type: 'text' },
        { key: 'empresa_ruc', label: 'RUC', type: 'text' },
        { key: 'empresa_direccion', label: 'Dirección', type: 'text' },
        { key: 'empresa_telefono', label: 'Teléfono', type: 'text' },
        { key: 'empresa_email', label: 'Email Empresa', type: 'email' },
        { key: 'igv_porcentaje', label: 'Porcentaje IGV (%)', type: 'number' },
        { key: 'moneda_simbolo', label: 'Símbolo Moneda', type: 'text' },
        { key: 'moneda_nombre', label: 'Nombre Moneda', type: 'text' },
        { key: 'serie_boleta', label: 'Serie Boleta', type: 'text' },
        { key: 'serie_factura', label: 'Serie Factura', type: 'text' },
    ];

    return (
        <div>
            <div className="page-title"><Settings size={22} />Configuración</div>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Datos de la Empresa</div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />Guardando...</> : <><Save size={14} />Guardar Cambios</>}
                    </button>
                </div>
                <div className="form-row">
                    {fields.slice(0, 6).map(f => (
                        <div key={f.key} className="form-group">
                            <label>{f.label}</label>
                            <input type={f.type} className="form-control" value={config[f.key] || ''} onChange={e => handleChange(f.key, e.target.value)} />
                        </div>
                    ))}
                </div>
                <div className="form-row">
                    {fields.slice(6).map(f => (
                        <div key={f.key} className="form-group">
                            <label>{f.label}</label>
                            <input type={f.type} className="form-control" value={config[f.key] || ''} onChange={e => handleChange(f.key, e.target.value)} />
                        </div>
                    ))}
                </div>
                <div className="form-group">
                    <label>Logo Empresa</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {config.empresa_logo && <img src={`/uploads/${config.empresa_logo}`} alt="Logo" style={{ height: 60, borderRadius: 8, border: '1px solid var(--border)' }} />}
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setLogoFile(e.target.files[0])} />
                        <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
                            {logoFile ? logoFile.name : 'Cambiar Logo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
