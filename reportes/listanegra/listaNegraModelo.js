// modulos/listaNegra/listaNegraModelo.js
// Módulo: Lista Negra — consultas a la base de datos.
// La lista negra se forma con los reportes que el administrador ACEPTÓ y para los que
// escribió un motivo (columna reportes.otro_motivo).
import conexionDB from '../../config/baseDeDatos.js';

// Envía a lista negra la MiPyME del reporte indicado.
// Solo se puede hacer con reportes PENDIENTES. Devuelve 'ok', 'no_existe' o 'ya_revisado'.
export async function enviarALaListaNegra({ idReporte, idAdministrador, motivo }) {
    const actualizado = await conexionDB.query(
        `UPDATE reportes
            SET estado = 'ACEPTADO',
                otro_motivo = $3,
                id_administrador = $2,
                fecha_revision = (NOW() AT TIME ZONE 'UTC')
          WHERE id_reporte = $1 AND estado = 'PENDIENTE'
          RETURNING id_reporte`,
        [idReporte, idAdministrador, motivo]
    );
    if (actualizado.rows.length > 0) return 'ok';

    const existe = await conexionDB.query(
        'SELECT id_reporte FROM reportes WHERE id_reporte = $1',
        [idReporte]
    );
    return existe.rows.length > 0 ? 'ya_revisado' : 'no_existe';
}

// Empresas en lista negra: una por MiPyME (con el motivo de su revisión más reciente).
export async function listarEmpresasEnListaNegra() {
    const { rows } = await conexionDB.query(
        `SELECT * FROM (
             SELECT DISTINCT ON (r.id_mipyme)
                    r.id_mipyme,
                    m.nombre_comercial,
                    r.otro_motivo AS motivo_lista_negra,
                    (r.fecha_revision AT TIME ZONE 'UTC') AS fecha_revision
               FROM reportes r
               JOIN mipyme m ON m.id_mipyme = r.id_mipyme
              WHERE r.estado = 'ACEPTADO'
                AND r.otro_motivo IS NOT NULL
                AND r.otro_motivo <> ''
              ORDER BY r.id_mipyme, r.fecha_revision DESC
         ) lista
         ORDER BY fecha_revision DESC NULLS LAST`
    );
    return rows;
}
