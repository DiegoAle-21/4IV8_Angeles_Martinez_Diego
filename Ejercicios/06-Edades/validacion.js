function calcularEdad(formulario) {
    var fechaNac = formulario.fechaNacimiento.value;
    var divRes = document.getElementById("resultado");

    // --- VALIDACIÓN DE CAMPO VACÍO ---
    if (fechaNac === "") {
        alert("Por favor, selecciona una fecha de nacimiento.");
        return false;
    }

    var hoy = new Date();
    var cumpleanos = new Date(fechaNac);
    
    // --- VALIDACIÓN DE FECHA LÓGICA ---
    if (cumpleanos > hoy) {
        alert("Error: La fecha de nacimiento no puede ser mayor a la fecha actual.");
        return false;
    }

    // --- CÁLCULO DE EDAD ---
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var diferenciaMeses = hoy.getMonth() - cumpleanos.getMonth();

    // Si aún no ha llegado su mes de cumple, o es su mes pero no su día, restamos un año
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }

    // --- LÍMITE DE EDAD (REGLA DE NEGOCIO) ---
    if (edad > 120) {
        alert("Por favor, ingrese una fecha válida (límite 120 años).");
        return false;
    }

    // Mostrar resultados
    divRes.innerHTML = `
        <strong>Resultado:</strong><br>
        Tienes <strong>${edad}</strong> años de edad.
    `;

    return false; // Mantiene el POST local
}