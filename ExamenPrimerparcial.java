import java.util.Scanner;

public class ExamenPrimerparcial {

    public static String datosAlumno = "Aún no se han capturado datos.";

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int opcion = 0;

        do {
            System.out.println("\n********** MENÚ PRINCIPAL **********");
            System.out.println("1. Ingresar Datos Personales");
            System.out.println("2. Calcular Volúmenes (Elegir Figura)");
            System.out.println("3. Mostrar Información Registrada");
            System.out.println("4. Salir");
            System.out.print("Seleccione una opción: ");

            if (sc.hasNextInt()) {
                opcion = sc.nextInt();
                switch (opcion) {
                    case 1: 
                        ApartadoDatos(); 
                        break;
                    case 2: 
                        ApartadoVolumenes(); 
                        break;
                    case 3: 
                        System.out.println("\n--- REPORTE ---");
                        System.out.println(datosAlumno); 
                        break;
                    case 4:     
                        System.out.println("====== Programa Finalizado ======"); 
                            break;
                    default: 
                    System.out.println("Error: Opción no válida.");
                }
            } else {
                System.out.println("Error: Ingrese un número entero.");
                sc.next(); 
            }
        } while (opcion != 4);
    }

    public static void ApartadoDatos() {
        Scanner sc = new Scanner(System.in);
        System.out.println("\n[REGISTRO DE DATOS]");
        System.out.print("Apellido Paterno: ");
        String apP = sc.nextLine();
        System.out.print("Apellido Materno: ");
        String apM = sc.nextLine();
        System.out.print("Nombre: ");
        String nom = sc.nextLine();
        System.out.print("Fecha de Nacimiento: ");
        String fec = sc.nextLine();

        datosAlumno = "NOMBRE: " + nom + " " + apP + " " + apM + "\nFECHA: " + fec;
        System.out.println(">> Datos guardados.");
    }

    public static void ApartadoVolumenes() {
        Scanner sc = new Scanner(System.in);
        int seleccion = 0;

        System.out.println("\n--- SELECCIÓN DE FIGURA ---");
        System.out.println("1. Cilindro");
        System.out.println("2. Cono");
        System.out.print("Elija una opción: ");

        if (sc.hasNextInt()) {
            seleccion = sc.nextInt();
        } else {
            System.out.println("Error: Selección inválida.");
            return;
        }

        double r = 0, h = 0;
        
        System.out.print("Ingrese el radio: ");
        if (sc.hasNextDouble()) {
            r = sc.nextDouble();
        } else {
            System.out.println("Error: Debe ser un número numérico.");
            return;
        }

        System.out.print("Ingrese la altura: ");
        if (sc.hasNextDouble()) {
            h = sc.nextDouble();
        } else {
            System.out.println("Error: Debe ser un número numérico.");
            return;
        }

        if (seleccion == 1) {
            double v = 3.1416 * (r * r) * h;
            System.out.printf("El volumen del Cilindro es: %.2f\n", v);
        } else if (seleccion == 2) {
            double v = (3.1416 * (r * r) * h) / 3;
            System.out.printf("El volumen del Cono es: %.2f\n", v);
        } else {
            System.out.println("Error: Figura no disponible.");
        }
    }
}