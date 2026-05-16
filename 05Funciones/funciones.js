//vamos a hacer un viaje en el tiempo y ahora vamos a programar todo bajo el esquema ES6

/*
Para javascript ya conocemos el concepto de variable

var

Se sustiituye por las nuevas variables:

let--> es una variable de tipo "protegida" , ya que solo funciona dentro de un fragmento de codigo

cons --> si es constante



if(true){
    const x = "x";
    console.log(x);

}
let  x = "y";
console.log(x);

//para declarar en js funciones hay una forma mas efectiva para declararlas y a partir de una funcion flecha

//una funcion flecha en JS a diferencia de una funcion normal , no genera su propio contexto (this), necesita ser declarada antes de ser usadda y no necesita un return

//funcion cosa(String hola) { this.hola = hola}
//vamos a hacer una funcion que sume dos numeros
function sumarnumeros(n1, n2){
    return n1+n2;
}

const sumarDosnumeros = (n1,n2) => n1+n2;

console.log(`la suma de la funcion es: (2,3): ${sumarnumeros(2,3)}`);

console.log(`la suma de la funcion es: (4,3): ${sumarDosnumeros(4,3)}`);

//para armar una funcio fleccha debemos entender su estructura:
//"cadena" (el tipo de variable, nombre de la funcion y los argumentos) => operacion
*/

const razaDePerros = [
    "Gran Danes",
    "Doverman",
    "Chihuahua",
    "Pastor Aleman",
    "Pitbull",
    "San Berbardo",
    "Xoloscuicle"
];

/*
for(let i=0; i< razaDePerros.length; i++){
    console.log(razaDePerros[i]);
}

for(const raza of razaDePerros){
    console.log(raza);
}
*/
/*
for(const indice in razaDePerros){
    console.log(razaDePerros[indice]);
}
    forEach
    Iterar sobbre elementos de arreglo que devuelven nada
*/

//razaDePerros.forEach((raza, indice, arregloOriginal) => console.log(raza));
//Tambien se puede:
//razaDePerros.forEach((raza > console.log(raza));

/*
Por ejemplo, necesitamos una funcion para buscar la raza chihuahua y sino existe agregarla
*/

//Funcion map esta funcion  itera sobre los elementos del arreglo y regresa un arreglo diferente con el podemos hacer lo que queramos sin necesidad de modificar el arreglo original

//const razaDeperrosEnMayusculas = razaDePerros.map((razaDePerros, indice, arregloOriginal) => console.log(razaDePerros.toUpperCase()));
if(razaDePerros.find(raza => raza === "Chihuahua")){
    console.log("La raza si se encontro y es Chihuahua")
    console.log(razaDePerros);
}else{
    razaDePerros.push("Chihuahua");
    console-log("Se agrego Chihuahua al arreglo")
    console.log(razaDePerros);
}


//DOM y sus elementos en HTML