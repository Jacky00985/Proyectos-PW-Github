// Página Lista Negra: pide la lista al servidor y dibuja una tarjeta por empresa.
// Todo el texto se inserta con textContent (no con innerHTML) para evitar inyección de código.
(function () {
    const contenedor = document.getElementById('listaNegra');
    const mensaje = document.getElementById('mensajeLista');

    function crearTarjeta(empresa) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'ln-tarjeta';

        // Logo: aún no hay logos guardados, se muestra la inicial.
        // Cuando exista una columna con el logo, aquí se cambia por un <img src="...">.
        const logo = document.createElement('div');
        logo.className = 'ln-logo';
        logo.textContent = (empresa.nombre_comercial || '?').trim().charAt(0).toUpperCase();

        const info = document.createElement('div');
        info.className = 'ln-info';

        const nombre = document.createElement('p');
        nombre.className = 'ln-nombre';
        nombre.textContent = empresa.nombre_comercial;

        const motivo = document.createElement('p');
        motivo.className = 'ln-motivo';
        motivo.textContent = empresa.motivo_lista_negra;

        info.append(nombre, motivo);
        tarjeta.append(logo, info);
        return tarjeta;
    }

    async function cargar() {
        try {
            const respuesta = await fetch('/api/lista-negra', { cache: 'no-store' });
            if (respuesta.status === 401) { window.location.href = '/login'; return; }
            const datos = await respuesta.json();
            if (!respuesta.ok) throw new Error(datos.error || 'No se pudo cargar la lista.');

            contenedor.replaceChildren(...datos.empresas.map(crearTarjeta));
            mensaje.hidden = datos.empresas.length > 0;
            if (datos.empresas.length === 0) mensaje.textContent = 'Todavía no hay empresas en la lista negra.';
        } catch (error) {
            mensaje.hidden = false;
            mensaje.textContent = error.message;
        }
    }

    cargar();
})();
