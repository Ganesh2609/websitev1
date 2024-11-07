import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from "@nextui-org/react";
import { ALargeSmall, Phone, Mail, FileDigit, Gem } from "lucide-react";
import { useEffect, useState } from "react";

export default function AddNurse() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  // State for form fields
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [assignedDoctor, setAssignedDoctor] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");

  const [doctors, setDoctors] = useState("");
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/deleteDoctorsFetch');
        const data = await response.json();
        setDoctors(data);
      } catch (error) {        console.error('Error fetching doctors:', error);
      }
    };
  
    fetchDoctors();
    const interval = setInterval(fetchDoctors, 2000);
    return () => clearInterval(interval);

  }, []);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nurseData = {
      username,
      firstName,
      lastName,
      phone,
      email,
      licenseNumber,
      assignedDoctor
    };
    
    try {
      const response = await fetch("http://localhost:5000/api/addNurse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nurseData),
      });
      
      if (response.ok) {
        console.log("Nurse added successfully!");
        setErrorMessage("");
        onClose();
        
      } else {
        setErrorMessage("Failed to add nurse (some constraints are not met)");
        console.error("Failed to add nurse.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="warning">Add a new nurse</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">Add a new nurse</ModalHeader>
              <ModalBody>
                <div className="mb-4">
                  <Input
                    autoFocus
                    required
                    endContent={<ALargeSmall className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                    label="User Name"
                    placeholder="Enter the nurse's user name"
                    variant="bordered"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    required
                    endContent={<ALargeSmall className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                    label="First Name"
                    placeholder="Enter the nurse's first name"
                    variant="bordered"
                    onChange={(e) => setFirstName(e.target.value)}
                    value={firstName}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    required
                    endContent={<ALargeSmall className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                    label="Last Name"
                    placeholder="Enter the nurse's last name"
                    variant="bordered"
                    onChange={(e) => setLastName(e.target.value)}
                    value={lastName}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    type="tel"
                    required
                    pattern="^\+?1?\d{10,15}$"
                    endContent={<Phone className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                    label="Phone"
                    placeholder="Enter the nurse's phone number"
                    variant="bordered"
                    onChange={(e) => setPhone(e.target.value)}
                    value={phone}
                  />
                  <span className="text-sm text-red-500">
                    {phone && !/^\+?1?\d{10,15}$/.test(phone) && 'Invalid phone number format.'}
                  </span>
                </div>

                <div className="mb-4">
                  <Input
                    type="email"
                    required
                    endContent={<Mail className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                    label="Email"
                    placeholder="Enter the nurse's E-Mail address"
                    variant="bordered"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                  <span className="text-sm text-red-500">
                    {email && !/\S+@\S+\.\S+/.test(email) && 'Invalid email format.'}
                  </span>
                </div>

                <div className="mb-4">
                  <Input
                    type="text"
                    required
                    endContent={<FileDigit className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                    label="License Number"
                    placeholder="Enter the nurse's license number"
                    variant="bordered"
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    value={licenseNumber}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="assignedDoctor" className="block font-semibold text-sm mb-1">
                    Assigned to doctor
                  </label>
                  <div className="relative">
                    <select
                      id="assignedDoctor"
                      required
                      className="appearance-none w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                      value={assignedDoctor}
                      onChange={(e) => setAssignedDoctor(e.target.value)}
                    >
                      <option value="" disabled>select a doctor to assign the nurse to</option>
                      {doctors.map((doc) => (
                        <option key={doc.doctor_id} value={doc.doctor_id}>
                          {doc.first_name} {doc.last_name}
                        </option>
                      ))}
                    </select>
                    <Gem className="absolute right-3 top-3 text-2xl text-default-400 pointer-events-none" />
                  </div>
                </div>
                
                <span className="text-sm text-red-500">
                  {errorMessage}
                </span>


              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button type="submit" color="warning" onPress={handleSubmit}>
                  Add Nurse
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
