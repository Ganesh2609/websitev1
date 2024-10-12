/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor } from "@/types/types";
import { useNavigate } from "react-router-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SelectItem } from "@/components/ui/select";
import { getAppointmentSchema } from "@/lib/validation";
import "react-datepicker/dist/react-datepicker.css";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import SubmitButton from "@/components/SubmitButton";
import { Form } from "@/components/ui/form";
import { getDates, createAppointment } from "@/lib/actions/appointment.actions";
import axios from "axios";
import { Iconly } from "react-iconly";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Chip,
} from "@nextui-org/react";
import { RadioButtonGroup } from "@/components/RadioButtonGroup";

export const AppointmentForm = ({
  userId,
  patientId,
  setOpen,
}: {
  userId: string | undefined;
  patientId: string | undefined;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [doctorId, setDoctorId] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]); // Adjust to proper type
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]); // Store the list of active doctors
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timeSlots, setTimeSlots] = useState<any[]>([]); // Array of time slots
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    time: string;
    id: string | null;
  }>({ time: "No time slot selected", id: null });

  const AppointmentFormValidation = getAppointmentSchema("create");

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: "",
      schedule: new Date(Date.now()),
      timeSlot: "",
      reason: "",
    },
  });

  // Helper to generate time slots
  const generateTimeSlots = (availableSlots: any[]) => {
    const timeSlots = [];
    let currentTime = 10;

    for (let i = 0; i < 9; i++) {
      const formattedTime = `${currentTime}:00 ${
        currentTime < 12 ? "AM" : "PM"
      }`;
      currentTime = currentTime === 12 ? 13 : currentTime + 1;

      const availableSlot = availableSlots.find(
        (slot) => slot.start_time === `${formattedTime.split(" ")[0]}:00`
      );

      timeSlots.push({
        time: formattedTime,
        id: availableSlot ? availableSlot.slot_id : null,
        isDisabled: !availableSlot,
      });
    }

    return timeSlots;
  };

  // Fetch available slots based on selected doctor and date
  const fetchAvailableSlots = async (doctorId: string, date: Date | null) => {
    if (!doctorId || !date) return;
    setLoading(true);
    setErrorMessage("");
    setAvailableSlots([]);

    try {
      const response = await getDates({ doctor_id: doctorId, date });
      if (response?.slots?.length > 0) {
        setAvailableSlots(response.slots);
        setTimeSlots(generateTimeSlots(response.slots)); // Use response.slots directly
      } else {
        setErrorMessage(response?.message || "No available slots found.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while fetching available slots.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch active doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/doctors/active"
        );
        setDoctors(response.data.doctors);
      } catch (error) {
        console.error("Error fetching active doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleDateOrDoctorChange = (doctorId: string, date: Date | null) => {
    if (doctorId && date) fetchAvailableSlots(doctorId, date);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    handleDateOrDoctorChange(doctorId, date);
  };

  const handleDoctorChange = (doctorId: string) => {
    setDoctorId(doctorId);
    console.log("Selected Doctor ID:", doctorId); // Print the selected doctor ID
    handleDateOrDoctorChange(doctorId, selectedDate);
  };

  const onSubmit = async (
    values: z.infer<typeof AppointmentFormValidation>
  ) => {
    setIsLoading(true);
    console.log("Form Data:", values);
    try {
      if (patientId) {
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: doctorId,
          schedule: new Date(values.schedule),
          timeSlot: selectedTimeSlot.id, // Use the selected ID directly
          reason: values.reason!,
        };
        console.log("Appointment Data:", appointmentData);
        // Call createAppointment function from actions
        const result = await createAppointment(appointmentData);
        console.log("Create appointment result:", result);

        if (result) {
          console.log("Appointment created successfully");
          navigate(
            `/patients/${patientId}/new-appointment/success/${result.request_id}`
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSlotSelect = (selectedTimeSlotData: {
    time: string;
    id: string | null;
  }) => {
    console.log("Selected time slot ID:", selectedTimeSlotData.id);
    console.log("Selected time slot:", selectedTimeSlotData.time);
    setSelectedTimeSlot(selectedTimeSlotData);
  };

  const handleClose = () => {
    setSelectedTimeSlot({ time: "No time slot selected", id: null });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        <section className="mb-12 space-y-4">
          <h1 className="header">New Appointment</h1>
          <p className="text-dark-700">
            Request a new appointment in 10 seconds.
          </p>
        </section>

        <CustomFormField
          fieldType={FormFieldType.SELECT}
          control={form.control}
          name="primaryPhysician"
          onChange={handleDoctorChange}
          label="Doctor"
          placeholder="Select a doctor"
        >
          {doctors.map((doctor) => (
            <SelectItem key={doctor.doctor_id} value={doctor.doctor_id}>
              {doctor.first_name} {doctor.last_name}
            </SelectItem>
          ))}
        </CustomFormField>

        <CustomFormField
          fieldType={FormFieldType.DATE_AVAILABILITY}
          control={form.control}
          name="schedule"
          onChange={handleDateChange}
          label="Expected appointment date"
          dateFormat="MM/dd/yyyy"
        />

        <Button
          variant="shadow"
          color="success"
          onPress={onOpen}
          endContent={<Iconly name="Search" set="bulk" size="medium" />}
        >
          <b>Select Available Slots</b>
        </Button>

        <Chip
          className="ml-2"
          key={1}
          onClose={() => handleClose()}
          variant="bordered"
          color={selectedTimeSlot.id === null ? "danger" : "success"}
        >
          {selectedTimeSlot.time}
        </Chip>

        <Modal backdrop={"blur"} isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <>
              <ModalHeader>Select an Available Slot</ModalHeader>
              <ModalBody>
                <RadioButtonGroup
                  timeSlots={timeSlots}
                  onSelect={handleTimeSlotSelect}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="success" onPress={onClose}>
                  Select
                </Button>
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>

        {errorMessage && <div className="text-red-500">{errorMessage}</div>}

        <CustomFormField
          fieldType={FormFieldType.TEXTAREA}
          control={form.control}
          name="reason"
          label="Reason"
          placeholder="Reason for your visit"
        />

        <SubmitButton isLoading={isLoading} className="bg-green-500 text-white">
          Book Appointment
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;
