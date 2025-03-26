const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if username meets basic requirements
    return username && username.length >= 4 && !/\s/.test(username);
}

const authenticatedUser = (username, password) => {
    // Check if user exists and password matches
    return users[username] && users[username].password === password;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const accessToken = jwt.sign(
        { username: username },
        "access", 
        { expiresIn: '1h' }
    );
    
    req.session.authorization = { accessToken };
    return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
// Task 8 - Add/Modify review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;
  
    if (!books[isbn]) {
      return res.status(404).json({message: "Book not found"});
    }
  
    if (!review) {
      return res.status(400).json({message: "Review is required"});
    }
  
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    books[isbn].reviews[username] = review;
    return res.status(200).json({message: "Review added/modified successfully"});
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
  
    if (!books[isbn]) {
      return res.status(404).json({message: "Book not found"});
    }
  
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({message: "Review not found"});
    }
  
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "Review deleted successfully"});
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
