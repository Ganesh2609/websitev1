import { useState, useEffect } from "react";
import logo from "@/assets/icons/logo-full.svg";
import appointmentsImg from "@/assets/icons/appointments.svg";
import pendingImg from "@/assets/icons/pending.svg";
import cancelledImg from "@/assets/icons/cancelled.svg";

import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointments } from "@/lib/actions/appointment.actions";
import {
  getDoctor,
  getPatient,
  getRequestDate,
  getRequestStartTime,
} from "@/lib/actions/patient.actions";
import { Appointment, AppointmentsState } from "@/types/types";

const AdminPage = () => {
  // Initialize state with default values to prevent undefined errors
  const [appointments, setAppointments] = useState<AppointmentsState>({
    appointments: [],
    scheduledCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
  });
  

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getRecentAppointments(); 
        const updatedAppointments = await Promise.all(
          data.appointments.map(async (appointment:any): Promise<Appointment> => {
            const doctorData = await getDoctor(appointment.doctor_id);
            const patientData = await getPatient(appointment.patient_id);
            const date = await getRequestDate(appointment.request_id);
            const time = await getRequestStartTime(appointment.slot_id);
  
            return {
              ...appointment,
              doctorFirstName: doctorData?.first_name || "",
              doctorLastName: doctorData?.last_name || "",
              patientFirstName: patientData?.fname || "",
              patientLastName: patientData?.lname || "",
              date,
              time,
            };
          })
        );
        
        setAppointments({
        //   // data.,
          scheduledCount: data.scheduledCount,
          pendingCount: 0,
          cancelledCount: data.cancelledCount,
          appointments: updatedAppointments,
        });
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };
  
    fetchAppointments();
  }, []);


  
  

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <a href="/">
          <img src={logo} className="h-8 w-fit" alt="logo" />
        </a>
        <p className="text-16-semibold">Admin Dashboard</p>
      </header>

      <main className="admin-main ">
        <section className="w-full  space-y-4">
          <h1 className="header">Welcome &#x1F44B;</h1>
          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>
        </section>

        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon={appointmentsImg}
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Pending appointments"
            icon={pendingImg}
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Cancelled appointments"
            icon={cancelledImg}
          />
        </section>

        {/* Conditionally render DataTable only when data is available */}
        {appointments.appointments.length > 0 ? (
          console.log(appointments.appointments),
          <DataTable columns={columns} data={appointments.appointments} />
        ) : (
          <p>Loading appointments...</p>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
