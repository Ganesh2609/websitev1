import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom"; // Import from react-router-dom

import { Form } from "@/components/ui/form";
import { loginUser } from "@/lib/actions/patient.actions";
import { LoginFormValidation} from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";

import user_img from "@/assets/icons/user.svg";
import pass_img from "@/assets/icons/password.svg";

export const LoginForm = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useRouter
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof LoginFormValidation>>({
    resolver: zodResolver(LoginFormValidation),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  console.log("Form Errors: ", form.formState.errors);
  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit = async (values: z.infer<typeof LoginFormValidation>) => {
    setIsLoading(true);
    setLoginError(null); // Reset error state

    try {
      const credentials = {
        username: values.username,
        password: values.password,
      };
      console.log(credentials);
      const loginResponse = await loginUser(credentials);

      console.log(loginResponse);
      if (loginResponse?.token) {
        localStorage.setItem("authToken", loginResponse.token);

        navigate(`/patients/${loginResponse.user.userId}/home`);
      } else {
        setLoginError("Invalid username or password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4">
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="username"
          label="Username"
          placeholder="hakuna_matata"
          iconSrc={user_img}
          iconAlt="user"
        />

        <CustomFormField
          fieldType={FormFieldType.PASSWORD}
          control={form.control}
          name="password"
          label="Password"
          placeholder="********"
          iconSrc={pass_img}
          iconAlt="password"
        />

        {/* Error message displayed here */}
        {loginError && <p className="text-red-500">{loginError}</p>}

        <SubmitButton isLoading={isLoading}>Login</SubmitButton>
      </form>
    </Form>
  );
};
