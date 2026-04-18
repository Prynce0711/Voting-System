const path = require("path");
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;

app.use(cors());
app.use(express.json());

["AdminDashboard", "Homepage", "Landing", "Login"].forEach((folder) => {
  app.use(`/${folder}`, express.static(path.join(ROOT_DIR, folder)));
});

function sendPage(relativePath) {
  return (req, res) => {
    res.sendFile(path.join(ROOT_DIR, relativePath));
  };
}

app.get("/", sendPage("index.html"));
app.get("/landing", sendPage(path.join("Landing", "Landing.html")));
app.get("/login", sendPage(path.join("Login", "login.html")));
app.get("/admin/login", sendPage(path.join("Login", "admin-login.html")));
app.get("/home", sendPage(path.join("Homepage", "homepage.html")));
app.get(
  "/admin/dashboard",
  sendPage(path.join("AdminDashboard", "admin dashboard.html")),
);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/register", async (req, res) => {
  const { username, password, fullname, address, gender } = req.body;

  if (!username || !password || !fullname || !address || !gender) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists!" });
    }

    await prisma.user.create({
      data: { username, password, fullname, address, gender },
    });

    return res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { username, password },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password!" });
    }

    return res.json({ message: "Login successful!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullname: true,
        address: true,
        gender: true,
      },
      orderBy: { id: "asc" },
    });

    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { fullname, address, gender } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { fullname, address, gender },
    });

    return res.json({ message: "User updated!" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(500).json({ message: "Database error!" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    return res.json({ message: "User deleted!" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(500).json({ message: "Database error!" });
  }
});

app.post("/api/admin/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Username or email already exists!" });
    }

    await prisma.admin.create({
      data: { username, email, password },
    });

    return res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: { username, password },
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password!" });
    }

    return res.json({ message: "Login successful!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.put("/api/admin", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  try {
    const firstAdmin = await prisma.admin.findFirst({
      orderBy: { id: "asc" },
    });

    if (!firstAdmin) {
      await prisma.admin.create({
        data: {
          username: name,
          email,
          password: "admin1234",
        },
      });
      return res.json({ message: "Admin info created successfully." });
    }

    await prisma.admin.update({
      where: { id: firstAdmin.id },
      data: {
        username: name,
        email,
      },
    });

    return res.json({ message: "Admin info updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.get("/api/candidates", async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });

    return res.json(candidates);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.post("/api/candidates", async (req, res) => {
  const { name, position } = req.body;

  if (!name || !position) {
    return res.status(400).json({ message: "Name and position are required." });
  }

  try {
    const candidate = await prisma.candidate.create({
      data: {
        name,
        position,
      },
    });

    return res
      .status(201)
      .json({ message: "Candidate added successfully!", candidate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.delete("/api/candidates/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid candidate id." });
  }

  try {
    await prisma.candidate.delete({
      where: { id },
    });

    return res.json({ message: "Candidate deleted!" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Candidate not found." });
    }
    return res.status(500).json({ message: "Database error!" });
  }
});

app.post("/api/vote", async (req, res) => {
  const { votes } = req.body;

  if (!Array.isArray(votes) || votes.length === 0) {
    return res.status(400).json({ message: "Votes are required." });
  }

  const preparedVotes = votes
    .map((vote) => ({
      candidateId: Number(vote.candidateId),
      position: String(vote.position || ""),
    }))
    .filter((vote) => Number.isInteger(vote.candidateId) && vote.position);

  if (preparedVotes.length !== votes.length) {
    return res.status(400).json({ message: "Invalid vote payload." });
  }

  try {
    await prisma.vote.createMany({ data: preparedVotes });
    return res.json({ message: "Vote(s) recorded!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.get("/api/results", async (req, res) => {
  try {
    const [candidates, tallies] = await Promise.all([
      prisma.candidate.findMany(),
      prisma.vote.groupBy({
        by: ["candidateId"],
        _count: { _all: true },
      }),
    ]);

    const votesByCandidate = new Map(
      tallies.map((item) => [item.candidateId, item._count._all]),
    );

    const results = candidates
      .map((candidate) => ({
        position: candidate.position,
        name: candidate.name,
        votes: votesByCandidate.get(candidate.id) || 0,
      }))
      .sort((a, b) => {
        const byPosition = a.position.localeCompare(b.position);
        if (byPosition !== 0) {
          return byPosition;
        }

        if (b.votes !== a.votes) {
          return b.votes - a.votes;
        }

        return a.name.localeCompare(b.name);
      });

    const totalVotes = tallies.reduce((sum, item) => sum + item._count._all, 0);

    return res.json({ results, totalVotes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error!" });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
