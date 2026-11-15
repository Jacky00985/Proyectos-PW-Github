// Página de detalle: muestra un reporte completo. El id llega en la URL: /admin/reportes/detalle?id=5
(function () {
    const ETIQUETAS_MOTIVO = {
        COBRO_POR_CONTRATACION: 'Cobro por contratación',
        OFERTA_FALSA: 'Oferta falsa',
        SUPLANTACION_DE_IDENTIDAD: 'Suplantación de identidad',
        CONDICIONES_ABUSIVAS: 'Condiciones abusivas',
        EMPRESA_INEXISTENTE: 'Empresa inexistente',
        OTRO: 'Otro'
    };
    const ETIQUETAS_ESTADO = { PENDIENTE: 'Pendiente', ACEPTADO: 'Aceptado', RECHAZADO: 'Rechazado' };
    const ETIQUETAS_PERSONA = { FISICA: 'Física', MORAL: 'Moral' };

    const mensaje = document.getElementById('mensajeDetalle');
    const tarjeta = document.getElementById('detalleCard');
    const poner = (id, texto) => { document.getElementById(id).textContent = texto; };

    function formatearFecha(valor) {
        if (!valor) return '—';
        return new Date(valor).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
    }

    async function cargar() {
        const id = Number.parseInt(new URLSearchParams(window.location.search).get('id'), 10);
        if (!Number.isInteger(id)) {
            mensaje.textContent = 'Reporte no indicado.';
            return;
        }
        try {
            const respuesta = await fetch(`/api/admin/reportes/${id}`, { cache: 'no-store' });
            if (respuesta.status === 401) { window.location.href = '/login'; return; }
            const r = await respuesta.json();
            if (!respuesta.ok) throw new Error(r.error || 'No se pudo cargar el reporte.');

            poner('detalleTitulo', `Reporte #${r.id_reporte}`);
            poner('detalleEstado', ETIQUETAS_ESTADO[r.estado] || r.estado);
            poner('dEmpresa', r.nombre_comercial);
            poner('dTipoPersona', ETIQUETAS_PERSONA[r.tipo_persona] || r.tipo_persona || '—');
            poner('dTrabajadores', r.numero_trabajadores ?? '—');
            poner('dMotivo', ETIQUETAS_MOTIVO[r.motivo] || r.motivo);
            poner('dConsultor', r.consultor_nombre ? `${r.consultor_usuario} (${r.consultor_nombre})` : r.consultor_usuario);
            poner('dCorreo', r.consultor_correo || '—');
            poner('dFecha', formatearFecha(r.fecha_reporte));
            poner('dRevision', r.fecha_revision ? formatearFecha(r.fecha_revision) : 'Sin revisar');
            poner('dDescripcion', r.descripcion);

            mensaje.hidden = true;
            tarjeta.hidden = false;
        } catch (error) {
            mensaje.textContent = error.message;
        }
    }


      // ---------- Lista negra ----------
    const bloque = document.getElementById('bloqueListaNegra');
    const accion = document.getElementById('accionListaNegra');
    const guardado = document.getElementById('motivoGuardado');
    const formulario = document.getElementById('formListaNegra');
    const btnAbrir = document.getElementById('btnAbrirListaNegra');
    const btnConfirmar = document.getElementById('btnConfirmarListaNegra');
    const btnCancelar = document.getElementById('btnCancelarListaNegra');
    const campoMotivo = document.getElementById('motivoListaNegra');
    const aviso = document.getElementById('avisoListaNegra');
    let idReporteActual = null;

    function mostrarAviso(texto, tipo) {
        aviso.textContent = texto;
        aviso.className = 'ln-aviso ' + (tipo || '');
    }

    function prepararListaNegra(r) {
        idReporteActual = r.id_reporte;
        bloque.hidden = true; accion.hidden = true; guardado.hidden = true;
        if (r.estado === 'PENDIENTE') {
            accion.hidden = false; bloque.hidden = false;
        } else if (r.estado === 'ACEPTADO' && r.otro_motivo) {
            document.getElementById('dMotivoListaNegra').textContent = r.otro_motivo;
            guardado.hidden = false; bloque.hidden = false;
        }
    }

    btnAbrir.addEventListener('click', () => {
        formulario.hidden = false; btnAbrir.hidden = true; campoMotivo.focus();
    });
    btnCancelar.addEventListener('click', () => {
        formulario.hidden = true; btnAbrir.hidden = false; campoMotivo.value = ''; mostrarAviso('');
    });
    btnConfirmar.addEventListener('click', async () => {
        const motivo = campoMotivo.value.trim();
        if (motivo === '') { mostrarAviso('Escribe el motivo antes de continuar.', 'error'); return; }
        btnConfirmar.disabled = true;
        mostrarAviso('Enviando...');
        try {
            const respuesta = await fetch(`/api/admin/reportes/${idReporteActual}/lista-negra`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo })
            });
            if (respuesta.status === 401) { window.location.href = '/login'; return; }
            const datos = await respuesta.json();
            if (!respuesta.ok) throw new Error(datos.error || 'No se pudo enviar a la lista negra.');
            mostrarAviso('La MiPyME fue enviada a la lista negra.', 'ok');
            setTimeout(() => window.location.reload(), 1200);
        } catch (error) {
            mostrarAviso(error.message, 'error');
            btnConfirmar.disabled = false;
        }
    });


    cargar();
})();