import "@/App.css";

import { ThemeProvider } from "@/components/theme-provider";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthPage } from "@/pages/AuthPage";
import Register from "@/pages/patients/Register";
import RequestSuccess from "./pages/patients/success";
import ManageDoctor from "./pages/admin/ManageDoctor";
import ManageNurse from "./pages/admin/ManageNurse";
import ManageSpecialization from "./pages/admin/ManageSpecialization";
import DoctorHome from "./pages/doctors/DoctorHome";
import PatientHome from "./pages/patients/patientHome";
import NurseHome from "./pages/nurses/NurseHome";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/admin/doctor" element={<ManageDoctor />} />
          <Route path="/admin/nurse" element={<ManageNurse />} />
          <Route path="/admin/specialization" element={<ManageSpecialization />} />
          <Route path="/doctors/:user_id/home" element={<DoctorHome />} />
          <Route path="/patients/:user_id/home" element={<PatientHome />} />
          <Route path="/nurses/:user_id/home" element={<NurseHome />} />
          <Route path="/patients/:user_id/register" element={<Register />} />
          <Route path="/patients/:patient_id/new-appointment/success/:request_id" element={<RequestSuccess />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
