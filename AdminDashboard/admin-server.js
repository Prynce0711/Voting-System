const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection config
const dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "",
  port: 3306,
  database: "prynceindiv",
};

// Admin registration endpoint
app.post("/api/admin/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);

    // Check if username or email exists
    const [rows] = await conn.execute(
      "SELECT * FROM admins WHERE username = ? OR email = ?",
      [username, email],
    );
    if (rows.length > 0) {
      await conn.end();
      return res
        .status(400)
        .json({ message: "Username or email already exists!" });
    }

    // Insert new admin
    await conn.execute(
      "INSERT INTO admins (username, email, password) VALUES (?, ?, ?)",
      [username, email, password],
    );
    await conn.end();
    res.json({ message: "Registration successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error!" });
  }
});

// Admin login endpoint
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT * FROM admins WHERE username = ? AND password = ?",
      [username, password],
    );
    await conn.end();
    if (rows.length > 0) {
      res.json({ message: "Login successful!" });
    } else {
      res.status(401).json({ message: "Invalid username or password!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error!" });
  }
});

app.listen(3001, () => {
  console.log("Admin server running on http://127.0.0.1:3001");
});
