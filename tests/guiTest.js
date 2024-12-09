const { Builder, By } = require("selenium-webdriver");
const colors = require("ansi-colors");

async function runGUITests() {
    console.log(colors.blue("\n=== Spouštím GUI testy ===\n"));
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        // Příklad testů GUI
        await driver.get("https://catfact.ninja/");
        const element = await driver.findElement(By.css("#myForm"));
        console.log(colors.green("✓ Element #myForm byl nalezen"));
    } catch (err) {
        console.error(colors.red("✗ Chyba při testování GUI:"), err);
    } finally {
        await driver.quit();
    }

    console.log(colors.blue("\n=== GUI testy dokončeny ===\n"));
}

module.exports = runGUITests;
