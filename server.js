import express from "express";
import pkg1 from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";
import multer from "multer";

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
  const { user_id } = req.query; // Get userId from the query parameters

  try {
    // Fetch user details from the database using userId
    const result = await pool.query(
      "SELECT user_id, username, role, phone, email FROM users WHERE user_id = $1",
      [user_id]
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

app.get("/api/getPatient", async (req, res) => {
  const { patient_id } = req.query; // Get userId from the query parameters

  try {
    // Fetch user details from the database using userId
    const result = await pool.query(
      "SELECT p.patient_id, p.user_id, p.fname, p.lname, p.email, p.phone, u.username FROM patients p JOIN users u ON p.user_id = u.user_id WHERE p.patient_id = $1",
      [patient_id]
    );

    const patient = result.rows[0];
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Send user data as response
    res.json({
      patient_id: patient.patient_id,
      user_id: patient.user_id,
      fname: patient.fname,
      lname: patient.lname,

      username: patient.username,
      phone: patient.phone,
      email: patient.email,
    });
  } catch (err) {
    console.error("Error fetching Patient data", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/getDoctor", async (req, res) => {
  const { doctor_id } = req.query;

  try {
    const result = await pool.query(
      "SELECT doctor_id, first_name, last_name FROM doctors WHERE doctor_id = $1",
      [doctor_id]
    );

    const doctor = result.rows[0];
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      doctor_id: doctor.doctor_id,
      first_name: doctor.first_name,
      last_name: doctor.last_name,
    });
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/getrequests/date", async (req, res) => {
  const { request_id } = req.query;

  try {
    const result = await pool.query(
      "SELECT preferred_date FROM appointment_requests WHERE request_id = $1",
      [request_id]
    );

    const preferred_date = result.rows[0]?.preferred_date;
    if (!preferred_date) {
      return res.status(404).json({ message: "No preferred date found" });
    }

    res.json({date: preferred_date });
  } catch (error) {
    console.error("Error fetching preferred date:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/getrequests/starttime", async (req, res) => {
  const { slot_id } = req.query;

  try {
    const result = await pool.query(
      "SELECT start_time FROM appointment_slots WHERE slot_id = $1",
      [slot_id]
    );

    const start_time = result.rows[0]?.start_time;
    if (!start_time) {
      return res.status(404).json({ message: "No start time found" });
    }

    res.json({start_time });
  } catch (error) {
    console.error("Error fetching start time:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Handle patient registration
app.post("/api/patients/register",
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
    console.log(req.body);
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

// Get available slots for a doctor on a specific date
app.post("/api/patients/new-appointments/getDates", async (req, res) => {
  let { doctor_id, date } = req.body; // Doctor ID and date will be passed in the request body
  if (!doctor_id || !date) {
    return res.status(400).json({ error: "Missing doctor_id or date" });
  }

  try {
    // Convert the date to 'YYYY-MM-DD' without timezone issues
    const localDate = new Date(date);
    const formattedDate = `${localDate.getFullYear()}-${String(
      localDate.getMonth() + 1
    ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
    console.log(formattedDate);

    // Open a new client connection from the pool
    const client = await pool.connect();

    // Define the SQL query with the formatted date and doctor_id as parameters
    const query = `
      WITH available_slots AS (
        SELECT slot_id, doctor_id, day_of_week, start_time
        FROM appointment_slots
        WHERE doctor_id = $1
        AND day_of_week = TO_CHAR($2::DATE, 'FMDay')
        AND is_available = TRUE
      ),
      unavailable_slots AS (
        SELECT slot_id
        FROM doctor_unavailability
        WHERE doctor_id = $1
        AND unavailable_date = $2::DATE
      ),
      pending_and_approved_slots AS (
        SELECT slot_id
        FROM appointment_requests
        WHERE preferred_date = $2::DATE
        AND preferred_doctor_id = $1
        AND status IN ('pending', 'approved')
      )
      SELECT *
      FROM available_slots
      WHERE slot_id NOT IN (SELECT slot_id FROM unavailable_slots)
      AND slot_id NOT IN (SELECT slot_id FROM pending_and_approved_slots);
    `;

    // Execute the query with the formatted date
    const result = await client.query(query, [doctor_id, formattedDate]);
    
    // Return the available slots
    if (result.rows.length > 0) {
      res.status(200).json({ slots: result.rows });
    } else {
      res.status(200).json({ slots: [], message: "No available slots found" });
    }

    // Release the client back to the pool
    client.release();
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/doctors/active", async (req, res) => {
  try {
    // Open a new client connection from the pool
    const client = await pool.connect();
    console.log("result.rows");
    // Define the SQL query to get all active doctors
    const query = `
      SELECT doctor_id, first_name, last_name 
      FROM doctors
      WHERE status = 'active';
    `;

    // Execute the query
    const result = await client.query(query);
    console.log(result.rows);
    // Return the list of doctors
    res.status(200).json({ doctors: result.rows });

    // Release the client back to the pool
    client.release();
  } catch (error) {
    console.error("Error fetching active doctors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post('/api/appointments', async (req, res) => {
  const {
    userId,
    patient,
    preferredDoctorId,
    preferredDate, // This will now be an ISO string
    slotId,
    reason,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO appointment_requests (
          patient_id,
          preferred_doctor_id,
          preferred_date,
          slot_id,
          reason
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING request_id`,
      [patient, preferredDoctorId, preferredDate, slotId, reason]
    );

    const newAppointment = result.rows[0]; // Get the newly created appointment
    console.log(newAppointment);
    res.status(201).json(newAppointment); // Send the new appointment data back as a response
  } catch (error) {
    console.error('Error saving appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});


app.get('/api/getrequests/:request_id', async (req, res) => {
  const { request_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT asr.request_id, asl.slot_id, asl.day_of_week, asl.start_time, asr.reason, asr.status, d.first_name, d.last_name, asr.preferred_date
        FROM appointment_requests asr
        INNER JOIN appointment_slots asl
        ON asr.slot_id = asl.slot_id
        INNER JOIN doctors d
        ON asr.preferred_doctor_id = d.doctor_id
        WHERE asr.request_id = $1`,
      [request_id]
    );


    const appointment = result.rows[0];
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/recentappointments', async (req, res) => {
  const limit = req.query.limit;

  try {
    const result = await pool.query(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id, a.slot_id, a.request_id, a.status, a.doctor_notes, a.patient_feedback, a.created_at
      FROM appointments a
      ORDER BY a.created_at DESC
      ${limit ? `LIMIT ${limit}` : ''}`,
    );

    const appointments = result.rows;
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching recent appointments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
