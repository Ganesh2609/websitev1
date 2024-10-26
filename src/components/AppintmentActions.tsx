import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/aceternity/animated-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Appointment } from "@/types/types";
// import { API_BASE_URL } from '@/config';

type Treatment = {
  procedureName: string;
  procedureDescription: string;
  cost: string;
};

const AppointmentActions = ({
  appointment,
  onAppointmentComplete,
}: {
  appointment: Appointment;
  onAppointmentComplete: () => void;
}) => {
  const [doctorNotes, setDoctorNotes] = useState("");
  const [billingAmount, setBillingAmount] = useState("");
  const [treatments, setTreatments] = useState<Treatment[]>([
    {
      procedureName: "",
      procedureDescription: "",
      cost: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTreatment = () => {
    setTreatments([
      ...treatments,
      { procedureName: "", procedureDescription: "", cost: "" },
    ]);
  };

  const handleRemoveTreatment = (index: number) => {
    setTreatments(treatments.filter((_, i) => i !== index));
  };

  const handleTreatmentChange = (
    index: number,
    field: keyof Treatment,
    value: string
  ) => {
    const newTreatments = [...treatments];
    newTreatments[index][field] = value;
    setTreatments(newTreatments);

    // Update total billing amount
    if (field === "cost") {
      const total = newTreatments.reduce((sum, t) => {
        const cost = parseFloat(t.cost) || 0;
        return sum + cost;
      }, 0);
      setBillingAmount(total.toFixed(2));
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointment.appointment_id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            doctorNotes,
            billingAmount: parseFloat(billingAmount),
            doctorId: localStorage.getItem("doctor_id"),
            treatments: treatments.map((t) => ({
              ...t,
              cost: parseFloat(t.cost),
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to complete appointment");
      }

      const data = await response.json();
      // onAppointmentComplete(data);
      alert("Appointment completed successfully!");
    } catch (err) {
      setError(err.message);
      console.error("Error completing appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return (
      doctorNotes.trim() !== "" &&
      billingAmount !== "" &&
      !isNaN(parseFloat(billingAmount)) &&
      parseFloat(billingAmount) > 0 &&
      treatments.every(
        (t) =>
          t.procedureName.trim() !== "" &&
          !isNaN(parseFloat(t.cost)) &&
          parseFloat(t.cost) > 0
      )
    );
  };

  return (
    <Modal>
      <ModalTrigger className="bg-black dark:bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800">
        Manage Appointment
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appointment Management</h3>
            <div className="text-sm">
              <p>
                Patient: {appointment?.patient_first_name}{" "}
                {appointment?.patient_last_name}
              </p>
              <p>Date: {new Date(appointment?.date).toLocaleDateString()}</p>
            </div>

            <Tabs defaultValue="treatments">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="treatments">Treatments</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="notification">Notification</TabsTrigger>
              </TabsList>

              <TabsContent value="treatments" className="space-y-4">
                {treatments.map((treatment, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Treatment {index + 1}</h4>
                        {treatments.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTreatment(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Procedure Name"
                          value={treatment.procedureName}
                          onChange={(e) =>
                            handleTreatmentChange(
                              index,
                              "procedureName",
                              e.target.value
                            )
                          }
                        />
                        <Textarea
                          placeholder="Procedure Description"
                          value={treatment.procedureDescription}
                          onChange={(e) =>
                            handleTreatmentChange(
                              index,
                              "procedureDescription",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Cost"
                          value={treatment.cost}
                          onChange={(e) =>
                            handleTreatmentChange(index, "cost", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddTreatment}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Treatment
                </Button>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Textarea
                  placeholder="Enter medical notes..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="min-h-[200px]"
                />
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Total Amount
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter amount"
                        value={billingAmount}
                        onChange={(e) => setBillingAmount(e.target.value)}
                        disabled
                      />
                      <p className="text-sm text-gray-500">
                        Total is calculated automatically from treatment costs
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notification" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <p className="text-sm">
                        An email notification will be sent to the patient after
                        completing the appointment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
                {error}
              </div>
            )}
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            onClick={handleComplete}
            disabled={loading || !validateForm()}
            className={`${
              loading || !validateForm()
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {loading ? (
              "Processing..."
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Complete Appointment
              </span>
            )}
          </Button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
};

export default AppointmentActions;
