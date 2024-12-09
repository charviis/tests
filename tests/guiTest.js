const { Builder, By } = require("selenium-webdriver");
const colors = require("ansi-colors");
const fs = require("fs");
const readline = require("readline");
const chrome = require("selenium-webdriver/chrome");
const fetch = require("node-fetch"); // Přidání node-fetch

let options = new chrome.Options();
options.addArguments("--disable-gpu");
options.addArguments("--disable-software-rasterizer");
options.addArguments("--use-gl=swiftshader");
options.addArguments("--disable-dev-shm-usage");
options.addArguments("--headless");


const TEST_URL = "https://webtesting.free.beeceptor.com"; // Zadaná URL pro testy
const API_URL = "https://webtesting.free.beeceptor.com"; // Příklad URL API pro fetch test

async function runGUITests() {
    console.log(colors.blue("\n=== Spouštím GUI testy ===\n"));
    let driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    const testLog = []; // Pole pro ukládání výsledků testů

    // Nastavení zachytávání klávesnice
    listenForEscape(() => {
        console.log(colors.red("\n✗ Testy byly přerušeny uživatelem (Escape)."));
        driver.quit().finally(() => process.exit(0));
    });

    try {
        // Test 1: Otevření stránky
        await logTest(testLog, "[TEST] Načtení stránky", async () => {
            await driver.get(TEST_URL);
        });

        // Test 2: Kontrola existence formuláře
        await logTest(testLog, "[TEST] Kontrola existence formuláře (#myForm)", async () => {
            await driver.findElement(By.css("#myForm"));
        });

        // Test 3: Kontrola existence tlačítka "Odeslat"
        await logTest(testLog, "[TEST] Kontrola existence tlačítka 'Odeslat'", async () => {
            await driver.findElement(By.css("button[type='submit']"));
        });

        // Test 4: Kontrola nadpisu stránky
        await logTest(testLog, "[TEST] Kontrola nadpisu stránky", async () => {
            const title = await driver.getTitle();
            if (!title) throw new Error("Nadpis stránky nebyl nalezen.");
        });

        // Test 5: Viditelnost prvku s faktem
        await logTest(testLog, "[TEST] Kontrola viditelnosti prvku s faktem (.fact-display)", async () => {
            const factElement = await driver.findElement(By.css(".fact-display"));
            const isDisplayed = await factElement.isDisplayed();
            if (!isDisplayed) throw new Error("Element není viditelný.");
        });

        // Test 6: Fetch API test
        await logTest(testLog, "[TEST] API Fetch na " + API_URL, async () => {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`API odpovědělo s chybovým stavem: ${response.status}`);
            }
            const data = await response.json();
            if (!data || !data.fact) {
                throw new Error("API nevrátilo očekávaná data.");
            }
        });
    } catch (err) {
        console.error(colors.red("✗ Chyba během provádění testů: " + err.message));
        saveErrorToFile(err);
    } finally {
        await driver.quit();
    }

    // Výpis všech provedených testů
    console.log(colors.blue("\n=== Přehled všech testů ==="));
    let failedTests = 0;
    testLog.forEach(({ description, result, error }) => {
        if (result === "PASSED") {
            console.log(colors.green(`✓ ${description}`));
        } else {
            failedTests++;
            console.log(colors.red(`✗ ${description} - Chyba: ${error}`));
        }
    });

    // Shrnutí na konci
    if (failedTests === 0) {
        console.log(colors.green("\n=== Všechny testy byly úspěšné ===\n"));
    } else {
        console.log(colors.red(`\n=== ${failedTests} test(y) selhal(y) ===\n`));
    }
}

async function logTest(testLog, description, testFn) {
    try {
        await testFn();
        testLog.push({ description, result: "PASSED" });
    } catch (err) {
        testLog.push({ description, result: "FAILED", error: err.message });
        console.error(colors.red(`✗ ${description} - Chyba: ${err.message}`)); // Okamžitý výpis selhání
    }
}

function saveErrorToFile(error) {
    const errorData = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
    };

    const filePath = "errors.json";
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
