import "@/App.css";

import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthPage } from "@/pages/AuthPage";
import Register from "@/pages/patients/Register";


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={} /> */}
          <Route path="/Auth" element={<AuthPage />} />
          <Route path="/patients/:userId/register" element={<Register />} />
          {/* <Route path="/patients/:userId/home" element={<Home />} /> */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
