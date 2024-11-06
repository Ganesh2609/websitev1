import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from "@nextui-org/react";
import { ALargeSmall, Phone, Mail, FileDigit, Gem } from "lucide-react";
import { useEffect, useState } from "react";

export default function AddDoctor() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  // State for form fields
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [startedWorkingAt, setStartedWorkingAt] = useState("");
  const [specializations, setSpecializations] = useState([]);
  
  const [errorMessage, setErrorMessage] = useState("");
  
  // Fetch specializations on component mount
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/getSpecializations");
        const data = await response.json();
        setSpecializations(data);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };

    fetchSpecializations();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const doctorData = {
      username,
      firstName,
      lastName,
      phone,
      email,
      licenseNumber,
      specializationId,
      startedWorkingAt,
    };
    
    try {
      const response = await fetch("http://localhost:5000/api/addDoctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctorData),
      });
      
      if (response.ok) {
        console.log("Doctor added successfully!");
        setErrorMessage("");
        onClose();
        
      } else {
        setErrorMessage("Failed to add doctor (some constraints are not met)");
        console.error("Failed to add doctor.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="warning">Add a new doctor</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">Add a new doctor</ModalHeader>
              <ModalBody>
                <div className="mb-4">
                  <Input
                    autoFocus
                    required
                    endContent={<ALargeSmall className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                    label="User Name"
                    placeholder="Enter the doctor's user name"
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
                    placeholder="Enter the doctor's first name"
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
                    placeholder="Enter the doctor's last name"
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
                    placeholder="Enter the doctor's phone number"
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
                    placeholder="Enter the doctor's E-Mail address"
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
                    placeholder="Enter the doctor's license number"
                    variant="bordered"
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    value={licenseNumber}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="specialization" className="block font-semibold text-sm mb-1">
                    Specialization
                  </label>
                  <div className="relative">
                    <select
                      id="specialization"
                      required
                      className="appearance-none w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                      value={specializationId}
                      onChange={(e) => setSpecializationId(e.target.value)}
                    >
                      <option value="" disabled>select a specialization</option>
                      {specializations.map((spec) => (
                        <option key={spec.specialization_id} value={spec.specialization_id}>
                          {spec.specialization_name}
                        </option>
                      ))}
                    </select>
                    <Gem className="absolute right-3 top-3 text-2xl text-default-400 pointer-events-none" />
                  </div>
                </div>

                <div className="mb-4">
                  <Input
                    type="date"
                    required
                    label="Started Working At"
                    variant="bordered"
                    value={startedWorkingAt}
                    onChange={(e) => setStartedWorkingAt(e.target.value)}
                  />
                </div>

                <div>
                  {startedWorkingAt && (
                    <p>Years of Experience: {new Date().getFullYear() - new Date(startedWorkingAt).getFullYear()}</p>
                  )}
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
                  Add Doctor
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
