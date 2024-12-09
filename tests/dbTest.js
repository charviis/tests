const mysql = require("mysql2/promise");

module.exports = async function dbTest() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "testdb",
  });

  try {
    const [rows] = await connection.execute("SELECT * FROM users WHERE active = 1");
    console.log(`✅ Aktivní uživatelé: ${rows.length}`);
  } catch (error) {
    console.error("Chyba při testování databáze:", error);
  } finally {
    await connection.end();
  }
};
