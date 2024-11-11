import express from "express";
import pkg1 from "body-parser";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";
import multer from "multer";

const { json } = pkg1;
const { Pool } = pkg;
dotenv.config();

const app = express();
const port = 5000;

// // PostgreSQL connection pool
// const pool = new Pool({
//   user: process.env.DB_USER, // Your PostgreSQL username
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME, // The name of your database
//   password: process.env.DB_PASSWORD, // Your PostgreSQL password
//   port: process.env.DB_PORT || 5432, // Default PostgreSQL port
// });

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.AZURE_POSTGRESQL_USER, // Your PostgreSQL username
  host: process.env.AZURE_POSTGRESQL_HOST,
  database: process.env.AZURE_POSTGRESQL_DATABASE, // The name of your database
  password: process.env.AZURE_POSTGRESQL_PASSWORD, // Your PostgreSQL password
  port: process.env.AZURE_POSTGRESQL_PORT || 5432, // Default PostgreSQL port
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
      // console.log("User with this username already exists");
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
      return res.json({ message: "Invalid credentials" });
    }

    // Check if the password is correct
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.json({ message: "Invalid credentials" });
    }

    // If the login was successful, the server will return a user_id and a role.
    // We check if these values are present in the response before proceeding.
    if (!user.user_id || !user.role) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // If role is doctor, return doctor_id
    // If role is patient, return patient_id
    let doctorId, patientId;
    if (user.role === "doctor") {
      const doctorResult = await pool.query(
        "SELECT doctor_id FROM doctors WHERE user_id = $1",
        [user.user_id]
      );
      doctorId = doctorResult.rows[0]?.doctor_id;
    } else if (user.role === "patient") {
      const patientResult = await pool.query(
        "SELECT patient_id FROM patients WHERE user_id = $1",
        [user.user_id]
      );
      patientId = patientResult.rows[0]?.patient_id;
    }

    res.json({
      user: {
        user_id: user.user_id,
        role: user.role,
        doctorId,
        patientId,
      },
    });
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

    res.json({ date: preferred_date });
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

    res.json({ start_time });
  } catch (error) {
    console.error("Error fetching start time:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
      // console.log("gender", [
      //   user_id,
      //   fname,
      //   lname,
      //   birthDate,
      //   gender,
      //   address,
      //   phone,
      //   email,
      //   emergencyContactName,
      //   emergencyContactNumber,
      //   occupation,
      //   primaryPhysician,
      //   insuranceProvider,
      //   insurancePolicyNumber,
      //   identificationType,
      //   identificationNumber,
      //   identificationDocumentUrl,
      //   allergies,
      //   currentMedication,
      //   familyMedicalHistory,
      //   pastMedicalHistory,
      //   treatmentConsent,
      //   privacyConsent,
      //   disclosureConsent,
      // ]);
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
    // console.log("getDate", doctor_id, date);
    // Convert the date to 'YYYY-MM-DD' format without timezone issues
    const formattedDate = `${date.year}-${String(date.month).padStart(
      2,
      "0"
    )}-${String(date.day).padStart(2, "0")}`;
    // console.log(formattedDate);

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
    // console.log("result.rows");
    // Define the SQL query to get all active doctors
    const query = `
      SELECT  d.doctor_id, d.user_id, d.first_name, d.last_name, d.years_of_experience, ms.specialization_id, ms.specialization_name, ms.medical_field
      FROM doctors d
      INNER JOIN doctor_specializations ds
      ON d.doctor_id = ds.doctor_id
      INNER JOIN medical_specializations ms
      ON ds.specialization_id = ms.specialization_id
      WHERE d.status = 'active';
    `;

    // Execute the query
    const result = await client.query(query);
    // console.log(result.rows);
    // Return the list of doctors
    res.status(200).json({ doctors: result.rows });

    // Release the client back to the pool
    client.release();
  } catch (error) {
    console.error("Error fetching active doctors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { userId, patient, preferredDoctorId, preferredDate, slotId, reason } =
    req.body;
  const formattedDate = `${preferredDate.year}-${String(
    preferredDate.month
  ).padStart(2, "0")}-${String(preferredDate.day).padStart(2, "0")}`;
  // console.log("preferred_doctor_id", preferredDoctorId);
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
      [patient, preferredDoctorId, formattedDate, slotId, reason]
    );

    const newAppointment = result.rows[0]; // Get the newly created appointment

    // Send notification to the patient
    await pool.query(
      `INSERT INTO notifications (user_id, message, is_read)
       VALUES ($1, $2, $3)`,
      [userId, `Your appointment request has been submitted.`, false]
    );

    // Send notification to the doctor
    const { rows: doctor } = await pool.query(
      `SELECT user_id FROM doctors WHERE doctor_id = $1`,
      [preferredDoctorId]
    );

    // console.log(doctor);
    await pool.query(
      `INSERT INTO notifications (user_id, message, is_read)
       VALUES ($1, $2, $3)`,
      [
        doctor[0].user_id,
        `A new appointment request has been submitted for you.`,
        false,
      ]
    );

    // console.log(newAppointment);
    res.status(201).json(newAppointment); // Send the new appointment data back as a response
  } catch (error) {
    console.error("Error saving appointment:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

app.get("/api/getrequests/:request_id", async (req, res) => {
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
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/getrequestbydoctor/:doctor_id", async (req, res) => {
  let { doctor_id } = req.params;
  // // console.log(doctor_id);
  try {
    const result = await pool.query(
      `SELECT asr.request_id, asl.slot_id, asl.day_of_week, asl.start_time, asr.reason, asr.status, asr.preferred_date, p.fname, p.lname
        FROM appointment_requests asr
        INNER JOIN appointment_slots asl
        ON asr.slot_id = asl.slot_id
        INNER JOIN doctors d
        ON asr.preferred_doctor_id = d.doctor_id
        INNER JOIN patients p
        ON asr.patient_id = p.patient_id
        WHERE asr.preferred_doctor_id = $1
        AND asr.status = 'pending'`,
      [doctor_id]
    );
    // // console.log(result.rows);
    const appointments = result.rows;
    // // console.log(appointments);
    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found" });
    }

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/getrequestbypatient/:patient_id", async (req, res) => {
  let { patient_id } = req.params;
  // console.log(patient_id);
  try {
    const result = await pool.query(
      `SELECT asr.request_id, asl.slot_id, asl.day_of_week, asl.start_time, asr.reason, asr.status, asr.preferred_date, d.first_name, d.last_name
        FROM appointment_requests asr
        INNER JOIN appointment_slots asl
        ON asr.slot_id = asl.slot_id
        INNER JOIN doctors d
        ON asr.preferred_doctor_id = d.doctor_id
        WHERE asr.patient_id = $1
        AND asr.status = 'pending'`,
      [patient_id]
    );
    // // console.log(result.rows);
    const appointments = result.rows;
    // // console.log(appointments);
    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found" });
    }

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/recentappointments", async (req, res) => {
  const limit = req.query.limit;

  try {
    const result = await pool.query(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id, a.slot_id, a.request_id, a.status, a.doctor_notes, a.patient_feedback, a.created_at
      FROM appointments a
      ORDER BY a.created_at DESC
      ${limit ? `LIMIT ${limit}` : ""}`
    );

    const appointments = result.rows;
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching recent appointments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Approve appointment endpoint
app.post("/api/appointments/approve", async (req, res) => {
  const { requestId, doctorId } = req.body;
  const client = await pool.connect();
  // console.log("hiiiiiii");
  try {
    await client.query("BEGIN");
    // console.log(requestId, doctorId);
    // Check if the request exists and is still pending
    const checkRequest = await client.query(
      `SELECT status FROM appointment_requests 
       WHERE request_id = $1 AND preferred_doctor_id = $2`,
      [requestId, doctorId]
    );
    // console.log(checkRequest);
    if (checkRequest.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment request not found",
      });
    }

    if (checkRequest.rows[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Appointment request has already been processed",
      });
    }

    // Update the request status to approved
    await client.query(
      `UPDATE appointment_requests 
       SET status = 'approved', 
           updated_at = CURRENT_TIMESTAMP
       WHERE request_id = $1 AND preferred_doctor_id = $2`,
      [requestId, doctorId]
    );

    // Create a new appointment in the appointments table
    await client.query(
      `INSERT INTO appointments (
        doctor_id, 
        patient_id, 
        date,
        slot_id, 
        reason,
        status,
        request_id
      )
      SELECT 
        $2,
        patient_id,
        preferred_date,
        slot_id,
        reason,
        'scheduled',
        request_id
      FROM appointment_requests
      WHERE request_id = $1`,
      [requestId, doctorId]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Appointment successfully approved",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error approving appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve appointment",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// Reject appointment endpoint
app.post("/api/appointments/reject", async (req, res) => {
  const { requestId, doctorId } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if the request exists and is still pending
    const checkRequest = await client.query(
      `SELECT status FROM appointment_requests 
       WHERE id = $1 AND doctor_id = $2`,
      [requestId, doctorId]
    );

    if (checkRequest.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment request not found",
      });
    }

    if (checkRequest.rows[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Appointment request has already been processed",
      });
    }

    // Update the request status to rejected
    await client.query(
      `UPDATE appointment_requests 
       SET status = 'rejected',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND doctor_id = $2`,
      [requestId, doctorId]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Appointment successfully rejected",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error rejecting appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject appointment",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

app.get("/api/appointments/:doctorId", async (req, res) => {
  const { doctorId } = req.params;
  const client = await pool.connect();

  // console.log("doctorId", doctorId);

  try {
    // First query: Get appointment details
    const appointmentsQuery = `
      SELECT 
        a.appointment_id,
        a.reason,
        a.date,
        a.status,
        a.doctor_notes,
        a.patient_feedback,
        p.fname as patient_first_name,
        p.lname as patient_last_name,
        slots.start_time,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN appointment_slots slots ON a.slot_id = slots.slot_id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.doctor_id = $1 AND a.status = 'scheduled'
      ORDER BY a.date DESC, slots.start_time ASC
    `;

    // Second query: Get status counts
    const countsQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM appointments
      WHERE doctor_id = $1
    `;

    // Execute both queries concurrently
    const [appointmentsResult, countsResult] = await Promise.all([
      client.query(appointmentsQuery, [doctorId]),
      client.query(countsQuery, [doctorId]),
    ]);

    // console.log("appointmentsResult", appointmentsResult.rows);
    // console.log("countsResult", countsResult.rows);

    res.status(200).json({
      success: true,
      appointments: appointmentsResult.rows,
      doctor: {
        first_name: appointmentsResult.rows[0]?.doctor_first_name,
        last_name: appointmentsResult.rows[0]?.doctor_last_name,
      },
      counts: countsResult.rows[0],
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

app.get("/api/appointments/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const client = await pool.connect();

  if (!patientId) {
    return res.status(400).json({
      success: false,
      message: "Patient ID is required",
    });
  }

  // // console.log("patientId", patientId);

  try {
    // First query: Get appointment details
    const appointmentsQuery = `
      SELECT 
        a.appointment_id,
        a.reason,
        a.date,
        a.status,
        a.doctor_notes,
        a.patient_feedback,
        p.fname as patient_first_name,
        p.lname as patient_last_name,
        slots.start_time,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN appointment_slots slots ON a.slot_id = slots.slot_id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.patient_id = $1 AND a.status IN ('scheduled', 'completed')
      ORDER BY a.date DESC, slots.start_time ASC
    `;
    // // console.log("appointmentsQuery", patientId);
    const appointmentsResult = await client.query(appointmentsQuery, [
      patientId,
    ]);
    // // console.log("appointmentsResult", appointmentsResult.rows);
    res.status(200).json({
      success: true,
      appointments: appointmentsResult.rows,
      patient: {
        first_name: appointmentsResult.rows[0]?.patient_first_name,
        last_name: appointmentsResult.rows[0]?.patient_last_name,
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

app.post("/api/appointments/:id/complete", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const {
      doctorNotes,
      billingAmount,
      doctorId,
      treatments, // New field for treatments array
    } = req.body;

    // Validate input
    if (
      !doctorNotes ||
      !billingAmount ||
      !doctorId ||
      !treatments ||
      !Array.isArray(treatments)
    ) {
      // console.log(doctorNotes, billingAmount, doctorId, treatments);
      throw new Error("Missing required fields");
    }

    // 1. Update appointment
    const appointmentResult = await client.query(
      `UPDATE appointments 
       SET status = 'completed',
           doctor_notes = $1
       WHERE appointment_id = $2 AND doctor_id = $3
       RETURNING *`,
      [doctorNotes, id, doctorId]
    );

    if (appointmentResult.rows.length === 0) {
      throw new Error("Appointment not found");
    }

    const appointment = appointmentResult.rows[0];

    // 2. Create treatment history records
    const treatmentPromises = treatments.map((treatment) =>
      client.query(
        `INSERT INTO treatment_history (
          patient_id,
          appointment_id,
          procedure_name,
          procedure_description,
          cost
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          appointment.patient_id,
          id,
          treatment.procedureName,
          treatment.procedureDescription,
          treatment.cost,
        ]
      )
    );

    const treatmentResults = await Promise.all(treatmentPromises);

    // 3. Create billing record
    const billingResult = await client.query(
      `INSERT INTO billing (
         patient_id,
         appointment_id,
         total_amount,
         payment_status
       ) VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [appointment.patient_id, id, billingAmount]
    );

    // 4. Create notification record
    const userResult = await client.query(
      `SELECT user_id FROM patients WHERE patient_id = $1`,
      [appointment.patient_id]
    );
    const user = userResult.rows[0];
    if (!user) {
      throw new Error("User not found for patient");
    }

    await client.query(
      `INSERT INTO notifications (
         user_id,
         message,
         is_read
       ) VALUES ($1, $2, false)`,
      [
        user.user_id,
        `Your appointment has been completed. A bill of $${billingAmount} has been generated.`,
      ]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Appointment completed successfully",
      data: {
        appointment: appointmentResult.rows[0],
        billing: billingResult.rows[0],
        treatments: treatmentResults.map((result) => result.rows[0]),
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error completing appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to complete appointment",
    });
  } finally {
    client.release();
  }
});

// Patient-side appointment cancellation handler
app.post("/api/appointments/:appointmentId/cancel", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { appointmentId } = req.params;
    const { cancellationReason } = req.body;
    // console.log(appointmentId);
    // Validate required fields
    if (!cancellationReason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    // Check if appointment exists and get relevant details
    const appointmentResult = await client.query(
      `SELECT 
                a.*,
                p.user_id as patient_user_id,
                p.fname as patient_first_name,
                p.lname as patient_last_name,
                d.first_name as doctor_first_name,
                d.last_name as doctor_last_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.appointment_id = $1 AND a.status != 'cancelled'`,
      [appointmentId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or already cancelled",
      });
    }

    const appointment = appointmentResult.rows[0];

    // Update appointment status
    await client.query(
      `UPDATE appointments 
            SET 
                status = 'cancelled',
                cancellation_reason = $1
            WHERE appointment_id = $2`,
      [cancellationReason, appointmentId]
    );

    // Create notification for patient
    const notificationMessage = `Your appointment with Dr. ${
      appointment.doctor_first_name
    } ${appointment.doctor_last_name} scheduled for ${new Date(
      appointment.date
    ).toLocaleDateString()} has been cancelled.\n\nReason: ${cancellationReason}`;

    await client.query(
      `INSERT INTO notifications 
            (user_id, message)
            VALUES ($1, $2)`,
      [appointment.patient_user_id, notificationMessage]
    );

    // Commit transaction
    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: {
        appointmentId,
        cancelledAt: new Date(),
        status: "cancelled",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error cancelling appointment:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// Endpoint to get notifications for a specific user
app.get("/api/notifications/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to mark a specific notification as read
app.post("/api/notifications/:notificationId/read", async (req, res) => {
  const { notificationId } = req.params;
  const { userId } = req.body;

  try {
    // Verify if the notification exists for the given user and mark it as read
    const result = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE notification_id = $1 AND user_id = $2 RETURNING *",
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to select doctors for deletion
app.get("/api/deleteDoctorsFetch", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT doctor_id, first_name, last_name, license_number, specialization_name FROM (doctors NATURAL JOIN doctor_specializations) NATURAL JOIN medical_specializations WHERE status = 'active';`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No doctors found" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors list:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to delete a doctor by ID
app.delete("/api/deleteDoctor/:doctorId", async (req, res) => {
  const { doctorId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE doctors SET status = $1 WHERE doctor_id = $2",
      ["inactive", doctorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/getSpecializations", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT specialization_id, specialization_name, medical_field FROM medical_specializations"
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "No specializations found" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching specializations list:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/addDoctor", async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    phone,
    email,
    licenseNumber,
    specializationId,
    startedWorkingAt,
  } = req.body;

  if (
    !username ||
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !licenseNumber ||
    !specializationId ||
    !startedWorkingAt
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const query1 = `
      INSERT INTO users (username, password_hash, phone, email, role, status)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id
    `;
    const values1 = [
      username,
      "$2b$10$YSBCwWvMkdCryiaN7Ep0x.YXne1zG210sQxsswnxmNqb1rfT7wSK.",
      phone,
      email,
      "doctor",
      "active",
    ];
    const result1 = await pool.query(query1, values1);
    const userId = result1.rows[0].user_id;

    const query2 = `
      INSERT INTO doctors (user_id, first_name, last_name, license_number, status, started_working_at)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING doctor_id
    `;
    const values2 = [
      userId,
      firstName,
      lastName,
      licenseNumber,
      "active",
      startedWorkingAt,
    ];
    const result2 = await pool.query(query2, values2);
    const doctorId = result2.rows[0].doctor_id;

    const query3 = `
      INSERT INTO doctor_specializations (doctor_id, specialization_id)
      VALUES ($1, $2) RETURNING doctor_id
    `;
    const values3 = [doctorId, specializationId];
    const result3 = await pool.query(query3, values3);

    return res
      .status(201)
      .json({ message: "Doctor added successfully", doctorId });
  } catch (error) {
    console.error("Error adding doctor:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/deleteNursesFetch", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT nurse_id, first_name, last_name, license_number, status FROM nurses`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No nurses found" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching nurses list:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/deleteNurse/:nurseId", async (req, res) => {
  const { nurseId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE nurses SET status = $1 WHERE nurse_id = $2",
      ["inactive", nurseId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Nurse not found" });
    }

    res.status(200).json({ message: "Nurse deleted successfully" });
  } catch (error) {
    console.error("Error deleting nurse:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/addNurse", async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    phone,
    email,
    licenseNumber,
    assignedDoctor,
  } = req.body;

  if (
    !username ||
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !licenseNumber ||
    !assignedDoctor
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const query1 = `
      INSERT INTO users (username, password_hash, phone, email, role, status)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id
    `;
    const values1 = [
      username,
      "$2b$10$YSBCwWvMkdCryiaN7Ep0x.YXne1zG210sQxsswnxmNqb1rfT7wSK.",
      phone,
      email,
      "nurse",
      "active",
    ];
    const result1 = await pool.query(query1, values1);
    const userId = result1.rows[0].user_id;

    const query2 = `
      INSERT INTO nurses (user_id, doctor_id, first_name, last_name, license_number, status)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING nurse_ID
    `;
    const values2 = [
      userId,
      assignedDoctor,
      firstName,
      lastName,
      licenseNumber,
      "active",
    ];
    const result2 = await pool.query(query2, values2);
    const nurseId = result2.rows[0].nurse_id;

    return res
      .status(201)
      .json({ message: "Nurse added successfully", nurseId });
  } catch (error) {
    console.error("Error adding nurse:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/appointmentRequests/:nurseId", async (req, res) => {
  const { nurseId } = req.params;
  try {
    const result1 = await pool.query(
      `SELECT doctor_id FROM nurses WHERE nurse_id = $1`,
      [nurseId]
    );
    const doctorId = result1.rows[0].doctor_id;

    const result2 = await pool.query(
      `SELECT 
          appointment_requests.request_id,
          patients.fname || ' ' || patients.lname AS patient_name,
          doctors.first_name || ' ' || doctors.last_name AS doctor_name,
          appointment_requests.preferred_date,
          appointment_slots.day_of_week,
          appointment_slots.start_time,
          appointment_requests.reason,
          appointment_requests.urgency_level
       FROM 
          appointment_requests
       INNER JOIN 
          appointment_slots ON appointment_requests.slot_id = appointment_slots.slot_id
       INNER JOIN 
          patients ON appointment_requests.patient_id = patients.patient_id
       INNER JOIN 
          doctors ON appointment_requests.preferred_doctor_id = doctors.doctor_id
       WHERE 
          appointment_requests.preferred_doctor_id = $1 
          AND appointment_requests.status = 'pending'`,
      [doctorId]
    );

    res.status(200).json(result2.rows);
  } catch (err) {
    console.error("Error fetching requests list:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/getNurseId/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT nurse_id FROM nurses WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching nurse id:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/nurseRejectAppointmentRequest/:requestId", async (req, res) => {
  const { requestId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE appointment_requests SET status = 'rejected' WHERE request_id = $1`,
      [requestId]
    );
  } catch (error) {
    console.error("Error rejecting request:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});





app.post("/api/nurseAcceptAppointmentRequest/:requestId", async (req, res) => {
  const { requestId } = req.params;

  try {
    const result1 = await pool.query(
      `UPDATE appointment_requests SET status = 'approved' WHERE request_id = $1`,
      [requestId]
    );

    const result2 = await pool.query(
      `SELECT patient_id, preferred_doctor_id, slot_id, reason, preferred_date FROM appointment_requests WHERE request_id = $1`,
      [requestId]
    );

    const result3 = await pool.query(
      `INSERT INTO appointments(patient_id, doctor_id, slot_id, request_id, status, reason, date) VALUES ($1, $2, $3, $4, 'scheduled', $5, $6)`,
      [
        result2.rows[0].patient_id,
        result2.rows[0].preferred_doctor_id,
        result2.rows[0].slot_id,
        requestId,
        result2.rows[0].reason,
        result2.rows[0].preferred_date,
      ]
    );

    const result4 = await pool.query(
      `SELECT user_id FROM patients WHERE patient_id = $1`,
      [
        result2.rows[0].patient_id
      ]
    );
    const userId = result4.rows[0].user_id;

    const result5 = await pool.query(
      `INSERT INTO notifications(user_id, message) VALUES ($1, 'Your appointment has been apporoved by the management and is scheduled now.')`,
      [
        userId
      ]
    );

  } catch (error) {
    console.error("Error accepting request:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});



app.post("/api/appointments/:appointmentId/review", async (req, res) => {
  const { appointmentId } = req.params;
  const { rating, feedback } = req.body;

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be a number between 1 and 5." });
  }

  if (!feedback || feedback.trim() === "") {
    return res.status(400).json({ message: "Feedback cannot be empty." });
  }

  try {
    const result1 = await pool.query(
      `SELECT patient_id, doctor_id FROM appointments WHERE appointment_id = $1`,
      [appointmentId]
    );

    if (result1.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    console.log(result1)

    // Insert the review into the database
    await pool.query(
      `INSERT INTO reviews (appointment_id, patient_id, doctor_id, rating, feedback) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        appointmentId,
        result1.rows[0].patient_id,
        result1.rows[0].doctor_id,
        rating,
        feedback,
      ]
    );

    const result3 = await pool.query(
      `UPDATE appointments SET status = 'reviewed' WHERE appointment_id = $1`,
      [appointmentId]
    );

    return res.status(200).json({ message: "Review submitted successfully!" });

  } catch (error) {
    console.error("Error submitting review:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});




app.post("/api/appointmentRequests/cancel", async (req, res) => {
  const { request_id, cancellationReason } = req.body;

  try {

    const result = await pool.query(
      `UPDATE appointment_requests SET status = 'cancelled', cancellation_reason = $1 WHERE request_id = $2`,
      [
        cancellationReason,
        request_id
      ]
    );

    return res.status(200).json({ message: "Request cancelled successfully!" });

  } catch (error) {
    console.error("Error submitting request:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
