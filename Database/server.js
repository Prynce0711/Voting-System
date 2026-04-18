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
  // Use your actual database name
  database: "prynceindiv",
};

// Registration endpoint
app.post("/api/register", async (req, res) => {
  const { username, password, fullname, address, gender } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);

    // Check if username exists
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );
    if (rows.length > 0) {
      await conn.end();
      return res.status(400).json({ message: "Username already exists!" });
    }

    // Insert new user
    await conn.execute(
      "INSERT INTO users (username, password, fullname, address, gender) VALUES (?, ?, ?, ?, ?)",
      [username, password, fullname, address, gender],
    );
    await conn.end();
    res.json({ message: "Registration successful!" });
  } catch (err) {
    res.status(500).json({ message: "Database error!" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
    );
    await conn.end();
    if (rows.length > 0) {
      res.json({ message: "Login successful!" });
    } else {
      res.status(401).json({ message: "Invalid username or password!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Database error!" });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM users");
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error!" });
  }
});

// Update user info
app.put("/api/users/:id", async (req, res) => {
  const { fullname, address, gender } = req.body;
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      "UPDATE users SET fullname = ?, address = ?, gender = ? WHERE id = ?",
      [fullname, address, gender, id],
    );
    await conn.end();
    res.json({ message: "User updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error!" });
  }
});

// Delete user
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute("DELETE FROM users WHERE id = ?", [id]);
    await conn.end();
    res.json({ message: "User deleted!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error!" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://127.0.0.1:3000");
});
