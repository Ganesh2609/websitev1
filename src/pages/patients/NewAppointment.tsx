import appointment_img from "@/assets/images/appointment-img.png";
import logo from "@/assets/icons/logo-full.svg";

import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";
import { Patient } from "@/types/types";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";


const Appointment = () => {
  // const patient = await getPatient(patient_id);

  const { patient_id } = useParams(); // Extract userId from URL parameters
  const [patientData, setPatientData] = useState<Partial<Patient>>({
    patient_id: "",
    user_id: "",
    fname: "",
    lname: "",
    email: "",
    phone: "",
  });  // State to store user data

  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState<string | null>(null); // State to handle errors

  useEffect(() => {
    const fetchUserData = async () => {
      if (!patient_id) {
        setError("Patient ID is required."); 
        setLoading(false);
        return; 
      }
      
      try {
        console.log(patient_id);
        const data = await getPatient(patient_id); // Call the getUser function with userId
        if (!data) {
          throw new Error('Patient not found');
        }
        console.log(data);
        setPatientData(data); // Set user data to state
      } catch (err) {
        setError((err as Error).message); // Handle error
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUserData(); // Call the async function
  }, [patient_id]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (error) {
    return <div>Error: {error}</div>; 
  }

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <img
            src={logo}
            height={1000}
            width={1000}
            alt="logo"
            className="mb-12 h-10 w-fit"
          />

          <AppointmentForm
            patientId={patientData.patient_id}
            userId={patientData.user_id}
          />

          <p className="copyright mt-10 py-12">© 2024 CarePluse</p>
        </div>
      </section>

      <img
        src={appointment_img}
        height={1500}
        width={1500}
        alt="appointment"
        className="side-img max-w-[390px] bg-bottom"
      />
    </div>
  );
};

export default Appointment;