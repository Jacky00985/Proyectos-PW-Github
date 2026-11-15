// cifrado.js
// Cifrado de campos sensibles con AES-256-GCM (cifrado autenticado).
// - Cada valor usa un IV aleatorio, así dos textos iguales dan resultados distintos.
// - GCM añade una etiqueta de autenticación: si alguien altera el dato en la base, descifrar falla.
// La clave vive SOLO en el archivo .env (CLAVE_CIFRADO), nunca en el código ni en la base de datos.
import crypto from 'crypto';

const ALGORITMO = 'aes-256-gcm';
const PREFIJO = 'v1'; // versión del formato, por si algún día cambia el cifrado

function obtenerClave() {
    const hex = process.env.CLAVE_CIFRADO;
    if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
        throw new Error('CLAVE_CIFRADO debe existir en .env y tener 64 caracteres hexadecimales (32 bytes).');
    }
    return Buffer.from(hex, 'hex');
}

// Llamar al arrancar el servidor: si la clave falta o está mal, el servidor no inicia.
export function validarClaveDeCifrado() {
    obtenerClave();
}

export function cifrar(texto) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITMO, obtenerClave(), iv);
    const cifrado = Buffer.concat([cipher.update(String(texto), 'utf8'), cipher.final()]);
    const etiqueta = cipher.getAuthTag();
    return [PREFIJO, iv.toString('base64'), etiqueta.toString('base64'), cifrado.toString('base64')].join(':');
}

export function descifrar(valor) {
    // Datos guardados antes de activar el cifrado (texto normal): se devuelven tal cual.
    if (typeof valor !== 'string' || !valor.startsWith(PREFIJO + ':')) return valor;

    const [, iv, etiqueta, datos] = valor.split(':');
    const decipher = crypto.createDecipheriv(ALGORITMO, obtenerClave(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(etiqueta, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(datos, 'base64')), decipher.final()]).toString('utf8');
}

// Para mostrar datos sin que un valor dañado tire toda la lista.
export function descifrarSeguro(valor) {
    try {
        return descifrar(valor);
    } catch (error) {
        console.error('No se pudo descifrar un valor:', error.message);
        return '[No se pudo descifrar este contenido]';
    }
}