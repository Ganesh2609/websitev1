import express from "express";
import pkg1 from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";

const { json } = pkg1;
const { Pool } = pkg;
dotenv.config();

const app = express();
const port = 5000;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER, // Your PostgreSQL username
  host: process.env.DB_HOST,
  database: process.env.DB_NAME, // The name of your database
  password: process.env.DB_PASSWORD, // Your PostgreSQL password
  port: process.env.DB_PORT || 5432, // Default PostgreSQL port
});

// Middleware
app.use(cors());
app.use(json());

app.post("/api/createUser", async (req, res) => {
  const {username, email, password, phone, role } = req.body;
  console.log(username, email, password, phone, role);
  try {
    // Check if the username already exists
    // Validate the role (optional: you can also enforce this via ENUM in the DB)
    const validRoles = ['admin', 'patient', 'doctor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role provided" });
    }
    const existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (existingUser.rows.length > 0) {
      console.log("User with this username already exists");
      return res.status(400).json({ error: "User with this username already exists" });
    }

    // Hash the password before saving it
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, email, passwordHash, phone, role]
    );

    // Remove sensitive data like password hash before sending the response
    const newUser = result.rows[0];
    delete newUser.password_hash; // Remove password hash from the returned user object

    // Respond with the newly created user (without password)
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Error creating user", err);

    // Generic error response
    res.status(500).json({ error: "Database error" });
  }
});



// Route for user login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists in the database
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    // console.log(result);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the password is correct
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If password is correct, generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET, // Secret key from environment variables
      { expiresIn: "1h" }
    );

    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error("Error logging in", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
