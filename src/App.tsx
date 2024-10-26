import "@/App.css";

import { ThemeProvider } from "@/components/theme-provider";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthPage } from "@/pages/AuthPage";
import Register from "@/pages/patients/Register";
import NewAppointment from "@/pages/patients/NewAppointment";
import RequestSuccess from "./pages/patients/success";
import AdminPage from "./pages/admin/home";
import DoctorHome from "./pages/doctors/DoctorHome";
import PatientHome from "./pages/patients/patientHome";


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={} /> */}
          <Route path="/Auth" element={<AuthPage />} />
          <Route path="/admin/home" element={<AdminPage />} />
          <Route path="/doctors/:user_id/home" element={<DoctorHome />} />
          <Route path="/patients/:user_id/home" element={<PatientHome />} />
          <Route path="/patients/:user_id/register" element={<Register />} />
          <Route path="/patients/:patient_id/new-appointment" element={<NewAppointment />} />
          <Route path="/patients/:patient_id/new-appointment/success/:request_id" element={<RequestSuccess />} />
          
          {/* <Route path="/patients/:userId/home" element={<Home />} /> */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
