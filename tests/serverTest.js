const axios = require("axios");

const BASE_URL = "https://catfact.ninja/"; // Změň podle svého API

// Funkce pro nativní stylování konzole
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

// Funkce pro logování výsledků
function logResult(endpoint, method, success, details = "") {
    const status = success ? "✓ SUCCESS" : "✗ FAILED";
    const color = success ? "green" : "red";

    logWithColor(color, `[${method}] ${endpoint} - ${status}`);
    if (!success && details) {
        logWithColor("yellow", `   Details: ${details}`);
    }
}

// Test jednotlivých endpointů
async function testEndpoint(endpoint, method, data = null, expectedStatus = 200) {
    try {
        const config = { method, url: `https://webtesting.free.beeceptor.com`, data };
        const response = await axios(config);

        if (response.status === expectedStatus) {
            logResult(endpoint, method, true);
        } else {
            logResult(endpoint, method, false, `Expected ${expectedStatus}, got ${response.status}`);
        }
    } catch (error) {
        const statusCode = error.response ? error.response.status : "No response";
        logResult(endpoint, method, false, `Error: ${statusCode}`);
    }
}

// Spuštění všech testů
async function runServerTests() {
    logWithColor("blue", "\n=== Spouštím serverové testy ===\n");

    // Přidání testů pro různé scénáře
    await testEndpoint("/api/users", "GET", null, 200); // Ověření, že získáme uživatele
    await testEndpoint("/api/users/1", "GET", null, 200); // Ověření, že uživatel s ID 1 existuje
    await testEndpoint("/api/users", "POST", { name: "Test User", age: 30 }, 201); // Přidání nového uživatele
    await testEndpoint("/api/users/999", "GET", null, 404); // Ověření, že neexistující uživatel vrací 404
    await testEndpoint("/api/users/1", "DELETE", null, 204); // Smazání uživatele

    logWithColor("blue", "\n=== Testování dokončeno ===");
}

module.exports = runServerTests;
