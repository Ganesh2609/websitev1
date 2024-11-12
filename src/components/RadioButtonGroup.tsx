import React, { useState } from "react";
import { Button } from "@nextui-org/react"; // Import your Button component
import { TimeSlot } from "@/types/types";

// Define the type for each time slot
interface TimeSlotButtonGroupProps {
  timeSlots: TimeSlot[];
  onSelect: (selectedTimeSlot: { time: string; id: string | null }) => void; // Callback function to pass selected ID and time
}

export const RadioButtonGroup: React.FC<TimeSlotButtonGroupProps> = ({
  timeSlots,
  onSelect, // Destructure the callback function
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleButtonClick = (time: string, id: string) => {
    if (selectedId === id) return; // Prevent re-selecting the already selected button
    setSelectedId(id); // Set the clicked button's id as selected
    onSelect({ time, id }); // Call the onSelect prop and pass the selected time and id
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {timeSlots.map(({ time, id, isDisabled }) => (
        <Button
          key={time}
          color="success"
          variant={isDisabled ? "faded" : selectedId === id? "solid" : "ghost"}
          onClick={() => handleButtonClick(time, id)}
          disabled={isDisabled}
        >
          {time}
        </Button>
      ))}
    </div>
  );
};
