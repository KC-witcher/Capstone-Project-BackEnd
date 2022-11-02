const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1Gurus@ikrishna",
  database: "ePlanner_DB",
});

module.exports = db;
