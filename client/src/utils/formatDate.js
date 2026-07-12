/**
 * formatDate.js
 * Utilidad centralizada para formatear fechas desde MySQL/Railway.
 *
 * MySQL devuelve fechas como "2026-07-08 15:30:00" (con espacio, no 'T'),
 * lo que hace que new Date() devuelva "Invalid Date" en algunos navegadores.
 * Esta función normaliza el formato antes de parsear.
 */

/**
 * Formatea una fecha como "DD/MM/YYYY HH:mm"
 * @param {string|Date} value - Valor de fecha
 * @returns {string}
 */
export const formatDateTime = (value) => {
    if (!value) return '—';
    // Maneja tanto "2026-07-08 15:30:00" (MySQL) como "2026-07-08T15:30:00Z" (ISO)
    const d = new Date(String(value).replace(' ', 'T'));
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-PE', {
        day:    '2-digit',
        month:  '2-digit',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit',
    });
};

/**
 * Formatea una fecha como "DD/MM/YYYY"
 * @param {string|Date} value - Valor de fecha
 * @returns {string}
 */
export const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(String(value).replace(' ', 'T'));
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
    });
};

/**
 * Formatea solo la hora como "HH:mm"
 * @param {string|Date} value - Valor de fecha
 * @returns {string}
 */
export const formatTime = (value) => {
    if (!value) return '—';
    const d = new Date(String(value).replace(' ', 'T'));
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};
