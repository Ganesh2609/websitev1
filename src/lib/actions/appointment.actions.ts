"use server";

// import { revalidatePath } from "next/cache";
// import { ID, Query } from "node-appwrite";

// import { Appointment } from "@/types/types";

// import {
//   APPOINTMENT_COLLECTION_ID,
//   DATABASE_ID,
//   databases,
//   messaging,
// } from "../appwrite.config";
// import { formatDateTime, parseStringify } from "../utils";
import axios from 'axios';

export const getDates = async (formData: { doctor_id: string; date: Date | null }) => {
  console.log("formData", formData); 
  try {
    // Append userId as a query parameter in the URL
    const response = await fetch(`http://localhost:5000/api/patients/new-appointments/getDates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      console.log(response, "response");
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch available dates");
    }

    const available_Dates = await response.json(); // Parse the patient data from response
    console.log("available dates", available_Dates );
    return available_Dates;
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return null;
  }
};



export const createAppointment = async (appointmentData: {
  userId: string | undefined;
  patient: string;
  primaryPhysician: string;
  schedule: Date; // Expecting a Date object
  timeSlot: string | null;
  reason: string;
}) => {
  try {
    const response = await axios.post('http://localhost:5000/api/appointments', {
      userId: appointmentData.userId,
      patient: appointmentData.patient,
      preferredDoctorId: appointmentData.primaryPhysician,
      preferredDate: appointmentData.schedule.toISOString(), // Convert Date to ISO string
      slotId: appointmentData.timeSlot,
      reason: appointmentData.reason,
    });

    return response.data; // You might want to return the created appointment data
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error; // Rethrow the error for further handling if needed
  }
};


export const getRequests = async (request_id: string | undefined) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/getrequests/${request_id}`);

    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error; // Rethrow the error for further handling if needed
  }
};


