const runServerTests = require("./serverTest");
const runGUITests = require("./guiTest");

// Funkce pro barevné logování
function logWithColor(color, message) {
    const colors = {
        blue: "\x1b[34m",
        green: "\x1b[32m",
        red: "\x1b[31m",
        yellow: "\x1b[33m",
        reset: "\x1b[0m",
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Funkce pro spuštění všech testů
async function runTests() {
    let guiDriver; // Získáme driver pro GUI testy
    let allTestsPassed = true;

    try {
        logWithColor("blue", "\n=== Spouštím testy ===\n");

        // Spuštění serverových testů
        await runServerTests();

        // Spuštění GUI testů
        guiDriver = await runGUITests();
    } catch (error) {
        allTestsPassed = false;
        logWithColor("red", `Chyba při provádění testů: ${error}`);
    } finally {
        if (guiDriver) {
            await guiDriver.quit(); // Zavřeme okno prohlížeče, pokud bylo vytvořeno
            logWithColor("yellow", "Testovací okno prohlížeče bylo zavřeno.");
        }

        if (allTestsPassed) {
            logWithColor("green", "\n=== Všechny testy dokončeny úspěšně ===");
        } else {
            logWithColor("red", "\n=== Některé testy selhaly ===");
            process.exit(1); // Ukončení procesu s chybovým kódem
        }
    }
}

// Spuštění všech testů
runTests();
