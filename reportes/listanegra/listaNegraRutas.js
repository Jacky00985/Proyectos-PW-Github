// modulos/listaNegra/listaNegraRutas.js
// Módulo: Lista Negra
import { Router } from 'express';
import {
    esUsuarioConSesion, apiUsuarioConSesion, apiAdministrador
} from '../../middlewares/autenticacion.js';
import {
    mostrarListaNegra, obtenerListaNegra, enviarEmpresaAListaNegra
} from './listaNegraControlador.js';

const router = Router();

// Administrador y consultor pueden ver la lista
router.get('/lista-negra', esUsuarioConSesion, mostrarListaNegra);
router.get('/api/lista-negra', apiUsuarioConSesion, obtenerListaNegra);

// Solo el administrador puede enviar empresas a ella
router.post('/api/admin/reportes/:id/lista-negra', apiAdministrador, enviarEmpresaAListaNegra);

export default router;
