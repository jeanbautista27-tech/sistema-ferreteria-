jest.mock('../../src/models', () => ({
    Configuracion: { findAll: jest.fn(), upsert: jest.fn() },
}));

const { getAll, update } = require('../../src/controllers/configuracionController');
const { Configuracion } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('ConfiguracionController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna configuración como objeto clave-valor', async () => {
        Configuracion.findAll.mockResolvedValue([
            { clave: 'empresa_nombre', valor: 'Ferretería XYZ' },
            { clave: 'igv_porcentaje', valor: '18' },
        ]);

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            configuracion: {
                empresa_nombre: 'Ferretería XYZ',
                igv_porcentaje: '18',
            },
        });
    });

    test('200 retorna objeto vacío cuando no hay configuraciones', async () => {
        Configuracion.findAll.mockResolvedValue([]);

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, configuracion: {} });
    });

    test('500 cuando la BD falla', async () => {
        Configuracion.findAll.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false })
        );
    });
});

// ─────────────────────────────────────────────
//  update
// ─────────────────────────────────────────────
describe('ConfiguracionController › update', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 actualiza cada clave-valor con upsert', async () => {
        Configuracion.upsert.mockResolvedValue(true);

        const req = {
            body: { empresa_nombre: 'Nueva Ferretería', igv_porcentaje: '18' },
            file: null,
        };
        const res = mockRes();

        await update(req, res);

        expect(Configuracion.upsert).toHaveBeenCalledTimes(2);
        expect(Configuracion.upsert).toHaveBeenCalledWith({ clave: 'empresa_nombre', valor: 'Nueva Ferretería' });
        expect(Configuracion.upsert).toHaveBeenCalledWith({ clave: 'igv_porcentaje', valor: '18' });
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Configuración actualizada' });
    });

    test('200 actualiza también el logo cuando se sube un archivo', async () => {
        Configuracion.upsert.mockResolvedValue(true);

        const req = {
            body: { empresa_nombre: 'Ferretería Test' },
            file: { filename: 'logo_nuevo.png' },
        };
        const res = mockRes();

        await update(req, res);

        // Debe llamar upsert una vez para empresa_nombre y otra para empresa_logo
        expect(Configuracion.upsert).toHaveBeenCalledWith({ clave: 'empresa_logo', valor: 'logo_nuevo.png' });
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Configuración actualizada' });
    });

    test('200 no actualiza logo si no se sube archivo', async () => {
        Configuracion.upsert.mockResolvedValue(true);

        const req = {
            body: { serie_boleta: 'B001' },
            file: null,
        };
        const res = mockRes();

        await update(req, res);

        const clavesActualizadas = Configuracion.upsert.mock.calls.map(c => c[0].clave);
        expect(clavesActualizadas).not.toContain('empresa_logo');
    });

    test('200 no llama upsert cuando body está vacío y no hay archivo', async () => {
        Configuracion.upsert.mockResolvedValue(true);

        const req = { body: {}, file: null };
        const res = mockRes();

        await update(req, res);

        expect(Configuracion.upsert).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Configuración actualizada' });
    });

    test('500 cuando la BD falla al hacer upsert', async () => {
        Configuracion.upsert.mockRejectedValue(new Error('DB error'));

        const req = { body: { empresa_nombre: 'Test' }, file: null };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al actualizar configuración' })
        );
    });
});
