import { useEffect, useRef } from 'react';

/**
 * Hook para interceptar la lectura de un escáner de código de barras (pistola láser).
 * La pistola funciona emulando pulsaciones de teclado ultrarrápidas seguidas de la tecla Enter.
 * 
 * @param {Function} onScan - Callback ejecutado cuando se detecta un código completo. Recibe el código (string).
 * @param {Object} options - Opciones de configuración.
 * @param {number} options.delayThreshold - Tiempo máximo (ms) permitido entre pulsaciones para considerarlo máquina (default: 50).
 * @param {number} options.minLength - Longitud mínima del código para considerarse válido (default: 3).
 * @param {boolean} options.preventDefault - Evita que el `Enter` o el tipeo afecten elementos activos (default: false).
 */
export default function useBarcodeScanner(onScan, options = {}) {
    const { delayThreshold = 50, minLength = 3, preventDefault = false } = options;

    const buffer = useRef('');
    const lastKeyTime = useRef(Date.now());
    const timeoutControl = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignorar eventos cuando el usuario está explícitamente dentro de un textarea o input "normal"
            // (a menos que quieras capturarlo en todos lados, pero suele interferir si tipean a mano).
            // NOTA: Para un POS puro, a veces queremos ignorar los inputs, otras veces no.
            // Aquí ignoramos solo si están tecleando lentamente.

            const currentTime = Date.now();
            const elapsedTime = currentTime - lastKeyTime.current;

            // Si el tiempo entre teclas supera el de una máquina (ej. 50ms), reiniciamos el búfer
            // porque probablemente es un humano tipeando en el teclado.
            if (elapsedTime > delayThreshold) {
                buffer.current = '';
            }

            // Si presionó Enter, revisar si hay un código válido capturado
            if (e.key === 'Enter') {
                if (buffer.current.length >= minLength) {
                    if (preventDefault) e.preventDefault(); // Prevenir submit de formularios accidental

                    const code = buffer.current;
                    buffer.current = ''; // Limpiar tras capturar exitosamente

                    // Ejecutar el callback pasándole el código
                    onScan(code);
                }
                return;
            }

            // Si es un caracter imprimible (letra, número, guiones)
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                buffer.current += e.key;
            }

            lastKeyTime.current = currentTime;

            // Limpiar si se queda a medias
            clearTimeout(timeoutControl.current);
            timeoutControl.current = setTimeout(() => {
                buffer.current = '';
            }, delayThreshold + 10);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timeoutControl.current);
        };
    }, [onScan, delayThreshold, minLength, preventDefault]);
}
