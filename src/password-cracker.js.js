const fs = require("fs"); // Importar el módulo fs para trabajar con archivos

const possibleCharacters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
const minLength = 13; // Longitud mínima de la contraseña
const maxLength = 20; // Longitud máxima de la contraseña

// Hash almacenado en la base de datos (el que quieres comprobar)
const hashInDb = "$P$Bon6n4VFk2zIVbO4BU46G7r.zxiEhL/";

// Base de inicio para la prueba de contraseñas (empezará desde aquí)
const startCombination = "aaaanU98acLN8";

// Función para escribir en el archivo log.txt
function writeLog(message) {
    fs.appendFileSync("log.txt", message + "\n", "utf8");
}

// Sobrescribimos console.log para registrar en el archivo además de la consola
const originalConsoleLog = console.log;
console.log = function (...args) {
    const message = args.join(" ");
    originalConsoleLog(...args); // Mostrar en la consola
    writeLog(message); // Escribir en log.txt
};

// Función para generar combinaciones
async function testCombinations(base, possibleCharacters, length) {
    if (length === 0) {
        if (await comparePassword(base, hashInDb)) {
            console.log(`¡Contraseña encontrada!: ${base}`);
            process.exit();
        }
        return;
    }

    for (let i = 0; i < possibleCharacters.length; i++) {
        await testCombinations(
            base + possibleCharacters[i],
            possibleCharacters,
            length - 1
        );
    }
}

// Función para simular la comparación de contraseñas
async function comparePassword(password, hash) {
    console.log(`Probar contraseña: ${password}`);
    return false; // Actualmente, esta función siempre devuelve false
}

// Función para iniciar desde la combinación dada
async function startFromBase(base) {
    for (let length = base.length; length <= maxLength; length++) {
        console.log(`Probar contraseñas de longitud ${length}`);
        await testCombinations(base, possibleCharacters, length - base.length);
    }
}

// Iniciar el script desde la combinación base
startFromBase(startCombination);
