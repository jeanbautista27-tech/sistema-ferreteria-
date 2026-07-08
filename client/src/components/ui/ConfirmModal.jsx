import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = '¿Confirmar acción?', message = '¿Estás seguro de que deseas realizar esta acción?', confirmText = 'Confirmar', type = 'danger' }) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
                    <div className={`confirm-icon ${type}`}>
                        {type === 'danger' ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
                    </div>
                    <div className="confirm-title">{title}</div>
                    <div className="confirm-message">{message}</div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        <X size={15} />Cancelar
                    </button>
                    <button className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>
                        {type === 'danger' ? <Trash2 size={15} /> : <AlertTriangle size={15} />}{confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
