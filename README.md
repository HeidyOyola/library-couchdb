
# Digital Library - Apache CouchDB

## 1. Project Description

Digital Library is a web application developed to demonstrate how Apache CouchDB works as a NoSQL database.

The application allows users to register, view, update, and delete books through a simple web interface.

Book information is stored in CouchDB as JSON documents.

## 2. Technologies Used

- Apache CouchDB 3.5.3
- Node.js
- Express.js
- HTML5
- CSS3
- JavaScript
- dotenv
- Fauxton

## 3. Project Structure

```text
biblioteca-couchdb/
|-- index.html
|-- style.css
|-- main.js
|-- server.js
|-- package.json
|-- package-lock.json
|-- .env
|-- .gitignore
|-- README.md
```

The `node_modules` directory is generated when installing dependencies.

## 4. Database Configuration

The application uses a CouchDB database named:

`biblioteca`

Each book is stored as a JSON document.

Example:

```json
{
  "title": "Sense and Sensibility",
  "author": "Jane Austen",
  "genre": "Romance",
  "year": 1811,
  "available": true
}
```

CouchDB automatically generates the document identifier (`_id`) and revision (`_rev`).

## 5. Installation

### Requirements

- Apache CouchDB installed and running
- Node.js and npm installed

### Steps

1. Open the project folder in Visual Studio Code.
2. Open the integrated terminal.
3. Install the dependencies:

```bash
npm install
```

On Windows PowerShell, use `npm.cmd install` if script execution is restricted.

4. Create a `.env` file in the project root:

```env
PORT=3000
COUCHDB_URL=http://127.0.0.1:5984
COUCHDB_DATABASE=biblioteca
COUCHDB_USERNAME=admin
COUCHDB_PASSWORD=YOUR_PASSWORD_HERE
```

5. Replace `YOUR_PASSWORD_HERE` with the CouchDB administrator password.
6. Open Fauxton at `http://127.0.0.1:5984/_utils/`.
7. Create the `biblioteca` database if it does not already exist.
8. Start the application:

```bash
node server.js
```

9. Open the application in a browser:

`http://127.0.0.1:3000`

## 6. CRUD Operations

### CREATE

Users can register new books using the form.

### READ

The application retrieves and displays books stored in CouchDB.

### UPDATE

Users can edit book information and change availability.

### DELETE

Users can delete books from the database.

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/status | Check database connection |
| GET | /api/books | Retrieve all books |
| POST | /api/books | Create a book |
| PUT | /api/books/:id | Update a book |
| DELETE | /api/books/:id | Delete a book |

## 8. Database Connection

The application uses an Express server to communicate with CouchDB through its REST API.

The server reads the CouchDB credentials from environment variables.

The frontend sends requests to the Express API, which performs database operations.

## 9. Testing

The following operations were tested:

- Creating a book from the web interface.
- Retrieving stored books.
- Updating book availability.
- Deleting a book.
- Verifying changes in Fauxton.

## 10. Security

The `.env` file contains local database credentials and must not be shared.

The `.gitignore` file excludes `.env` and `node_modules` from version control.

The application is intended for a local educational demonstration, not for public deployment.

## 11. Conclusion

This project demonstrates how Apache CouchDB can be integrated with a web application using Node.js and Express.

It shows how JSON documents and REST API requests can be used to manage information through CRUD operations.
