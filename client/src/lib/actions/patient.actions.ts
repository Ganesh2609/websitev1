// src/lib/actions/patient.actions.ts
import { Patient } from "@/types/types";
export const createUser = async (user: { username: string; email: string; phone: string; password: string }) => {
  try {
    const response = await fetch("http://localhost:5000/api/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error("Failed to create patient");
    }

    const newPatient = await response.json();
    return newPatient;
  } catch (error) {
    console.error("Error creating patient:", error);
    return null;
  }
};

export const loginUser = async (credentials: { username: string; password: string }) => {
  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST", // Changed to POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const loginData = await response.json(); // Usually, this will be the auth token or user info
    return loginData;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

export const getUser = async (user_id: string) => {
  console.log(user_id, "userId"); 
  try {
    // Append userId as a query parameter in the URL
    const response = await fetch(`http://localhost:5000/api/getUser?user_id=${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user data");
    }

    const userData = await response.json(); // Parse the user data from response
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const getPatient = async (patient_id: string | undefined) => {
  console.log(patient_id, "patientId"); 
  try {
    // Append userId as a query parameter in the URL
    const response = await fetch(`http://localhost:5000/api/getPatient?patient_id=${patient_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch patient data");
    }

    const patientData = await response.json(); // Parse the patient data from response
    return patientData;
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return null;
  }
};

export const getDoctor = async (doctor_id: string | undefined) => {
  try {
    // Append userId as a query parameter in the URL
    const response = await fetch(`http://localhost:5000/api/getDoctor?doctor_id=${doctor_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch doctor data");
    }

    const doctorData = await response.json(); // Parse the doctor data from response
    return doctorData;
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    return null;
  }
};


export const getRequestDate = async (request_id: string | undefined) => {
  try {
    // Append request_id as a query parameter in the URL
    const response = await fetch(`http://localhost:5000/api/getrequests/date?request_id=${request_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch preferred date");
    }

    const preferredDate = await response.json(); // Parse the preferred date from response
    console.log(preferredDate, "preferred date");
    return preferredDate;
  } catch (error) {
    console.error("Error fetching preferred date:", error);
    return null;
  }
};

export const getRequestStartTime = async (slot_id: string | undefined) => {
  try {
    const response = await fetch(`http://localhost:5000/api/getrequests/starttime?slot_id=${slot_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch start time");
    }

    const startTime = await response.json(); // Parse the start time from response
    return startTime;
  } catch (error) {
    console.error("Error fetching start time:", error);
    return null;
  }
};


// Function to register a patient
export const registerPatient = async (patient: Patient) => {
  try {
    console.log(patient, "patient in actions");
    // Create FormData to handle both JSON data and file upload
    const formData = new FormData();

    // Append basic patient data to FormData
    formData.append("user_id", patient.user_id);
    formData.append("fname", patient.fname);
    formData.append("lname", patient.lname);
    formData.append("email", patient.email);
    formData.append("phone", patient.phone);
    formData.append("birthDate", patient.date_of_birth.toISOString()); // Convert date to ISO string
    formData.append("gender", patient.gender);
    formData.append("address", patient.address);
    formData.append("occupation", patient.occupation);
    formData.append("emergencyContactName", patient.emergencyContactName);
    formData.append("emergencyContactNumber", patient.emergencyContactNumber);
    formData.append("primaryPhysician", patient.primaryPhysician);
    formData.append("insuranceProvider", patient.insuranceProvider);
    formData.append("insurancePolicyNumber", patient.insurancePolicyNumber);
    formData.append("allergies", patient.allergies ?? "");
    formData.append("currentMedication", patient.currentMedication ?? "");
    formData.append("familyMedicalHistory", patient.familyMedicalHistory ?? "");
    formData.append("pastMedicalHistory", patient.pastMedicalHistory ?? "");
    formData.append("identificationType", patient.identificationType ?? "");
    formData.append("identificationNumber", patient.identificationNumber ?? "");
    formData.append("treatmentConsent", patient.treatmentConsent ? "true" : "false");
    formData.append("disclosureConsent", patient.disclosureConsent ? "true" : "false");
    formData.append("privacyConsent", patient.privacyConsent ? "true" : "false");

    // Append the file (if present) to FormData
    if (patient.identificationDocument) {
      formData.append("identificationDocument", patient.identificationDocument.get("blobFile") ?? "");
      formData.append("fileName", patient.identificationDocument.get("fileName") ?? "");
    }

    // Perform the API call to register the patient
    const response = await fetch("http://localhost:5000/api/patients/register", {
      method: "POST",
      body: formData, // Send formData directly
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to register patient");
    }

    const newPatient = await response.json(); // Assuming the API returns the created patient data
    return newPatient;

  } catch (error) {
    console.error("Error registering patient:", error);
    return null;
  }
};




