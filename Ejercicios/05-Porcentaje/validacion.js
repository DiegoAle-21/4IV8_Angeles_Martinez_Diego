function validarGrupo(formulario) {
    var hStr = formulario.hombres.value;
    var mStr = formulario.mujeres.value;
    var divRes = document.getElementById("resultado");
    var numOK = "0123456789";

    // --- VALIDACIÓN DE CARACTERES Y VACÍOS ---
    if (hStr === "" || mStr === "") {
        alert("Ambos campos son obligatorios.");
        return false;
    }

    // Validar hombres
    for (var i = 0; i < hStr.length; i++) {
        if (numOK.indexOf(hStr.charAt(i)) == -1) {
            alert("Error: Solo use números enteros para la cantidad de hombres.");
            formulario.hombres.focus();
            return false;
        }
    }

    // Validar mujeres
    for (var i = 0; i < mStr.length; i++) {
        if (numOK.indexOf(mStr.charAt(i)) == -1) {
            alert("Error: Solo use números enteros para la cantidad de mujeres.");
            formulario.mujeres.focus();
            return false;
        }
    }

    var cantH = parseInt(hStr);
    var cantM = parseInt(mStr);

    // --- LÍMITES DE CANTIDAD ---
    if (cantH > 100 || cantM > 100) {
        alert("La cantidad máxima permitida por género es de 100 estudiantes.");
        return false;
    }

    var total = cantH + cantM;

    if (total === 0) {
        alert("Debe haber al menos un estudiante en el grupo.");
        return false;
    }

    // --- CÁLCULOS ---
    var porcH = (cantH * 100) / total;
    var porcM = (cantM * 100) / total;

    divRes.innerHTML = `
        <strong>Total de alumnos:</strong> ${total}<br>
        <hr>
        <strong>Hombres:</strong> ${porcH.toFixed(2)}%<br>
        <strong>Mujeres:</strong> ${porcM.toFixed(2)}%
    `;

    return false;
}