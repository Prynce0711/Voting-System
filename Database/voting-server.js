const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "",
  port: 3306,
  database: "prynceindiv",
};

// Cast a vote
app.post("/api/vote", async (req, res) => {
  const { votes } = req.body; // votes: [{candidateId, position}]
  try {
    const conn = await mysql.createConnection(dbConfig);
    for (const v of votes) {
      await conn.execute(
        "INSERT INTO votes (candidate_id, position) VALUES (?, ?)",
        [v.candidateId, v.position],
      );
    }
    await conn.end();
    res.json({ message: "Vote(s) recorded!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error!" });
  }
});

// Get results
app.get("/api/results", async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(`
            SELECT c.position, c.name, COUNT(v.id) as votes
            FROM candidates c
            LEFT JOIN votes v ON c.id = v.candidate_id
            GROUP BY c.id
            ORDER BY c.position, votes DESC
        `);
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error!" });
  }
});

app.listen(3003, () => {
  console.log("Voting server running on http://127.0.0.1:3003");
});
