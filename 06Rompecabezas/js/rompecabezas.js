var instrucciones = [
    "Utiliza las flechas de navegacion para mover las piezas",
    "Para Ordenar las piezas guiate por la imagen objetivo"
];

//para guardar los movimientos nececitamos un arreglo

var movimientos = [];

//tengo que saber cuales son las posiciones del rompecabezas original
var rompe = [
    [1,2,3],
    [4,5,6],
    [7,8,9]
];

//necesito otra variable para saber que el orden del rompecabezas es el correcto

var rompeCorrecta = [
    [1,2,3],
    [4,5,6],
    [7,8,9]
];

//necesito conocer la posicion de la ficha o pieza vacia

var filaVacia = 2;
var columnaVacia = 2;

//necesito una funcion que se encarge de mostrar la lista de instrucciones
function mostrarInstrucciones(instrucciones){
    for(var i = 0; i < instrucciones.length; i++){
        mostrarInstruccionesLista(instrucciones[i],"lista-instrucciones");
    }
}

function mostrarInstruccionesLista(instruccion,idLista){
    var ul = document.getElementById(idLista);
    var li = document.createElement("li");
    li.textContent = instruccion;
    ul.appendChild(li);

}