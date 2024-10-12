/* eslint-disable no-unused-vars */


export type Gender = "Male" | "Female" | "Other";
export type Status = "pending" | "scheduled" | "cancelled";



export interface User {
    user_id: string;
    username: string;
    phone: string;
    email: string;
}
// Define Patient interface
export interface Patient {
  patient_id: string | undefined;
  user_id: string;
  fname: string;
  lname: string;
  date_of_birth: Date;
  gender: Gender;
  address: string;
  phone: string;
  email: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  treatmentConsent: boolean;
  privacyConsent: boolean;
  disclosureConsent: boolean;
}


// Define Appointment interface
export interface Appointment {
  appointment_id: string;
  patient: Patient;
  schedule: Date;
  status: Status;
  primaryPhysician: string;
  reason: string;
  userId: string;
  cancellationReason: string | null;
}

export interface Appointment_request {
  request_id: string;
  patient_id: Patient;
  primaryPhysician: string;
  schedule: Date;
  slotId: string;
  reason: string;
  status: Status;
}
export type Doctor = {
  doctor_id: string;
  user_id: string;
  first_name: string;
  last_name : string;
  specialization: string;
  license_number: string;  
  status: string;
  
}
export type CreateAppointmentParams = {
    userId: string;
    patient: string;
    primaryPhysician: string;
    reason: string;
    schedule: Date;
    status: Status;
    note: string | undefined;
};

export type UpdateAppointmentParams = {
    appointmentId: string;
    userId: string;
    appointment: Appointment;
    type: string;
};

export interface TimeSlot {
  time: string;
  id: string;
  isDisabled: boolean;
}


