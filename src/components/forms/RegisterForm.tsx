import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom"; // Import from react-router-dom

import { Form } from "@/components/ui/form";
import { createUser } from "@/lib/actions/patient.actions";
import { RegisterFormValidation } from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";

import user_img from "@/assets/icons/user.svg";
import email_img from "@/assets/icons/email.svg";
import pass_img from "@/assets/icons/password.svg";

export const RegisterForm = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useRouter
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof RegisterFormValidation>>({
    resolver: zodResolver(RegisterFormValidation),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [RegError, setRegError] = useState<string | null>(null);

  const onSubmit = async (values: z.infer<typeof RegisterFormValidation>) => {
    setIsLoading(true);
    setRegError(null);
    try {
      const user = {
        username: values.username,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role:'patient'
      };

      const newUser = await createUser(user);
      if (newUser) {
        console.log(newUser);
        navigate(`/patients/${newUser.user.user_id}/register`);
      } else {
        setRegError('username already exists');
      }
      
    } catch (error) {
      // console.error("Login failed:", error);
      // setRegError("An error occurred during registration");
    } finally {
      setIsLoading(false); // Always called, even if there's an error
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
        {RegError && <p className="text-red-500">{RegError}</p>}
        {/* <div className="flex space-x-4">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="firstname"
            label="First Name"
            placeholder="John"
            iconSrc={user_img}
            iconAlt="user"
            // className="flex-1"
          />

          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="lastname"
            label="Last Name"
            placeholder="Doe"
            iconSrc={user_img}
            iconAlt="user"
            // className="flex-1"
          />
        </div> */}

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="hakuna_matata@gmail.com"
          iconSrc={email_img}
          iconAlt="email"
        />

        <CustomFormField
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="Phone number"
          placeholder="(555) 123-4567"
        />

        <div className="flex space-x-4">
          <CustomFormField
            fieldType={FormFieldType.PASSWORD}
            control={form.control}
            name="password"
            label="Password"
            placeholder="Create a password"
            iconSrc={pass_img}
            iconAlt="password"
          />

          <CustomFormField
            fieldType={FormFieldType.PASSWORD}
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Retype a password"
            iconSrc={pass_img}
            iconAlt="password"
          />
        </div>
        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};
