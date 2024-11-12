import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getRequests } from "@/lib/actions/appointment.actions";
import { useParams } from "react-router-dom";
import logo_img from "@/assets/icons/logo-full.svg";
import success_gif from "@/assets/gifs/success.gif";
import calendar_img from "@/assets/icons/calendar.svg";

const RequestSuccess = () => {
  const { patient_id, request_id } = useParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [doctor, setDoctor] = useState<string>("");

  useEffect(() => {
    const fetchAppointment = async () => {
      console.log("request_id", request_id);
      console.log("patient_id", patient_id);
      const fetchedAppointment = await getRequests(request_id);
      setAppointment(fetchedAppointment);
      console.log("fetchedAppointment", fetchedAppointment);
      setDoctor(fetchedAppointment.first_name + fetchedAppointment.last_name);
    };

    fetchAppointment();
  }, [request_id]);

  if (!appointment || !doctor) {
    return <div>Loading...</div>; // Loading state
  }

  return (
    <div className="flex h-screen max-h-screen px-[5%]">
      <div className="success-img">
        <a href="/">
          <img
            src={logo_img}
            alt="logo"
            className="h-10 w-fit"
            style={{ height: "auto", width: "100%" }}
          />
        </a>

        <section className="flex flex-col items-center">
          <img src={success_gif} alt="success" height={300} width={280} />
          <h2 className="header mb-6 max-w-[600px] text-center">
            Your <span className="text-green-500">appointment request</span> has
            been successfully submitted!
          </h2>
          <p>We'll be in touch shortly to confirm.</p>
        </section>

        <section className="request-details">
          <p>Requested appointment details: </p>
          <div className="flex items-center gap-3">
            {/* <img
              src={doctor.image}
              alt="doctor"
              width={100}
              height={100}
              className="size-6"
            />*/}
            <p className="whitespace-nowrap">Dr. {doctor}</p>
          </div>
          <div className="flex gap-2">
            <img src={calendar_img} height={24} width={24} alt="calendar" />
            <p>
              {new Date(appointment.preferred_date).toLocaleDateString(
                "en-GB",
                { year: "2-digit", month: "2-digit", day: "2-digit" }
              )}
            </p>
          </div>
        </section>

        <Button variant="outline" className="shad-primary-btn" asChild>
          <a href={`/patients/${patient_id}/new-appointment`}>
            New Appointment
          </a>
        </Button>

        <p className="copyright">© 2024 CarePlus</p>
      </div>
    </div>
  );
};

export default RequestSuccess;
