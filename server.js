import express from "express";
import pkg1 from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";
import multer from "multer";
import path from "path";

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

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.post("/api/createUser", async (req, res) => {
  const { username, email, password, phone, role } = req.body;
  console.log(username, email, password, phone, role);
  try {
    // Check if the username already exists
    // Validate the role (optional: you can also enforce this via ENUM in the DB)
    const validRoles = ["admin", "patient", "doctor"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role provided" });
    }
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      console.log("User with this username already exists");
      return res
        .status(400)
        .json({ error: "User with this username already exists" });
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
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Error creating user", err);

    // Generic error response
    res.status(500).json({ error: "Database error" });
  }
});

// Route for user login
app.post("/api/login", async (req, res) => {
  // Changed to POST
  const { username, password } = req.body;

  try {
    // Check if user exists in the database
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
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

// getUser Endpoint
app.get("/api/getUser", async (req, res) => {
  const { userId } = req.query; // Get userId from the query parameters

  try {
    // Fetch user details from the database using userId
    const result = await pool.query(
      "SELECT user_id, username, role, phone, email FROM users WHERE user_id = $1",
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send user data as response
    res.json({
      user_id: user.user_id,
      username: user.username,
      phone: user.phone,
      email: user.email,
    });
  } catch (err) {
    console.error("Error fetching user data", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Handle patient registration
app.post(
  "/api/patients/register",
  upload.single("identificationDocument"),
  async (req, res) => {
    const {
      user_id,
      fname,
      lname,
      birthDate,
      gender,
      address,
      phone,
      email,
      emergencyContactName,
      emergencyContactNumber,
      occupation,
      primaryPhysician,
      insuranceProvider,
      insurancePolicyNumber,
      allergies,
      currentMedication,
      familyMedicalHistory,
      pastMedicalHistory,
      identificationType,
      identificationNumber,
      treatmentConsent,
      privacyConsent,
      disclosureConsent,
    } = req.body;
    console.log(req.body)
    const identificationDocumentUrl = req.file ? req.file.path : null;
    try {
      // Insert the new patient into the database
      const insertPatientQuery = `
      INSERT INTO patients (
        user_id, fname, lname, date_of_birth, gender, address, phone, email,
        emergency_contact_name, emergency_contact_number, occupation, primary_physician,
        insurance_provider, insurance_policy_number, identification_type, identification_number,
        identification_document_url, allergies, current_medications, family_medical_history,
        past_medical_history, treatment_consent, privacy_consent, disclosure_consent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *;
    `;
      console.log("gender", [
        user_id,
        fname,
        lname,
        birthDate,
        gender,
        address,
        phone,
        email,
        emergencyContactName,
        emergencyContactNumber,
        occupation,
        primaryPhysician,
        insuranceProvider,
        insurancePolicyNumber,
        identificationType,
        identificationNumber,
        identificationDocumentUrl,
        allergies,
        currentMedication,
        familyMedicalHistory,
        pastMedicalHistory,
        treatmentConsent,
        privacyConsent,
        disclosureConsent,
      ]);
      const newPatient = await pool.query(insertPatientQuery, [
        user_id,
        fname,
        lname,
        birthDate,
        gender,
        address,
        phone,
        email,
        emergencyContactName,
        emergencyContactNumber,
        occupation,
        primaryPhysician,
        insuranceProvider,
        insurancePolicyNumber,
        identificationType,
        identificationNumber,
        identificationDocumentUrl,
        allergies,
        currentMedication,
        familyMedicalHistory,
        pastMedicalHistory,
        treatmentConsent,
        privacyConsent,
        disclosureConsent,
      ]);

      res.status(201).json(newPatient.rows[0]);
    } catch (error) {
      console.error("Error registering patient", error);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
