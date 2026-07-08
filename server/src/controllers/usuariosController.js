const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models');

const getAll = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombre'] }],
            attributes: { exclude: ['password_hash'] },
            order: [['nombre', 'ASC']]
        });
        res.json({ ok: true, usuarios });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const getRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll();
        res.json({ ok: true, roles });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { nombre, email, password, rol_id } = req.body;
        if (!nombre || !email || !password || !rol_id)
            return res.status(400).json({ ok: false, msg: 'Todos los campos son requeridos' });
        const existe = await Usuario.findOne({ where: { email } });
        if (existe) return res.status(400).json({ ok: false, msg: 'El email ya está registrado' });
        const password_hash = await bcrypt.hash(password, 10);
        const usuario = await Usuario.create({ nombre, email, password_hash, rol_id });
        res.status(201).json({ ok: true, msg: 'Usuario creado', usuario: { id: usuario.id, nombre, email } });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al crear usuario', error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        const data = { ...req.body };
        if (data.password) {
            data.password_hash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }
        await usuario.update(data);
        res.json({ ok: true, msg: 'Usuario actualizado' });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar', error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        await usuario.update({ activo: 0 });
        res.json({ ok: true, msg: 'Usuario desactivado' });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al eliminar', error: err.message });
    }
};

module.exports = { getAll, getRoles, create, update, remove };
