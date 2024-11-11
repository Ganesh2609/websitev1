import React from "react";
// import { RadioGroup } from '@/components/ui/radio-group';
import { CustomRadio } from "@/components/CustomRadio";
import { RadioGroup } from "@nextui-org/react";

interface AvailableTimeSlotProps {
  timeSlots: { time: string; id: string | null; isDisabled: boolean }[];
  selectedTimeSlot: { time: string; id: string | null };
  onTimeSlotSelected: (timeSlot: { time: string; id: string | null }) => void;
}

const AvailableTimeSlots: React.FC<AvailableTimeSlotProps> = ({
  timeSlots,
  selectedTimeSlot,
  onTimeSlotSelected,
}) => {
  return (
    <div>
      <RadioGroup
        label="Available Time Slots"
        orientation="horizontal"
        value={selectedTimeSlot.time}
        onValueChange={(value) => {
          const selectedSlot = timeSlots.find((slot) => slot.time === value);
          onTimeSlotSelected(
            selectedSlot || { time: "No time slot selected", id: null }
          );
        }}
      >
        <div className="grid grid-cols-3 gap-2 max-w-[400px]">
          {timeSlots.map((slot) => (
            <CustomRadio
              key={slot.time}
              value={slot.time}
              isDisabled={slot.isDisabled}
              className="px-4 py-2 transition-all duration-200 ease-in-out"
            >
              {slot.time}
            </CustomRadio>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default AvailableTimeSlots;
