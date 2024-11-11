import { useState } from "react";
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
import { AlertCircle, X, Star } from "lucide-react";
import { Appointment } from "@/types/types";

const CancelAppointment = ({
  appointment,
  onAppointmentCancel,
}: {
  appointment: Appointment;
  onAppointmentCancel: () => void;
  onReviewSubmit: (rating: number, review: string) => void;
}) => {
  const [cancellationReason, setCancellationReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

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

      await response.json();
      alert("Appointment cancelled successfully!");
      onAppointmentCancel();
    } catch (err:any) {
      setError(err.message);
      console.error("Error cancelling appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const requestBody = {
        appointmentId: appointment.appointment_id,
        rating: rating,
        feedback: review,
      };

      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointment.appointment_id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }

      await response.json();
      alert("Review submitted successfully!");
    } catch (err:any) {
      setError(err.message || "An error occurred while submitting the review");
      console.error("Error submitting review:", err);
    }
  };

  const validateForm = () => {
    return cancellationReason.trim() !== "";
  };

  const handleStarClick = (index: number) => {
    setRating(index + 1);
  };

  return (
    <Modal>
      <ModalTrigger
        className={`${
          appointment.status === "scheduled"
            ? "bg-danger hover:bg-danger-700" // Danger color for "Cancel Appointment"
            : appointment.status === "completed"
            ? "bg-warning hover:bg-warning-600" // Warning color for "Leave a Review"
            : "" // No button for other statuses
        } text-white px-4 py-2 rounded-md`}
      >
        {appointment.status === "scheduled"
          ? "Cancel Appointment"
          : appointment.status === "completed"
          ? "Leave a Review"
          : ""}
      </ModalTrigger>

      <ModalBody>
        <ModalContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {appointment.status === "completed"
                  ? "Leave a Review"
                  : appointment.status === "scheduled"
                  ? "Cancel Appointment"
                  : ""}
              </h3>
              {appointment.status === "completed" && (
                <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm">
                  Completed
                </div>
              )}
              {appointment.status === "scheduled" && (
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                  Scheduled
                </div>
              )}
            </div>

            {appointment.status === "completed" ? (
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">Review</label>
                    <Textarea
                      placeholder="Write a review..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="space-x-2 py-5">
                    {[...Array(5)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleStarClick(index)}
                        className={`${
                          rating > index ? "text-yellow-500" : "text-gray-300"
                        }`}
                      >
                        <Star className="h-6 w-6" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : appointment.status === "scheduled" ? (
              <div className="text-sm space-y-2">
                <p>
                  Patient: {appointment?.patient_first_name}{" "}
                  {appointment?.patient_last_name}
                </p>
                <p>Date: {new Date(appointment?.date).toLocaleDateString()}</p>
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
              </div>
            ) : null}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
                {error}
              </div>
            )}
          </div>
        </ModalContent>

        <ModalFooter>
          {appointment.status === "scheduled" && (
            <Button
              onClick={handleCancel}
              disabled={loading || !validateForm()}
              className={`${
                appointment.status === "scheduled"
                  ? "bg-danger hover:bg-danger-700"
                  : ""
              } text-white ${loading || !validateForm() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                "Processing..."
              ) : (
                <span className="flex items-center gap-2">
                  <X className="h-4 w-4" /> Cancel Appointment
                </span>
              )}
            </Button>
          )}

          {appointment.status === "completed" && (
            <Button
              onClick={handleReviewSubmit}
              disabled={loading || rating === 0}
              className={`${
                appointment.status === "completed"
                  ? "bg-warning hover:bg-warning-600"
                  : ""
              } text-white ${loading || rating === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Processing..." : "Submit Review"}
            </Button>
          )}
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
};

export default CancelAppointment;
