function validarYCalcular(formulario) {
    // Obtenemos los valores
    var capStr = formulario.capital.value;
    var mesStr = formulario.meses.value;
    var divRes = document.getElementById("resultado");

    // Definimos caracteres permitidos (solo números)
    var numOK = "0123456789";

    // --- VALIDACIÓN DE CAPITAL ---
    if (capStr.length === 0) {
        alert("Por favor, ingrese el capital a invertir.");
        formulario.capital.focus();
        return false;
    }

    for (var i = 0; i < capStr.length; i++) {
        var caracter = capStr.charAt(i);
        if (numOK.indexOf(caracter) == -1) {
            alert("Error: Solo se permiten números enteros en el capital.");
            formulario.capital.focus();
            return false;
        }
    }

    var capitalNum = parseInt(capStr);
    if (capitalNum < 1000 || capitalNum > 1000000) {
        alert("La inversión debe ser entre $1,000 y $1,000,000.");
        formulario.capital.focus();
        return false;
    }

    // --- VALIDACIÓN DE MESES ---
    if (mesStr.length === 0) {
        alert("Por favor, ingrese el número de meses.");
        formulario.meses.focus();
        return false;
    }

    for (var i = 0; i < mesStr.length; i++) {
        var caracter = mesStr.charAt(i);
        if (numOK.indexOf(caracter) == -1) {
            alert("Error: Ingrese un número de meses válido.");
            formulario.meses.focus();
            return false;
        }
    }

    var mesesNum = parseInt(mesStr);
    if (mesesNum < 1 || mesesNum > 12) {
        alert("El tiempo debe ser entre 1 y 12 meses.");
        formulario.meses.focus();
        return false;
    }

    // --- CÁLCULOS ---
    var interesMensual = capitalNum * 0.02;
    var gananciaTotal = interesMensual * mesesNum;
    var totalFinal = capitalNum + gananciaTotal;

    // Mostramos los resultados en el div
    divRes.innerHTML = `
        <strong>Resultados:</strong><br>
        Inversión base: $${capitalNum}<br>
        Ganancia por mes: $${interesMensual.toFixed(2)}<br>
        Ganancia total (${mesesNum} meses): $${gananciaTotal.toFixed(2)}<br>
        <hr>
        <strong>Monto final: $${totalFinal.toFixed(2)}</strong>
    `;

    // Retornamos false para que el formulario no intente recargar la página 
    // y podamos ver el resultado en pantalla.
    return false;
}