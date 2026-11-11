
/* ==========================================
   DIGITAL LIBRARY - APACHE COUCHDB
   CRUD Operations
========================================== */

const API_URL = "/api/books";

const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const message = document.getElementById("message");
const saveButton = document.getElementById("saveButton");

const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const genreInput = document.getElementById("genre");
const yearInput = document.getElementById("year");
const availableInput = document.getElementById("available");

let editingBookId = null;
let currentBooks = [];

// Display a message
function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#c44d69" : "#6b9b70";
}

// Make an API request
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Convert older Spanish fields to English
function normalizeBook(book) {
  return {
    ...book,
    title: book.title ?? book.titulo ?? "",
    author: book.author ?? book.autor ?? "",
    genre: book.genre ?? book.genero ?? "",
    year: book.year ?? book.anio ?? "",
    available: book.available ?? book.disponible ?? true
  };
}

// Create a table cell safely
function createCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = String(value);
  row.appendChild(cell);
  return cell;
}

// Load all books
async function loadBooks() {
  try {
    bookList.innerHTML = "";

    const data = await apiRequest(API_URL);

    currentBooks = data.map(normalizeBook);

    if (currentBooks.length === 0) {
      const row = document.createElement("tr");
      const cell = createCell(
        row,
        "No hay libros registrados."
      );
      cell.colSpan = 6;
      bookList.appendChild(row);
      return;
    }

    currentBooks.forEach(book => {
      const row = document.createElement("tr");

      createCell(row, book.title);
      createCell(row, book.author);
      createCell(row, book.genre);
      createCell(row, book.year);
      createCell(
        row,
        book.available ? "Disponible" : "Prestado"
      );

      const actionsCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.className = "edit-button";
      editButton.addEventListener("click", () => {
        editBook(book._id);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar";
      deleteButton.className = "delete-button";
      deleteButton.addEventListener("click", () => {
        deleteBook(book._id);
      });

      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);
      row.appendChild(actionsCell);

      bookList.appendChild(row);
    });

  } catch (error) {
    showMessage(error.message, true);

    bookList.innerHTML = "";

    const row = document.createElement("tr");
    const cell = createCell(
      row,
      "No se pudieron cargar los libros."
    );
    cell.colSpan = 6;
    bookList.appendChild(row);
  }
}

// Read book information from the form
function getFormData() {
  return {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    genre: genreInput.value.trim(),
    year: Number(yearInput.value),
    available: availableInput.value === "true"
  };
}

// Create or update a book
bookForm.addEventListener("submit", async event => {
  event.preventDefault();

  const bookData = getFormData();

  if (
    !bookData.title ||
    !bookData.author ||
    !bookData.genre ||
    !Number.isInteger(bookData.year) ||
    bookData.year < 1
  ) {
    showMessage("Completa los datos correctamente.", true);
    return;
  }

  saveButton.disabled = true;

  try {
    if (editingBookId) {
      await apiRequest(
        `${API_URL}/${encodeURIComponent(editingBookId)}`,
        {
          method: "PUT",
          body: JSON.stringify(bookData)
        }
      );

      showMessage("Libro actualizado correctamente.");
    } else {
      await apiRequest(API_URL, {
        method: "POST",
        body: JSON.stringify(bookData)
      });

      showMessage("Libro registrado correctamente.");
    }

    resetForm();
    await loadBooks();

  } catch (error) {
    showMessage(error.message, true);
  } finally {
    saveButton.disabled = false;
  }
});

// Fill the form with an existing book
function editBook(id) {
  const book = currentBooks.find(item => item._id === id);

  if (!book) {
    showMessage("No se encontró el libro.", true);
    return;
  }

  editingBookId = id;

  titleInput.value = book.title;
  authorInput.value = book.author;
  genreInput.value = book.genre;
  yearInput.value = book.year;
  availableInput.value = String(book.available);

  saveButton.textContent = "Actualizar libro";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Delete a book
async function deleteBook(id) {
  const confirmed = confirm(
    "¿Estás segura de que quieres eliminar este libro?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );

    if (editingBookId === id) {
      resetForm();
    }

    showMessage("Libro eliminado correctamente.");
    await loadBooks();

  } catch (error) {
    showMessage(error.message, true);
  }
}

// Clear the form
function resetForm() {
  bookForm.reset();
  editingBookId = null;
  saveButton.textContent = "Guardar libro";
}

// Load books when the page opens
loadBooks();
