// middlewares/autenticacion.js
// Filtros que comprueban la sesión antes de dejar pasar a una ruta.

// --- Para páginas: si no corresponde, redirigen al login ---
export function esAdministrador(req, res, next) {
    if (req.session && req.session.rol === 'administrador') {
        return next();
    }
    res.redirect('/login');
}

export function esConsultor(req, res, next) {
    if (req.session && req.session.rol === 'consultor') {
        return next();
    }
    res.redirect('/login');
}

// --- Para fetch/API: responden JSON 401 en vez de redirigir ---
function apiConRol(rol) {
    return (req, res, next) => {
        if (req.session && req.session.rol === rol) return next();
        res.status(401).json({ error: 'Sesión no válida. Inicia sesión de nuevo.' });
    };
}

export const apiConsultor = apiConRol('consultor');
export const apiAdministrador = apiConRol('administrador');

// --- Para pantallas que ven tanto el administrador como el consultor (ej. Lista Negra) ---
function tieneRolValido(req) {
    return Boolean(req.session && (req.session.rol === 'administrador' || req.session.rol === 'consultor'));
}

export function esUsuarioConSesion(req, res, next) {
    if (tieneRolValido(req)) return next();
    res.redirect('/login');
}

export function apiUsuarioConSesion(req, res, next) {
    if (tieneRolValido(req)) return next();
    res.status(401).json({ error: 'Sesión no válida. Inicia sesión de nuevo.' });
}
