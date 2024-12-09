const { Builder, By, until } = require("selenium-webdriver");
const colors = require("ansi-colors");
const fs = require("fs");

async function runGUITests() {
    console.log(colors.blue("\n=== Spouštím GUI testy ===\n"));
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        // Otevření stránky
        await driver.get("https://catfact.ninja/");
        console.log(colors.green("✓ Stránka byla načtena."));

        // Test 1: Kontrola existence formuláře
        const formElement = await driver.findElement(By.css("#myForm"));
        console.log(colors.green("✓ Element #myForm byl nalezen."));

        // Test 2: Kontrola existence tlačítka "Odeslat"
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        console.log(colors.green("✓ Tlačítko odeslat bylo nalezeno."));

        // Test 3: Kontrola nadpisu stránky
        const title = await driver.getTitle();
        if (title) {
            console.log(colors.green(`✓ Nadpis stránky byl načten: ${title}`));
        } else {
            throw new Error("Nadpis stránky nebyl nalezen.");
        }

        // Test 4: Kontrola viditelnosti prvku
        const factElement = await driver.findElement(By.css(".fact-display"));
        const isDisplayed = await factElement.isDisplayed();
        if (isDisplayed) {
            console.log(colors.green("✓ Element s faktem je viditelný."));
        } else {
            throw new Error("Element s faktem není viditelný.");
        }

        // Test 5: Odeslání formuláře
        const inputField = await driver.findElement(By.css("#factInput"));
        await inputField.sendKeys("Kočky");
        await submitButton.click();
        console.log(colors.green("✓ Formulář byl úspěšně odeslán."));

        // Test 6: Čekání na změnu obsahu faktu
        await driver.wait(until.elementTextContains(factElement, "Kočky"), 5000);
        console.log(colors.green("✓ Nový fakt byl úspěšně načten."));
    } catch (err) {
        console.error(colors.red("✗ Chyba při testování GUI: Nastala neočekávaná chyba. Detaily uloženy do errors.json."));
        saveErrorToFile(err);
    } finally {
        await driver.quit();
    }

    console.log(colors.blue("\n=== GUI testy dokončeny ===\n"));
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
    console.log(colors.green("✓ Chyba byla uložena do errors.json"));
}

module.exports = runGUITests;
