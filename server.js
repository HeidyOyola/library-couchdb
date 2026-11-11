require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const COUCHDB_URL = process.env.COUCHDB_URL;
const DATABASE = process.env.COUCHDB_DATABASE;
const USERNAME = process.env.COUCHDB_USERNAME;
const PASSWORD = process.env.COUCHDB_PASSWORD;

if (!COUCHDB_URL || !DATABASE || !USERNAME || !PASSWORD) {
  console.error("Missing CouchDB configuration in .env");
  process.exit(1);
}

const authHeader = "Basic " +
  Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");

app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function couchRequest(endpoint, options = {}) {
  const response = await fetch(
    `${COUCHDB_URL}/${encodeURIComponent(DATABASE)}${endpoint}`,
    {
      ...options,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        ...options.headers
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.reason || "CouchDB request failed");
  }

  return data;
}

// Get all books
app.get("/api/books", async (req, res) => {
  try {
    const data = await couchRequest(
      "/_all_docs?include_docs=true"
    );

    const books = data.rows
      .map(row => row.doc)
      .filter(doc => doc && !doc._id.startsWith("_design/"));

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new book
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, genre, year, available } = req.body;

    if (
      !title || !author || !genre ||
      !Number.isInteger(year) ||
      typeof available !== "boolean"
    ) {
      return res.status(400).json({
        error: "Invalid book information"
      });
    }

    const book = {
      title,
      author,
      genre,
      year,
      available
    };

    const result = await couchRequest("", {
      method: "POST",
      body: JSON.stringify(book)
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing book
app.put("/api/books/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const currentBook = await couchRequest(
      `/${encodeURIComponent(id)}`
    );

    const { title, author, genre, year, available } = req.body;

    if (
      !title || !author || !genre ||
      !Number.isInteger(year) ||
      typeof available !== "boolean"
    ) {
      return res.status(400).json({
        error: "Invalid book information"
      });
    }

    const updatedBook = {
      ...currentBook,
      title,
      author,
      genre,
      year,
      available
    };

    const result = await couchRequest(
      `/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedBook)
      }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a book
app.delete("/api/books/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const currentBook = await couchRequest(
      `/${encodeURIComponent(id)}`
    );

    const result = await couchRequest(
      `/${encodeURIComponent(id)}?rev=${encodeURIComponent(currentBook._rev)}`,
      {
        method: "DELETE"
      }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check CouchDB connection
app.get("/api/status", async (req, res) => {
  try {
    const data = await couchRequest("");
    res.json({
      connected: true,
      database: data.db_name
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Library server running at http://127.0.0.1:${PORT}`);
});


