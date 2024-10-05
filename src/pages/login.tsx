import "./App.css";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DotBackground } from "@/components/aceternity/GridBg";
import { RegisterForm } from "@/components/forms/RegisterForm";
import logo from "@/assets/icons/logo-full.svg";
import login_img from "@/assets/images/onboarding-img.png";
import { BrowserRouter, Link } from "react-router-dom";
// import { LoginForm } from "@/components/forms/LoginForm";
export const LoginForm = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className={cn("min-h-screen bg-dark-300 sans-serif antialiased")}>
        <div className="flex h-screen max-h-screen">
          <img
            src={login_img}
            height={1000}
            width={1000}
            alt="patient"
            className="side-img max-w-[45%]"
          />
          <DotBackground>
            <section className="remove-scrollbar container relative">
              <div className="sub-container max-w-[515px] relative">
                <img
                  src={logo}
                  height={1000}
                  width={1000}
                  alt="patient"
                  className="absolute top-[100px] left-0 right-0 mx-auto mb-12 h-10 w-fit scale-150"
                />
                {/* Add padding to ensure other content starts below the image */}
                <div className="pt-[150px]">
                  <Tabs defaultValue="login" className="">
                    <TabsList className="flex w-full h-12 bg-transparent gap-10">
                      <TabsTrigger
                        value="login"
                        className="w-1/4 flex items-center justify-center text-lg font-bold text-white border-b-4 border-transparent data-[state=active]:border-red-500"
                      >
                        Login
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="w-1/4 flex items-center justify-center text-lg font-bold text-white border-b-4 border-transparent data-[state=active]:border-red-500"
                      >
                        Register
                      </TabsTrigger>
                    </TabsList>

                    <br />

                    <TabsContent value="login">
                      <Card>
                        <CardHeader>
                          <h1 className="header font-bold">Welcome Back 👋</h1>
                          Login to your account to see your appointments
                          <br />
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <LoginForm />
                        </CardContent>
                        <CardFooter>
                          {/* TODO: add forgot password */}
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    <TabsContent value="register">
                      <Card>
                        <CardHeader>
                          <h1 className="header">Hi there 👋</h1>
                          Register to get started with appointments.
                          <br />
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <RegisterForm />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* <div className="text-14-regular mt-20 flex justify-between">
                            <p className="justify-items-end text-dark-600 xl:text-left">
                                © 2024 CarePluse
                            </p>
                            <Link to="/?admin=true" className="text-green-500">
                                Admin
                            </Link>
                            </div> */}
                </div>
              </div>
            </section>
          </DotBackground>
        </div>
      </div>
    </ThemeProvider>
  );
};
