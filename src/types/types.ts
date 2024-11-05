/* eslint-disable no-unused-vars */


export type Gender = "Male" | "Female" | "Other";
export type Status = "completed" | "scheduled" | "cancelled" | "no_show";



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

// export interface Appointment {
//   appointment_id: string;
//   doctor_id: string;
//   patient_id: string;
//   slot_id: string;
//   request_id: string;
//   status: Status;
//   reason: string;
//   doctor_notes: string;
//   patient_feedback: string;
//   doctorFirstName: string;
//   doctorLastName: string;
//   patientFirstName: string;
//   patientLastName: string;
//   date: string;
//   time: {
//     start_time: string;};
// }

export interface Appointment {
  appointment_id: string;
  patient_first_name: string;
  patient_last_name: string;
  doctor_first_name: string;
  doctor_last_name: string;
  reason: string;
  date: string;
  start_time: string;
  status: Status;
  doctor_notes: string;
  patient_feedback: string;
}

export interface AppointmentsState {
  appointments: Appointment[];
  scheduledCount: number;
  pendingCount: number;
  cancelledCount: number;
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
  years_of_experience: number;
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


