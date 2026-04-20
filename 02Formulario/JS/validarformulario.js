function validarformulario(formulario) {
    // --- VALIDACIÓN DEL NOMBRE ---
    // trim() elimina espacios vacíos al inicio y al final
    if (formulario.nombre.value.trim().length < 3) {
        alert("Por favor ingrese un nombre mayor de 3 caracteres");
        formulario.nombre.focus();
        return false;
    }

    var abcOK = "QWERTYUIOPASDFGHJKLÑZXCVBNM" + "qwertyuiopasdfghjklñzxcvbnm " + "áéíóúÁÉÍÓÚ";
    var checkString = formulario.nombre.value;

    for (var i = 0; i < checkString.length; i++) {
        var caracter = checkString.charAt(i);
        if (abcOK.indexOf(caracter) == -1) {
            alert("Por favor escriba únicamente letras en el campo nombre");
            formulario.nombre.focus();
            return false;
        }
    }

    // --- VALIDACIÓN DE LA EDAD ---
    var edadTexto = formulario.edad.value;
    var edadValor = parseInt(edadTexto);

    // Validamos que no esté vacío y que sea un número
    if (edadTexto === "") {
        alert("Por favor ingrese su edad");
        formulario.edad.focus();
        return false;
    }

    // Validamos el rango numérico (mayor a 17 y menor a 100)
    if (edadValor < 18 || edadValor >= 100) {
        alert("La edad debe ser mayor de 17 años y menor a 100");
        formulario.edad.focus();
        return false;
    }

    // --- VALIDACIÓN DEL EMAIL ---
    // Esta expresión regular es más robusta para correos electrónicos
    var correoelectronico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var txt = formulario.email.value;

    if (!correoelectronico.test(txt)) {
        alert("Por favor, ingrese un correo electrónico válido (ejemplo@dominio.com)");
        formulario.email.focus();
        return false;
    }

    // Si todas las validaciones pasan
    alert("Formulario enviado con éxito");
    return true;
}