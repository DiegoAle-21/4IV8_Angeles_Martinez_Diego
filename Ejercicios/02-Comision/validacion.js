function validarVendedor(formulario) {
    var nombre = formulario.nombre.value;
    var sueldoStr = formulario.sueldo.value;
    var ventasStr = formulario.ventas.value;
    var divRes = document.getElementById("resultado");

    var abcOK = " QWERTYUIOPASDFGHJKLÑZXCVBNMqwertyuiopasdfghjklñzxcvbnmáéíóúÁÉÍÓÚ";
    var numOK = "0123456789";

    // --- VALIDACIÓN DE NOMBRE ---
    if (nombre.length < 3) {
        alert("Por favor, ingrese un nombre mayor de 3 caracteres");
        formulario.nombre.focus();
        return false;
    }
    for (var i = 0; i < nombre.length; i++) {
        if (abcOK.indexOf(nombre.charAt(i)) == -1) {
            alert("El campo nombre solo debe contener letras");
            return false;
        }
    }

    // --- VALIDACIÓN DE SUELDO CON LÍMITES ---
    if (sueldoStr === "") {
        alert("Ingrese el sueldo base");
        return false;
    }
    for (var i = 0; i < sueldoStr.length; i++) {
        if (numOK.indexOf(sueldoStr.charAt(i)) == -1) {
            alert("El sueldo debe ser un número entero sin letras ni puntos");
            return false;
        }
    }
    
    var sueldoBase = parseInt(sueldoStr);
    if (sueldoBase < 5000 || sueldoBase > 50000) {
        alert("El sueldo base permitido es entre $5,000 y $50,000");
        formulario.sueldo.focus();
        return false;
    }

    // --- VALIDACIÓN DE VENTAS (Regex + Límites individuales) ---
    var regexVentas = /^\d+(\.\d+)?,\d+(\.\d+)?,\d+(\.\d+)?$/;
    if (!regexVentas.test(ventasStr)) {
        alert("Formato de ventas incorrecto. Ejemplo: 1000,2000,1500");
        return false;
    }

    // Convertimos el texto en un arreglo de números
    var listaVentas = ventasStr.split(",").map(Number);

    // Validamos cada venta por separado
    for (var j = 0; j < listaVentas.length; j++) {
        if (listaVentas[j] < 100 || listaVentas[j] > 100000) {
            alert("Cada venta individual debe estar entre $100 y $100,000.\nRevisar venta #" + (j+1));
            formulario.ventas.focus();
            return false;
        }
    }

    // --- CÁLCULOS ---
    var sumaVentas = listaVentas[0] + listaVentas[1] + listaVentas[2];
    var comisiones = sumaVentas * 0.10;
    var totalRecibir = sueldoBase + comisiones;

    divRes.innerHTML = `
        <strong>Vendedor:</strong> ${nombre}<br>
        <strong>Sueldo Base:</strong> $${sueldoBase.toFixed(2)}<br>
        <strong>Comisiones (10%):</strong> $${comisiones.toFixed(2)}<br>
        <hr>
        <strong>Total Neto: $${totalRecibir.toFixed(2)}</strong>
    `;

    return false;
}