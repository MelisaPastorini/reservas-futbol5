document.addEventListener('DOMContentLoaded', function() {
    const calendario = document.getElementById('calendario');
    const botonSemanaAnterior = document.getElementById('prev-week');
    const botonSemanaSiguiente = document.getElementById('next-week');
    let fechaActual = new Date();

    //#region Manejar el calendario

    // Manejar los botones de navegación
    botonSemanaAnterior.addEventListener('click', function() {
        fechaActual.setDate(fechaActual.getDate() - 7);
        generarCalendario(fechaActual);
    });
    
    botonSemanaSiguiente.addEventListener('click', function() {
        fechaActual.setDate(fechaActual.getDate() + 7);
        generarCalendario(fechaActual);
    });

    // Función para generar el calendario
    function generarCalendario(fecha) {
        const inicioDeSemana = obtenerInicioDeSemana(fecha);
        const finDeSemana = new Date(inicioDeSemana);
        finDeSemana.setDate(finDeSemana.getDate() + 6);

        calendario.innerHTML = '';

        // Generar encabezado
        const filaEncabezado = document.createElement('tr');
        const celdaEncabezadoVacia = document.createElement('th');
        filaEncabezado.appendChild(celdaEncabezadoVacia);

        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioDeSemana);
            dia.setDate(dia.getDate() + i);
            const celdaEncabezado = document.createElement('th');
            celdaEncabezado.textContent = `${dia.toLocaleDateString('es-ES', { weekday: 'short' })} ${dia.getDate()}/${dia.getMonth() + 1}`;
            filaEncabezado.appendChild(celdaEncabezado);
        }
        // Agregar encabezado al calendario
        calendario.appendChild(filaEncabezado);

        // Generar intervalos de tiempo
        for (let hora = 9; hora <= 23; hora++) {
            const fila = document.createElement('tr');
            const celdaHora = document.createElement('td');
            celdaHora.textContent = `${hora}:00`;
            fila.appendChild(celdaHora);

            for (let i = 0; i < 7; i++) {
                const dia = new Date(inicioDeSemana);
                dia.setDate(dia.getDate() + i);
                const celda = document.createElement('td');
                celda.dataset.fecha = dia.toISOString().split('T')[0];
                celda.dataset.hora = hora;

                // Determinar la clase de la celda basada en la disponibilidad
                const diaDeSemana = fecha.getDay();
                if (esFueraDeHorario(diaDeSemana, hora)) {
                    celda.classList.add('no-service');
                } else {
                    celda.classList.add('available'); // Por defecto disponible, se actualizará con AJAX
                }
                // Agregar celda a la fila
                fila.appendChild(celda);
            }
            // Agregar fila al calendario
            calendario.appendChild(fila);
        }

        // Actualizar disponibilidad
        actualizarDisponibilidad(inicioDeSemana, finDeSemana);
    }

    // Función para obtener el inicio de la semana
    function obtenerInicioDeSemana(fecha) {
        const inicioDeSemana = new Date(fecha);
        const dia = inicioDeSemana.getDay();
        const diferencia = inicioDeSemana.getDate() - dia + (dia === 0 ? -6 : 1); // Ajustar cuando el día es domingo
        inicioDeSemana.setDate(diferencia);
        return inicioDeSemana;
    }

    // Función para determinar si es fuera de horario badaso en la fecha y hora
    function esFueraDeHorario(dia, hora) {
        if (dia >= 1 && dia <= 5) {
            return hora < 16;
        } else {
            return hora < 9 || hora >= 23;
        }
    }
    
    // Función para actualizar la disponibilidad
    function actualizarDisponibilidad(inicioDeSemana, finDeSemana) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `disponibilidad.php?start=${inicioDeSemana.toISOString().split('T')[0]}&end=${finDeSemana.toISOString().split('T')[0]}`, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                const disponibilidad = JSON.parse(this.responseText);
                actualizarCalendario(disponibilidad);
            } else {
                console.error('Error al obtener la disponibilidad:', xhr.statusText);
            }
        };
        xhr.onerror = function() {
            console.error('Error de red al obtener la disponibilidad');
        };
        xhr.send();
    }

    // Función para actualizar el calendario
    function actualizarCalendario(disponibilidad) {
        const celdas = calendario.querySelectorAll('td[data-fecha][data-hora]');        
        celdas.forEach((celda, indice) => {
            const fecha = celda.dataset.fecha;
            const hora = parseInt(celda.dataset.hora, 10);
            const clave = `${fecha} ${hora}:00:00`;
                        
            // Obtener el valor de disponibilidad
            const valorDisponibilidad = disponibilidad[clave];

            const diaDeSemana = (indice % 7) + 1;

            // Actualizar la clase de la celda
            if (esFueraDeHorario(diaDeSemana, hora)) {
                celda.classList.remove('available');
                celda.classList.add('no-service');
            } else {
                if (disponibilidad[clave] && valorDisponibilidad >= 10) {
                    celda.classList.remove('available');
                    celda.classList.add('unavailable');
                } else {
                    celda.classList.remove('unavailable');
                    celda.classList.add('available');
                }
            }
        });
    }    

    // Función para validar el horario
    function validarHorario(fecha, hora) {
        const dia = new Date(fecha).getDay();
        const [horas, minutos] = hora.split(':').map(Number);
        
        if (dia >= 1 && dia <= 5) {
            return horas >= 16 && horas <= 23;
        } else {
            return horas >= 9 && horas <= 22;
        }
    }

    // Generar el calendario
    generarCalendario(fechaActual);

    //#endregion

    //#region Manejar el formulario de reserva

    function limpiarFormulario() {
        document.getElementById('correo').value = '';
        document.getElementById('cancha').value = '';
        document.getElementById('fecha').value = '';
        document.getElementById('hora').value = '';
    }

    function limpiarMensajeExito() {        
        const mensajeExito = document.getElementById('mensaje-exito');
        if (mensajeExito) {
            mensajeExito.style.display = 'none';
            mensajeExito.innerHTML = '';
        }
    }

    function deshabilitarDiasPasados() {
        const fechaInput = document.getElementById('fecha');
        const today = new Date().toISOString().split('T')[0];
        fechaInput.setAttribute('min', today); 
    }

    const fechaInput = document.getElementById('fecha');

    fechaInput.addEventListener('click', function() {
        deshabilitarDiasPasados();
    });

    // Manejar el envío del formulario de reserva
    document.getElementById('reservaForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const correo = document.getElementById('correo').value;
        const cancha = document.getElementById('cancha').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        
        if (!validarHorario(fecha, hora)) {
            alert('Horario no permitido');
            return;
        }
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'reservar.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log(this.responseText); // Mostrar la respuesta en la consola
                const mensajeExito = document.getElementById('mensaje-exito');
                mensajeExito.style.display = 'block';
                mensajeExito.innerHTML = `
                    <p>Reserva confirmada</p>
                    <p>Correo: ${correo}</p>
                    <p>Cancha: ${cancha}</p>
                    <p>Fecha: ${fecha}</p>
                    <p>Hora: ${hora}</p>
                `;                
                generarCalendario(fechaActual);
                limpiarFormulario();
                setTimeout(limpiarMensajeExito, 5000);
            } else if (xhr.status === 404) {
                alert('Usuario no encontrado');
            } else if (xhr.status === 409) {
                alert('No hay disponibilidad para la fecha y hora seleccionadas');
            } else {
                alert('Error al realizar la reserva');
            }
        };
        xhr.onerror = function() {
            alert('Error de red al realizar la reserva');
        };
        xhr.send(`correo=${correo}&cancha=${cancha}&fecha=${fecha}&hora=${hora}`);
    });

    //#endregion
});