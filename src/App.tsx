import "./App.css";
import { cn } from "./lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import logo from "@/assets/icons/logo-full.svg";
import login_img from "@/assets/images/onboarding-img.png";
import  login_gif from "@/assets/gifs/login-page-img.gif";
import { PatientForm } from "@/components/forms/PatientForm";

import { BrowserRouter, Link, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {/* <ModeToggle></ModeToggle> */}
        <div className={cn("min-h-screen bg-dark-300 font-sans antialiased")}>
          <div className="flex h-screen max-h-screen">
            <section className="remove-scrollbar container my-auto">
              <div className="sub-container max-w-[496px]">
                <img
                  src={logo}
                  height={1000}
                  width={1000}
                  alt="patient"
                  className="mb-12 h-10 w-fit"
                />

                <PatientForm />
                <div className="text-14-regular mt-20 flex justify-between">
                  <p className="justify-items-end text-dark-600 xl:text-left">
                    © 2024 CarePluse
                  </p>
                  <Link to="/?admin=true" className="text-green-500">
                    Admin
                  </Link>
                </div>
              </div>
            </section>
            <img
                src={login_img}
                height={1000}
                width={1000}
                alt="patient"
                className="side-img max-w-[50%]"
              />
          </div>
        </div>
      </ThemeProvider>
    </BrowserRouter>
    
  );
}

export default App;
