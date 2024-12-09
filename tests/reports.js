const fs = require("fs-extra");

async function saveReport(name, data) {
  await fs.outputFile(`reports/${name}.json`, JSON.stringify(data, null, 2));
  console.log(`Report uložen: reports/${name}.json`);
}
