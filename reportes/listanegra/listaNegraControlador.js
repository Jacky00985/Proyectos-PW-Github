// modulos/listaNegra/listaNegraControlador.js
// Módulo: Lista Negra — ver la lista (administrador y consultor) y enviar empresas a ella (administrador).
import path from 'path';
import { RAIZ } from '../../config/directorios.js';
import { enviarALaListaNegra, listarEmpresasEnListaNegra } from './listaNegraModelo.js';

const MAX_MOTIVO = 1000;

// Página de la Lista Negra
export function mostrarListaNegra(req, res) {
    res.sendFile(path.join(RAIZ, 'reportes', 'listanegra', 'lista-negra.html'));
}

// Datos de la lista para las tarjetas
export async function obtenerListaNegra(req, res) {
    try {
        const empresas = await listarEmpresasEnListaNegra();
        res.json({ empresas });
    } catch (error) {
        console.error('Error al consultar la lista negra:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

// El administrador envía la MiPyME de un reporte a la lista negra, con su motivo.
// El id del administrador sale de la sesión, nunca del navegador.
export async function enviarEmpresaAListaNegra(req, res) {
    const idReporte = Number.parseInt(req.params.id, 10);
    const motivo = typeof req.body.motivo === 'string' ? req.body.motivo.trim() : '';

    if (!Number.isInteger(idReporte)) {
        return res.status(400).json({ error: 'Identificador de reporte no válido.' });
    }
    if (motivo === '') {
        return res.status(400).json({ error: 'Escribe el motivo por el cual se envía a la lista negra.' });
    }
    if (motivo.length > MAX_MOTIVO) {
        return res.status(400).json({ error: `El motivo no puede superar ${MAX_MOTIVO} caracteres.` });
    }

    try {
        const resultado = await enviarALaListaNegra({
            idReporte,
            idAdministrador: req.session.usuarioId,
            motivo
        });
        if (resultado === 'no_existe') {
            return res.status(404).json({ error: 'El reporte no existe.' });
        }
        if (resultado === 'ya_revisado') {
            return res.status(409).json({ error: 'Este reporte ya fue revisado.' });
        }
        res.json({ ok: true });
    } catch (error) {
        console.error('Error al enviar a la lista negra:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}
