import { Tabs, Tab } from "@nextui-org/react";
import { Stethoscope, Cable } from "lucide-react";
import { useState, useEffect } from "react";

export default function NavbarAdmin() {
  // Get initial selected from URL path or default to "doctor"
  const [selected, setSelected] = useState(() => {
    const path = window.location.pathname;
    // Extract the last part of the path after /admin/
    const currentPath = path.split('/').pop() || "doctor";
    return currentPath;
  });

  const handleSelectionChange = (key: string) => {
    setSelected(key);
    // Only update location if the selected key is different from current path
    if (key !== selected) {
      window.location.href = `/admin/${key}`;
    }
  };

  return (
    <div className="flex w-full flex-col px-[5%]">
      <Tabs 
        aria-label="Options" 
        color="warning" 
        variant="bordered"
        selectedKey={selected}
        onSelectionChange={(key) => handleSelectionChange(key.toString())}
      >
        <Tab
          key="doctor"
          title={
            <div className="flex items-center space-x-2">
              <Stethoscope />
              <span>Doctor</span>
            </div>
          }
        />
        <Tab
          key="nurse"
          title={
            <div className="flex items-center space-x-2">
              <Stethoscope />
              <span>Nurse</span>
            </div>
          }
        />
        <Tab
          key="specialization"
          title={
            <div className="flex items-center space-x-2">
              <Cable />
              <span>Specialization</span>
            </div>
          }
        />
      </Tabs>
    </div>
  );
}