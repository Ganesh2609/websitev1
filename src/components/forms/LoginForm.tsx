import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
// import jwt from 'jsonwebtoken';

import { Form } from "@/components/ui/form";
import { loginUser } from "@/lib/actions/patient.actions";
import { LoginFormValidation } from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "@/components/SubmitButton";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import user_img from "@/assets/icons/user.svg";
import pass_img from "@/assets/icons/password.svg";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [passkey, setPasskey] = useState(""); // State for passkey input
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const form = useForm<z.infer<typeof LoginFormValidation>>({
    resolver: zodResolver(LoginFormValidation),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginFormValidation>) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const loginData = await loginUser({
        username: values.username,
        password: values.password,
      });
      console.log("loginData", loginData);
      // If the login was successful, the server will return a user_id and a role.
      // We check if these values are present in the response before proceeding.
      if (loginData.user.user_id && loginData.user.role) {
        console.log("loginData", loginData.user.user_id, loginData.user.role);
        localStorage.setItem("userId", loginData.user.user_id);
        localStorage.setItem("doctor_id", loginData.user.doctorId);
        localStorage.setItem("patient_id", loginData.user.patientId);
        localStorage.setItem("role", loginData.user.role);
        handleNavigation(loginData.user.role, loginData.user.user_id); // Navigate based on the role
      } else {
        setLoginError("Invalid username or password.");
      }
    } catch (error: unknown) {
      console.error("Login failed:", error);
      setLoginError("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (role: string, user_id: string) => {
    if (role === "admin") {
      onOpen(); // Admin-specific modal
    } else if (role === "doctor") {
      navigate(`/doctors/${user_id}/home`);
    } else {
      navigate(`/patients/${user_id}/home`);
    }
  };

  const handlePasskeySubmit = () => {
    if (passkey === "101010") {
      // If passkey is correct, navigate to admin home
      navigate("/admin/home");
    } else {
      setPasskeyError("Invalid Passkey.");
    }
    onClose(); // Close the alert dialog
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

        {loginError && <p className="text-red-500">{loginError}</p>}
        {passkeyError && <p className="text-red-500">{passkeyError}</p>}

        <SubmitButton isLoading={isLoading}>Login</SubmitButton>
        <Modal
          backdrop={"blur"}
          isOpen={isOpen}
          onClose={onClose}
          className="max-w-[515px]"
        >
          <ModalContent>
            <>
              <ModalHeader>Admin Passkey Verification</ModalHeader>
              <ModalBody className="flex items-center justify-center space-x-2">
                Please enter the passkey to access the admin panel.
                <InputOTP
                  maxLength={6}
                  value={passkey}
                  onChange={(values) => setPasskey(values)}
                >
                  <InputOTPGroup className="shad-otp gap-3">
                    <InputOTPSlot className="shad-otp-slot" index={0} />
                    <InputOTPSlot className="shad-otp-slot" index={1} />
                    <InputOTPSlot className="shad-otp-slot" index={2} />
                    <InputOTPSlot className="shad-otp-slot" index={3} />
                    <InputOTPSlot className="shad-otp-slot" index={4} />
                    <InputOTPSlot className="shad-otp-slot" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  onPress={() => {
                    handlePasskeySubmit();
                  }}
                >
                  Continue
                </Button>
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>
      </form>
    </Form>
  );
};
