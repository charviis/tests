const { Builder, By } = require("selenium-webdriver");
const colors = require("ansi-colors");
const fs = require("fs");
const readline = require("readline");
const chrome = require("selenium-webdriver/chrome");
const axios = require("axios");
const runServerTests = require("./serverTest"); // Import serverových testů

let options = new chrome.Options();
options.addArguments("--disable-gpu"); // Zakáže GPU akceleraci
options.addArguments("--disable-software-rasterizer"); // Zakáže SW rasterizaci
options.addArguments("--headless"); // Pokud testuješ bez UI

const TEST_URL = "https://catfact.ninja/"; // Zadaná URL pro testy
const TEST_API = "https://catfact.ninja/fact"; // API pro náhodný fakt o kočkách

async function runGUITests() {
    let driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    const testLog = []; // Pole pro ukládání výsledků testů

    // Nastavení zachytávání klávesnice
    listenForEscape(() => {
        console.log(colors.red("\n✗ Testy byly přerušeny uživatelem (Escape)."));
        driver.quit().finally(() => process.exit(0));
    });

    try {
        // GUI Testy
        await logTest(testLog, "[TEST] Načtení stránky", async () => {
            await driver.get(TEST_URL);
        });

        await logTest(testLog, "[TEST] Kontrola existence formuláře (#myForm)", async () => {
            await driver.findElement(By.css("#myForm"));
        });

        await logTest(testLog, "[TEST] Kontrola existence tlačítka 'Odeslat'", async () => {
            await driver.findElement(By.css("button[type='submit']"));
        });

        await logTest(testLog, "[TEST] Kontrola nadpisu stránky", async () => {
            const title = await driver.getTitle();
            if (!title) throw new Error("Nadpis stránky nebyl nalezen.");
        });

        await logTest(testLog, "[TEST] Kontrola viditelnosti prvku s faktem (.fact-display)", async () => {
            const factElement = await driver.findElement(By.css(".fact-display"));
            const isDisplayed = await factElement.isDisplayed();
            if (!isDisplayed) throw new Error("Element není viditelný.");
        });

        // Výpis faktů o kočkách z API
        await logTest(testLog, "[TEST] Získání náhodného faktu o kočkách z API", async () => {
            await displayCatFact();
        });

        // Spuštění serverových testů
        await runServerTests(testLog);
    } catch (err) {
        console.error(colors.red("✗ Chyba během provádění testů: " + err.message));
        saveErrorToFile(err);
    } finally {
        await driver.quit();
    }

    // Výpis všech provedených testů
    let failedTests = 0;
    testLog.forEach(({ description, result, error }) => {
        if (result === "PASSED") {
            console.log(colors.green(`✓ ${description}`));
        } else {
            failedTests++;
            console.error(colors.red(`✗ ${description} - Chyba: ${error}`));
        }
    });

    // Shrnutí na konci
    if (failedTests === 0) {
        console.log(colors.green("\n=== Všechny testy byly úspěšné ===\n"));
    } else {
        console.log(colors.red(`\n=== ${failedTests} test(y) selhal(y) ===\n`));
    }
}

async function displayCatFact() {
    try {
        const response = await axios.get(TEST_API);
        if (response.data && response.data.fact) {
            console.log(colors.green(`Kočičí fakt: ${response.data.fact}`));
        } else {
            throw new Error("Nepodařilo se získat fakt o kočkách.");
        }
    } catch (error) {
        console.error(colors.red("✗ Chyba při získávání kočičího faktu z API: " + error.message));
        saveErrorToFile(error); // Uložení chyby do souboru
    }
}

async function logTest(testLog, description, testFn) {
    try {
        await testFn();
        testLog.push({ description, result: "PASSED" });
    } catch (err) {
        testLog.push({ description, result: "FAILED", error: err.message });
        saveErrorToFile(err); // Uložení chyby do souboru
    }
}

function saveErrorToFile(error) {
    const errorData = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
    };

    const filePath = "./reports/errors.json";
    let errors = [];

    // Načtení existujících chyb (pokud soubor existuje)
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        try {
            errors = JSON.parse(fileContent);
        } catch (parseErr) {
            console.error(colors.yellow("⚠️  Nepodařilo se načíst existující errors.json, bude přepsán."));
        }
    }

    // Přidání nové chyby
    errors.push(errorData);

    // Uložení do souboru
    fs.writeFileSync(filePath, JSON.stringify(errors, null, 2), "utf-8");
    console.log(colors.green("✓ Chyba byla podrobně uložena do errors.json."));
}

function listenForEscape(onEscape) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();

    process.stdin.on("data", (key) => {
        if (key.toString() === "\u001b") { // Escape key
            onEscape();
            rl.close();
        }
    });
}

module.exports = runGUITests;
