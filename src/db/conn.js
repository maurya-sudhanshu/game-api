var mysql = require("mysql");
const con = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "game_prediction",
  multipleStatements:true
});
con.getConnection((err) => {
  if (err) throw err;
  console.log("Database Connected");
});
module.exports = con;
