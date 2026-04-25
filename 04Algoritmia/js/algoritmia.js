function problema1(){
    var p1_input = document.querySelector('#p1-input').value;
    
    // Validación: Solo letras de la A a la Z (mayúsculas/minúsculas) y espacios
    var regex = /^[a-zA-Z\s]+$/;
    
    if(!regex.test(p1_input)){
        document.querySelector('#p1-output').textContent = "Error: Solo se permiten letras y espacios.";
        return;
    }

    var p1_res = p1_input.split(' ').reverse().join(' ');
    document.querySelector('#p1-output').textContent = p1_res;
}

function problema2(){
    // Obtenemos los valores de la tabla
    var p2_x1 = document.querySelector("#p2-x1").value;
    var p2_x2 = document.querySelector("#p2-x2").value;
    var p2_x3 = document.querySelector("#p2-x3").value;
    var p2_x4 = document.querySelector("#p2-x4").value;
    var p2_x5 = document.querySelector("#p2-x5").value;

    var p2_y1 = document.querySelector("#p2-y1").value;
    var p2_y2 = document.querySelector("#p2-y2").value;
    var p2_y3 = document.querySelector("#p2-y3").value;
    var p2_y4 = document.querySelector("#p2-y4").value;
    var p2_y5 = document.querySelector("#p2-y5").value;

    var v1 = [p2_x1, p2_x2, p2_x3, p2_x4, p2_x5];
    var v2 = [p2_y1, p2_y2, p2_y3, p2_y4, p2_y5];

    // Ordenamos y calculamos
    v1 = v1.sort(function(a, b){ return b - a; });
    v2 = v2.sort(function(a, b){ return b - a; });
    v2 = v2.reverse();

    var p2_producto = 0;
    for(var i = 0; i < v1.length; i++){
        p2_producto += v1[i] * v2[i];
    }

    document.querySelector('#p2-output').textContent = "El producto escalar mínimo es de: " + p2_producto;
}

function problema3(){
    var p3_input = document.querySelector('#p3-input').value;
    
    // Validación: Solo letras de la A a la Z (mayúsculas) y comas, sin espacios
    // Según tu instrucción: "Considera solamente el alfabeto A-Z en mayusculas... separadas por coma. No se aceptan espacios."
    var regex = /^[A-Z,]+$/;

    if(!regex.test(p3_input)){
        document.querySelector('#p3-output').textContent = "Error: Solo mayúsculas (A-Z) separadas por comas, sin espacios.";
        return;
    }

    var p3_palabras = p3_input.split(',');
    var p3_res = '';
    var p3_max_caracteres = 0;

    p3_palabras.forEach(function (palabra) {
        var letras = [];
        for(var i = 0; i < palabra.length; i++){
            var letra = palabra[i];
            if(letras.indexOf(letra) === -1){
                letras.push(letra);
            }
        }

        if(letras.length > p3_max_caracteres){
            p3_max_caracteres = letras.length;
            p3_res = palabra;
        }
    });

    document.querySelector('#p3-output').textContent = 'La palabra con más caracteres únicos es: ' + p3_res + ' (' + p3_max_caracteres + ')';
}