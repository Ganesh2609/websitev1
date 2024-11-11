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

import {AppointmentsState } from "@/types/types";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";


import {
  getRequestsByDoctor,
} from "@/lib/actions/appointment.actions";
import { DataTable } from "@/pages/doctors/DocDataTable";
import { columns } from "@/pages/doctors/appointmentCol";

import { cn, getProperDate } from "@/lib/utils";
import {BentoGridItem } from "@/components/aceternity/bento-grid";
import {

  IconFileBroken,

  IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


import DoctorReview from "@/pages/doctors/DoctorReview";


const DoctorHome = () => {
  const [appointments, setAppointments] = useState<AppointmentsState>({
    appointments: [],
    scheduledCount: 0,
    pendingCount: 2,
    cancelledCount: 0,
  });
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const doctorId = localStorage.getItem("doctor_id");
    if (!doctorId) return;
  
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/appointments/${doctorId}`
        );
        if (!response.ok) throw new Error("Failed to fetch appointments");
  
        const data = await response.json();
        if (data.success) {
          setAppointments({
            appointments: data.appointments,
            scheduledCount: data.counts.scheduled,
            pendingCount: data.counts.pending,
            cancelledCount: data.counts.cancelled,
          });
          console.log(data);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        if (err instanceof Error) {
          // setError(err.message);
        } else {
          // setError("An unknown error occurred");
        }
      } finally {
        // setLoading(false);
      }
    };
  
    // Call `fetchAppointments` every 2 seconds
    const intervalId = setInterval(fetchAppointments, 2000);
  
    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
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

                  <h2 className="text-32-bold text-white">{2}</h2>
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

          <div className="flex flex-1 flex-row gap-4 p-4">
            <div
              className={cn(
                "rounded-xl hover:shadow-xl transition max-h-[350px] duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between space-y-4 max-w-[1200px]  "
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
                <DataTable
                  columns={columns}
                  data={appointments.appointments}
                ></DataTable>
              }
            </div>
            <BentoGridItem
              key={1}
              title={"Appionment Requests"}
              description={<span className="text-sm"></span>}
              header={<SkeletonFour />}
              className={cn(
                "[&>p:text-lg]",
                "md:col-span-4 min-w-[400px] max-h-[350px] max-w-sm"
              )}
              icon={<IconTableColumn className="h-4 w-4 text-neutral-500" />}
            />
          </div>
        </div>

        <Toaster />
      </SidebarInset>
      {/* <SidebarRight /> */}
    </SidebarProvider>
  );
};

export default DoctorHome;

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

const SkeletonFour = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get doctor ID from localStorage on mount
  useEffect(() => {
    const id = localStorage.getItem("doctor_id");
    if (id) setDoctorId(id);
  }, []);

  // Create reusable fetch function
  const fetchRequests = async (showLoading = true) => {
    if (!doctorId) return;
    if (showLoading) {
      setError(null);
      setLoading(true);
    }

    try {
      const data = await getRequestsByDoctor(doctorId);
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
  }, [doctorId]);

  // Polling
  useEffect(() => {
    if (!doctorId) return;

    const pollInterval = setInterval(() => {
      fetchRequests(false); // Don't show loading state during polling
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [doctorId]);

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
          doctorId,
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
                    <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
                      <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block">
                        <span className="absolute inset-0 overflow-hidden rounded-full">
                          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                        </span>
                        <div className="relative flex items-center z-10 rounded-full bg-zinc-950  px-4 ring-1 ring-white/10 ">
                          <span>{`Open`}</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M10.75 8.75L14.25 12L10.75 15.25"
                            ></path>
                          </svg>
                        </div>
                        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
                      </button>
                    </ModalTrigger>
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

