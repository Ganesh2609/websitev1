import dr_cameron from "@/assets/images/dr-cameron.png";
import dr_green from "@/assets/images/dr-green.png";
import dr_lee from "@/assets/images/dr-lee.png";
import dr_livingston from "@/assets/images/dr-livingston.png";
import dr_powell from "@/assets/images/dr-powell.png";
import dr_remirez from "@/assets/images/dr-remirez.png";
import dr_sharma from "@/assets/images/dr-sharma.png";

export const GenderOptions = ["Male", "Female", "Other"];

export const PatientFormDefaultValues = {
  fname: "",
  lname: "",
  birthDate: new Date(Date.now()),
  gender: "Male" as "Male" | "Female" | "Other",
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,

};

export const IdentificationTypes = [
  "Birth Certificate",
  "Driver's License",
  "Medical Insurance Card/Policy",
  "Military ID Card",
  "National Identity Card",
  "Passport",
  "Resident Alien Card (Green Card)",
  "Social Security Card",
  "State ID Card",
  "Student ID Card",
  "Voter ID Card",
];

export const Doctors = [
  {
    image: dr_green,
    name: "John Smith",
  },
  {
    image: dr_cameron,
    name: "Emma Johnson",
  },
  {
    image: dr_livingston,
    name: "Michael Williams",
  },
  // {
  //   image: dr_peter,
  //   name: "Evan Peter",
  // },
  {
    image: dr_powell,
    name: "Olivia Jones",
  },
  {
    image: dr_remirez,
    name: "William Brown",
  },
  {
    image: dr_lee,
    name: "Sophia Davis",
  },
  // {
  //   image: dr_cruz,
  //   name: "Alyana Cruz",
  // },
  {
    image: dr_sharma,
    name: "James Miller",
  },
];

export const StatusIcon = {
  scheduled: "@/assets/icons/check.svg",
  pending: "@/assets/icons/pending.svg",
  cancelled: "@/assets/icons/cancelled.svg",
};

export const getDoctorIcon = (firstName: string, lastName: string) => {
  const doctor = Doctors.find(
    (doc) => `${doc.name}` === `${firstName} ${lastName}`
  );
  return doctor ? doctor.image : null;
};

