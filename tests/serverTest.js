const axios = require("axios");

const BASE_URL = "https://catfact.ninja"; // URL pro Cat Facts API

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

// Funkce pro logování faktu o kočkách
function logCatFact(fact) {
    logWithColor("green", `   Fact: ${fact}`);
}

// Test jednotlivých endpointů
async function testEndpoint(endpoint, method, data = null, expectedStatus = 200) {
    try {
        const config = { method, url: `${BASE_URL}${endpoint}`, data };
        const response = await axios(config);

        if (response.status === expectedStatus) {
            logResult(endpoint, method, true);
            if (endpoint === "/facts") {
                // Pokud je endpoint /facts, vypíšeme náhodný fakt o kočkách
                logCatFact(response.data.fact);
            }
            if (endpoint === "/fact") {
                // Pokud je endpoint /fact, vypíšeme jeden fakt o kočkách
                logCatFact(response.data.fact);
            }
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

    // Testy pro různé endpointy
    await testEndpoint("/facts", "GET", null, 200); // Získání náhodného faktu o kočkách
    await testEndpoint("/fact", "GET", null, 200); // Získání jednoho faktu o kočkách

    logWithColor("blue", "\n=== Testování dokončeno ===");
}

module.exports = runServerTests;
