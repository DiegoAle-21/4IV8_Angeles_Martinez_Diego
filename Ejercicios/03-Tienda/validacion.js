function validarCompra(formulario) {
    var montoStr = formulario.totalCompra.value;
    var divRes = document.getElementById("resultado");
    var numOK = "0123456789.";
    var puntos = 0;

    // 1. Validar que no esté vacío
    if (montoStr.length === 0) {
        alert("El campo no puede estar vacío.");
        return false;
    }

    // 2. Validar que el primer carácter no sea un punto
    if (montoStr.charAt(0) == ".") {
        alert("El monto no puede empezar con un punto.");
        formulario.totalCompra.focus();
        return false;
    }

    // 3. Validar carácter por carácter
    for (var i = 0; i < montoStr.length; i++) {
        var caracter = montoStr.charAt(i);
        
        if (numOK.indexOf(caracter) == -1) {
            alert("Error: Ingrese solo números y un punto decimal.");
            formulario.totalCompra.focus();
            return false;
        }

        if (caracter == ".") {
            puntos++;
        }
    }

    // 4. Validar que no haya más de un punto
    if (puntos > 1) {
        alert("Error: El monto no puede tener más de un punto decimal.");
        formulario.totalCompra.focus();
        return false;
    }

    // 5. Validar que no sea solo un punto (aunque ya lo cubre el paso 2, por seguridad)
    var montoNum = parseFloat(montoStr);
    if (isNaN(montoNum)) {
        alert("Error: Ingrese un número válido.");
        return false;
    }

    // --- REGLAS DE NEGOCIO ---
    if (montoNum < 50 || montoNum > 50000) {
        alert("El monto debe estar entre $50 y $50,000.");
        return false;
    }

    // --- CÁLCULO ---
    var descuento = montoNum * 0.15;
    var totalFinal = montoNum - descuento;

    divRes.innerHTML = `
        <strong>Compra:</strong> $${montoNum.toFixed(2)}<br>
        <strong>Descuento (15%):</strong> -$${descuento.toFixed(2)}<br>
        <hr>
        <strong>Total a pagar: $${totalFinal.toFixed(2)}</strong>
    `;

    return false;
}