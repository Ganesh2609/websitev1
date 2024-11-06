import { HomeSidebar } from "@/pages/doctors/HomeSidebar";
// import { SidebarRight } from "@/components/sidebar-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/aceternity/animated-modal";

import { WobbleCard } from "@/components/aceternity/WobbleCard";

import appointmentsImg from "@/assets/icons/appointments.svg";
import pendingImg from "@/assets/icons/pending.svg";
import cancelledImg from "@/assets/icons/cancelled.svg";

import { AppointmentsState } from "@/types/types";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";

import { getRequestsByPatient } from "@/lib/actions/appointment.actions";
import { DataTable } from "@/pages/doctors/DocDataTable";
import { columns } from "@/pages/patients/appointmentCol";

import { cn, getProperDate } from "@/lib/utils";
import { BentoGridItem, BentoGrid } from "@/components/aceternity/bento-grid";
import {
  IconFileBroken,
  IconTableColumn,
  IconUsersGroup,
  IconManFilled,
  IconDentalBroken,
  IconEarScan,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { NCard, NCardBody } from "@nextui-org/react";

import { Tabs, Tab, Chip } from "@nextui-org/react";

const PatientHome = () => {
  const [appointments, setAppointments] = useState<AppointmentsState>({
    appointments: [],
    scheduledCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctype, setdoctype] = useState<string>("general");

  useEffect(() => {
    const patientId = localStorage.getItem("patient_id");
    if (!patientId) return;

    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/appointments/patient/${patientId}`
        );
        if (!response.ok) throw new Error("Failed to fetch appointments");

        const data = await response.json();
        if (data.success) {
          setAppointments({
            appointments: data.appointments,
            scheduledCount: 0,
            pendingCount: 0,
            cancelledCount: 0,
          });
          console.log(data);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <SidebarProvider>
      <HomeSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <WobbleCard
              containerClassName="col-span-1 h-full  lg:max-h-[200px]"
              className=""
            >
              <div className="flex flex-col gap-7">
                <div className="flex items-center gap-4">
                  <img
                    src={appointmentsImg}
                    style={{ height: "48px", width: "48px" }}
                    alt="appointments"
                    className="size-8 w-fit"
                  />
                  <h2 className="text-32-bold text-white">{appointments.scheduledCount}</h2>
                </div>
                <h2 className="text-left text-balance text-base md:text-xl lg:text-2xl font-semibold tracking-[-0.015em] text-white">
                  Scheduled appointments
                </h2>
              </div>
            </WobbleCard>
            <WobbleCard containerClassName="col-span-1 bg-pink-800 lg:max-h-[200px] items-center justify-center">
              <div className="flex flex-col gap-7">
                <div className="flex items-center gap-4">
                  <img
                    src={pendingImg}
                    style={{ height: "48px", width: "48px" }} // Increased size
                    alt="appointments"
                    className="size-8 w-fit"
                  />

                  <h2 className="text-32-bold text-white">{appointments.pendingCount}</h2>
                </div>

                <h2 className="max-w-sm  text-left text-balance text-base md:text-xl lg:text-2xl font-semibold tracking-[-0.015em] text-white">
                  Pending appointments
                </h2>
              </div>
            </WobbleCard>
            <WobbleCard containerClassName="col-span-1 lg:col-span-1 bg-blue-900 lg:max-h-[200px]">
              <div className="flex flex-col gap-7">
                <div className="flex items-center gap-4">
                  <img
                    src={cancelledImg}
                    style={{ height: "48px", width: "48px" }}
                    alt="appointments"
                    className="size-8 w-fit"
                  />
                  <h2 className="text-32-bold text-white">{appointments.cancelledCount}</h2>
                </div>
                <h2 className="max-w-sm md:max-w-lg  text-left  text-base md:text-xl lg:text-2xl font-semibold tracking-[-0.015em] text-white">
                  Cancelled appointments
                </h2>
              </div>
            </WobbleCard>
          </div>

          <BentoGrid>
            {/* <div
                className={cn(
                  "rounded-xl hover:shadow-xl transition max-h-[350px] duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between space-y-4 min-w-[940px]  "
                )}
              >
                <div className="group-hover/bento:translate-x-2 transition duration-200">
                  {<IconFileBroken className="h-4 w-4 text-neutral-500" />}
                  <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
                    {"Upcoming Appionments"}
                  </div>
                  <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
                    <span className="text-sm"></span>
                  </div>
                </div>
                {
                  
                }
              </div> */}
            <BentoGridItem
              key={0}
              title={
                <h2 className="text-2xl text-white">Book Appionment Now</h2>
              }
              description={
                <div className="flex flex-col">
                  <Tabs
                    aria-label="Options"
                    color="primary"
                    variant="underlined"
                    classNames={{
                      tabList:
                        "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                      cursor: "w-full bg-[#22d3ee]",
                      tab: "max-w-fit px-0 h-12",
                      tabContent: "group-data-[selected=true]:text-[#06b6d4]",
                    }}
                    onSelectionChange={(key) => setdoctype(key.toString())}
                  >
                    <Tab
                      key="general"
                      title={
                        <div className="flex items-center space-x-2">
                          <IconUsersGroup />
                          <span>General</span>
                          {/* <Chip size="sm" variant="faded">
                            9
                          </Chip> */}
                        </div>
                      }
                    />
                    <Tab
                      key="pediatric"
                      title={
                        <div className="flex items-center space-x-2">
                          <IconManFilled />
                          <span>Pediatric</span>
                        </div>
                      }
                    />
                    <Tab
                      key="dentist"
                      title={
                        <div className="flex items-center space-x-2">
                          <IconDentalBroken />
                          <span>Dentist</span>
                        </div>
                      }
                    />
                    <Tab
                      key="ent"
                      title={
                        <div className="flex items-center space-x-2">
                          <IconEarScan />
                          <span>ENT Specialist</span>
                        </div>
                      }
                    />
                  </Tabs>
                </div>
              }
              header={<SkeletonTwo docType={doctype} />}
              className={cn("[&>p:text-lg]", "col-span-7")}
              // icon={<IconFileBroken className="h-4 w-4 text-neutral-500" />}
            />

            <BentoGridItem
              key={1}
              title={"Upcoming Appionments"}
              description={<span className="text-sm"></span>}
              header={
                <DataTable
                  columns={columns}
                  data={appointments.appointments}
                ></DataTable>
              }
              className={cn("[&>p:text-lg]", "md:col-span-8", "max-h-[360px]")}
              icon={<IconFileBroken className="h-4 w-4 text-neutral-500" />}
            />
            <BentoGridItem
              key={2}
              title={"Appionment Requests"}
              description={<span className="text-sm"></span>}
              header={<SkeletonFour />}
              className={cn("[&>p:text-lg]", "md:col-span-4 ", "max-h-[360px]")}
              icon={<IconTableColumn className="h-4 w-4 text-neutral-500" />}
            />
          </BentoGrid>
          <NotificationsModal userId={localStorage.getItem("userId")} />
        </div>

        <Toaster />
      </SidebarInset>
      {/* <SidebarRight /> */}
    </SidebarProvider>
  );
};

export default PatientHome;

import { Select, SelectItem, DatePicker, Button } from "@nextui-org/react";
import { IconStethoscope, IconSearch } from "@tabler/icons-react";
import { CheckboxGroup } from "@nextui-org/react";
import { CustomCheckbox } from "@/pages/patients/DoctorCard";
import { Doctors, getDoctorIcon } from "@/constants/index";
import { Doctor } from "@/types/types";

interface SpecializationData {
  [key: string]: { key: string; label: string }[];
}

const SkeletonTwo = ({ docType }: { docType: string }) => {
  const [groupSelected, setGroupSelected] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  const specializationsData: SpecializationData = {
    dentist: [
      { key: "general-dentist", label: "General Dentist" },
      { key: "orthodontist", label: "Orthodontist" },
      { key: "pediatric-dentist", label: "Pediatric Dentist" },
      { key: "periodontist", label: "Periodontist" },
      { key: "cosmetic-dentist", label: "Cosmetic Dentist" },
      { key: "oral-surgeon", label: "Oral Surgeon" },
      { key: "prosthodontist", label: "Prosthodontist" },
    ],
    general: [
      { key: "family-medicine", label: "Family Medicine" },
      { key: "internal-medicine", label: "Internal Medicine" },
      { key: "geriatric-medicine", label: "Geriatric Medicine" },
      { key: "sports-medicine", label: "Sports Medicine" },
      { key: "preventive-medicine", label: "Preventive Medicine" },
      { key: "emergency-medicine", label: "Emergency Medicine" },
      { key: "hospitalist", label: "Hospitalist" },
    ],
    pediatric: [
      { key: "pediatric-cardiology", label: "Pediatric Cardiology" },
      { key: "pediatric-neurology", label: "Pediatric Neurology" },
      { key: "pediatric-oncology", label: "Pediatric Oncology" },
      { key: "pediatric-endocrinology", label: "Pediatric Endocrinology" },
      { key: "pediatric-gastroenterology", label: "Pediatric Gastroenterology" },
      { key: "neonatology", label: "Neonatology" },
      { key: "pediatric-pulmonology", label: "Pediatric Pulmonology" },
    ],
    ent: [
      { key: "otolaryngology", label: "Otolaryngology" },
      { key: "rhinology", label: "Rhinology" },
      { key: "laryngology", label: "Laryngology" },
      { key: "neurotology", label: "Neurotology" },
      { key: "pediatric-ent", label: "Pediatric ENT" },
      { key: "skull-base-surgery", label: "Skull Base Surgery" },
      { key: "facial-plastic-surgery", label: "Facial Plastic Surgery" },
    ],
  };

  const specializations = specializationsData[docType] || [];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/doctors/active");
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error("Error fetching active doctors:", error);
    }
  };

  return (
    <Modal>
      <motion.div
        initial="initial"
        animate="animate"
        whileHover="hover"
        className="w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2]"
      >
        <div className="flex w-full h-full flex-row gap-5 mt-3">
          <Select
            variant="bordered"
            label={<h2 className="text-xl mb-0.5 text-white">Specialist</h2>}
            placeholder="Select a Specialist"
            className="bg-black bg-opacity-50 mt-0"
            size="lg"
            startContent={<IconStethoscope />}
          >
            {specializations.map((specialization) => (
              <SelectItem key={specialization.key} value={specialization.key}>
                {specialization.label}
              </SelectItem>
            ))}
          </Select>

          <DatePicker
            label={<h2 className="text-lg text-white">Appointment Date</h2>}
            size="lg"
            variant="bordered"
            className="bg-black bg-opacity-50"
          />

          <div className="relative">
            <Button
              color="success"
              endContent={<IconSearch />}
              className="group-hover/modal-btn min-w-[170px] mt-5"
            >
              <h4 className="text-18-bold text-black">Search</h4>
            </Button>

            <ModalTrigger className="absolute inset-0 max-h-[40px] mt-5 bg-transparent cursor-pointer z-10">
              <div></div>
            </ModalTrigger>
          </div>
        </div>
      </motion.div>

      <ModalBody>
        <ModalContent className="min-w-[900px]">
          <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold mb-8">
            Book your Appointment now!
          </h4>

          <div className="flex flex-col gap-1 w-full">
            <CheckboxGroup
              label="Select Doctor"
              value={groupSelected}
              onChange={setGroupSelected}
              color="success"
              orientation="horizontal"
              classNames={{
                base: "w-full",
              
              }}
            >
              {doctors.map((doctor) => {
                const doctorIcon = getDoctorIcon(doctor.first_name, doctor.last_name);
                const doctorName = `${doctor.first_name} ${doctor.last_name}`;
                return (
                  <CustomCheckbox
                    key={doctor.doctor_id}
                    value={doctor.doctor_id}
                    user={{
                      name: doctorName,
                      avatar: doctorIcon as string,
                      username: '',
                      url: "#",
                      role: "Experience: "+ doctor.years_of_experience.toString() + " Years",
                      status: doctor.status || "Active",
                    }}
                    statusColor="success"
                  />
                );
              })}
            </CheckboxGroup>
            
            {groupSelected.length > 0 && (
              <div className="mt-4 ml-1 text-default-500">
                <p>Selected Doctors:</p>
                <ul className="list-disc ml-6">
                  {groupSelected.map((doctorId) => {
                    const doctor = doctors.find(d => d.doctor_id === doctorId);
                    return doctor && (
                      <li key={doctorId}>
                        Dr. {doctor.first_name} {doctor.last_name} - {doctor.doctor_id}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </ModalContent>
        <ModalFooter className="gap-4">
          <button className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
            Cancel
          </button>
          <button className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28">
            Book Now
          </button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
};


type Request = {
  request_id: string;
  doctor_id: string;
  patient_id: string;
  preferred_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  day_of_week: string[];
  fname: string;
  lname: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
};

import { Clock, Calendar, User2, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import NotificationsModal from "@/components/notifiction";
import axios from "axios";

const SkeletonFour = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setpatientId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get doctor ID from localStorage on mount
  useEffect(() => {
    const id = localStorage.getItem("patient_id");
    if (id) setpatientId(id);
  }, []);

  // Create reusable fetch function
  const fetchRequests = async (showLoading = true) => {
    if (!patientId) return;
    if (showLoading) {
      setError(null);
      setLoading(true);
    }

    try {
      const data = await getRequestsByPatient(patientId);
      if (Array.isArray(data) && data.length > 0) {
        const newData = data.slice(0, 2);
        // Only update if data has changed
        setRequests((prev) => {
          const hasChanged = newData.some(
            (req, index) => req.request_id !== prev[index]?.request_id
          );
          return hasChanged ? newData : prev;
        });
        console.log("newData", newData);
      } else {
        setError("No requests found");
        setRequests([]);
      }
    } catch (err) {
      if (!showLoading) {
        // Only log error during polling
        console.error("Error fetching requests:", err);
        return;
      }

      if ((err as { response?: { status: number } }).response?.status === 404) {
        setError("No requests found");
        setRequests([]);
      } else {
        setError("Failed to fetch appointments");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRequests(true);
  }, [patientId]);

  // Polling
  useEffect(() => {
    if (!patientId) return;

    const pollInterval = setInterval(() => {
      fetchRequests(false); // Don't show loading state during polling
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [patientId]);

  const handleAppointmentAction = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    setProcessingId(requestId);
    try {
      const endpoint =
        action === "approve"
          ? "http://localhost:5000/api/appointments/approve"
          : "http://localhost:5000/api/appointments/reject";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          patientId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} appointment`);
      }

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.request_id !== requestId)
      );

      // Show success notification
      toast({
        title: `Appointment ${action === "approve" ? "Booked" : "Rejected"}`,
        description: `Successfully ${
          action === "approve" ? "booked" : "rejected"
        } the appointment request.`,
        variant: action === "approve" ? "default" : "destructive",
      });
    } catch (err) {
      console.error(`Error ${action}ing appointment:`, err);
      toast({
        title: "Error",
        description: `Failed to ${action} appointment. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: {
      y: -5,
      transition: { duration: 0.2 },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-1 w-full h-full min-h-[6rem] gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="w-1/2">
            <Card className="h-full">
              <CardContent className="p-4 flex flex-col items-center space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[6rem] bg-red-50 dark:bg-red-950/20 rounded-lg">
        <p className="text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
          <span className="i-lucide-alert-circle" /> {error}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <div className="flex flex-1 w-full h-full min-h-[6rem] gap-4 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />

        {requests.map((request) => (
          <Modal>
            <motion.div
              key={request.request_id}
              initial="initial"
              animate="animate"
              whileHover="hover"
              variants={cardVariants}
              className="w-1/2"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="h-full backdrop-blur-lg bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black  transition-colors duration-300">
                      <CardContent className="p-6 flex flex-col items-center">
                        <div className="relative">
                          <div className="absolute -inset-1  bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur opacity-70" />
                          <img
                            src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
                            alt="avatar"
                            className="relative rounded-full h-12 w-12 border-2 border-white dark:border-black"
                          />
                        </div>

                        <div className="mt-4 space-y-2 w-full">
                          <div className="flex items-center justify-center gap-2">
                            <User2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {request.fname} {request.lname}
                            </p>
                          </div>

                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {getProperDate(request.preferred_date).dateOnly}
                            </p>
                          </div>

                          <div className="flex items-center justify-center gap-2">
                            <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                              {request.reason}
                            </p>
                          </div>

                          <div className="flex items-center justify-center">
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full  bg-gradient-to-r from-pink-500 to-violet-500">
                              <Clock className="w-3 h-3 text-white" />
                              <p className="text-xs font-medium text-white">
                                {request.start_time.split(":")[0] +
                                  ":" +
                                  request.start_time.split(":")[1]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>

            <ModalBody>
              <ModalContent>
                <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                  Aprrove{" "}
                  <span className="px-1 py-0.5  rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                    Patient Request
                  </span>{" "}
                  now! ✔️
                </h4>
                <div className="py-6 flex justify-center items-center">
                  <motion.div
                    key={"images"}
                    style={{
                      rotate: 0,
                    }}
                    whileHover={{
                      scale: 1.1,
                      rotate: 0,
                      zIndex: 100,
                    }}
                    whileTap={{
                      scale: 1.1,
                      rotate: 0,
                      zIndex: 100,
                    }}
                    className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 flex-shrink-0 overflow-hidden"
                  >
                    <img
                      src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
                      alt="avatar"
                      className="relative h-20 w-20 border-2 border-white dark:border-black"
                    />
                  </motion.div>
                </div>
                <div className="mt-4 px-20 space-x-5 w-full p-6 flex flex-row items-center">
                  <div className="flex items-center justify-center gap-2">
                    <User2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {request.fname} {request.lname}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {getProperDate(request.preferred_date).dateOnly}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                      {request.reason}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full  bg-gradient-to-r from-pink-500 to-violet-500">
                      <Clock className="w-3 h-3 text-white" />
                      <p className="text-xs font-medium text-white">
                        {request.start_time.split(":")[0] +
                          ":" +
                          request.start_time.split(":")[1]}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalContent>
              <ModalFooter className="gap-6">
                <button
                  className={`px-2 py-1 bg-gray-200 text-black dark:bg-green-500 dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28 ${
                    processingId === request.request_id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() =>
                    handleAppointmentAction(request.request_id, "reject")
                  }
                  disabled={processingId === request.request_id}
                >
                  {processingId === request.request_id
                    ? "Processing..."
                    : "Reject"}
                </button>
                <button
                  className={`bg-black text-white dark:bg-red-700 dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28 ${
                    processingId === request.request_id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() =>
                    handleAppointmentAction(request.request_id, "approve")
                  }
                  disabled={processingId === request.request_id}
                >
                  {processingId === request.request_id
                    ? "Processing..."
                    : "Book Now"}
                </button>
              </ModalFooter>
            </ModalBody>
          </Modal>
        ))}
      </div>
    </motion.div>
  );
};
