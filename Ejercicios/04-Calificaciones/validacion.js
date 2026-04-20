function validarNotas(formulario) {
    var parcialesStr = formulario.parciales.value;
    var examenStr = formulario.examen.value;
    var trabajoStr = formulario.trabajo.value;
    var divRes = document.getElementById("resultado");

    var numOK = "0123456789.";

    // --- FUNCION AUXILIAR DE VALIDACIÓN ---
    function esNotaValida(texto, campoNombre) {
        if (texto === "" || texto.charAt(0) === ".") {
            alert("El campo " + campoNombre + " no es válido o está vacío.");
            return false;
        }
        var puntos = 0;
        for (var i = 0; i < texto.length; i++) {
            if (numOK.indexOf(texto.charAt(i)) == -1) {
                alert("Error en " + campoNombre + ": solo se permiten números.");
                return false;
            }
            if (texto.charAt(i) == ".") puntos++;
        }
        if (puntos > 1) {
            alert("Error en " + campoNombre + ": demasiados puntos decimales.");
            return false;
        }
        var valor = parseFloat(texto);
        if (valor < 0 || valor > 10) {
            alert("La calificación en " + campoNombre + " debe estar entre 0 y 10.");
            return false;
        }
        return true;
    }

    // --- VALIDACIÓN DE PARCIALES (Formato: n,n,n) ---
    var regexParciales = /^\d+(\.\d+)?,\d+(\.\d+)?,\d+(\.\d+)?$/;
    if (!regexParciales.test(parcialesStr)) {
        alert("Ingrese los 3 parciales separados por comas (Ej: 7,8.5,10)");
        return false;
    }
    var listaParciales = parcialesStr.split(",").map(Number);
    for (var i = 0; i < listaParciales.length; i++) {
        if (listaParciales[i] < 0 || listaParciales[i] > 10) {
            alert("Cada parcial debe estar entre 0 y 10.");
            return false;
        }
    }

    // --- VALIDACIÓN EXAMEN Y TRABAJO ---
    if (!esNotaValida(examenStr, "Examen Final")) return false;
    if (!esNotaValida(trabajoStr, "Trabajo Final")) return false;

    // --- CÁLCULOS ---
    var promedioParciales = (listaParciales[0] + listaParciales[1] + listaParciales[2]) / 3;
    var notaFinal = (promedioParciales * 0.55) + (parseFloat(examenStr) * 0.30) + (parseFloat(trabajoStr) * 0.15);

    divRes.innerHTML = `
        <strong>Desglose:</strong><br>
        Promedio Parciales (55%): ${(promedioParciales * 0.55).toFixed(2)}<br>
        Examen Final (30%): ${(parseFloat(examenStr) * 0.30).toFixed(2)}<br>
        Trabajo Final (15%): ${(parseFloat(trabajoStr) * 0.15).toFixed(2)}<br>
        <hr>
        <strong>CALIFICACIÓN FINAL: ${notaFinal.toFixed(2)}</strong>
    `;

    return false;
}