import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/aceternity/animated-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, X } from "lucide-react";
import { Appointment } from "@/types/types";

const CancelAppointment = ({
  appointment,
  onAppointmentCancel,
}: {
  appointment: Appointment;
  onAppointmentCancel: () => void;
}) => {
  const [cancellationReason, setCancellationReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointment.appointment_id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cancellationReason,
            patientId: localStorage.getItem("patient_id"),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel appointment");
      }

      const data = await response.json();
      alert("Appointment cancelled successfully!");
      onAppointmentCancel();
    } catch (err) {
      setError(err.message);
      console.error("Error cancelling appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return cancellationReason.trim() !== "";
  };

  return (
    <Modal>
      <ModalTrigger className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
        Cancel Appointment
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cancel Appointment</h3>
              <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">
                Cancellation
              </div>
            </div>

            <div className="text-sm space-y-2">
              <p>
                Patient: {appointment?.patient_first_name}{" "}
                {appointment?.patient_last_name}
              </p>
              <p>Date: {new Date(appointment?.date).toLocaleDateString()}</p>
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <label className="block text-sm font-medium">
                    Cancellation Reason
                  </label>
                  <Textarea
                    placeholder="Please provide a reason for cancellation..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">
                    An email notification will be sent to the patient after
                    cancelling the appointment.
                  </p>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
                {error}
              </div>
            )}
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            onClick={handleCancel}
            disabled={loading || !validateForm()}
            className={`${
              loading || !validateForm()
                ? "bg-gray-400"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {loading ? (
              "Processing..."
            ) : (
              <span className="flex items-center gap-2">
                <X className="h-4 w-4" /> Cancel Appointment
              </span>
            )}
          </Button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
};

export default CancelAppointment;