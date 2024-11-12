import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Pagination,
  Input,
} from "@nextui-org/react";
import { SearchIcon } from "@/pages/nurses/SearchIcon.tsx";

type Status = "active" | "paused" | "vacation";
type Status2 = "success" | "danger" | "warning";

const statusColorMap: Record<Status, Status2> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

type AppointmentRequest = {
  request_id: number;
  patient_name: string;
  doctor_name: string;
  preferred_date: string;
  day_of_week: string;
  start_time: string;
  reason: string;
  urgency_level: Status;
};

export default function RequestTable() {
  const [filterValue, setFilterValue] = useState("");
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Fetch appointment requests when the nurseId changes
  useEffect(() => {
    const fetchAppointmentRequests = async () => {
      try {
        const path = window.location.pathname;
        const parts = path.split("/");
        const userId = parts[2];

        const res1 = await fetch(`http://4.240.76.79:3000/api/getNurseId/${userId}`);
        const nurseId = await res1.json()

        const res = await fetch(`http://4.240.76.79:3000/api/appointmentRequests/${nurseId[0].nurse_id}`);
        const data = await res.json();
        setAppointmentRequests(data);
        setTotalPages(Math.ceil(data.length / rowsPerPage)); // Update the pagination
      } catch (error) {
        console.error("Error fetching appointment requests:", error);
      }
    };

    fetchAppointmentRequests();

    const intervalId = setInterval(fetchAppointmentRequests, 2000);
    return () => clearInterval(intervalId);
    
  }, [rowsPerPage]);

  const filteredItems = appointmentRequests.filter((request) =>
    request.patient_name.toLowerCase().includes(filterValue.toLowerCase())
  );

  const paginatedItems = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleAccept = async (requestId:any) => {
    try {
      await fetch(`http://4.240.76.79:3000/api/nurseAcceptAppointmentRequest/${requestId}`, {
        method: 'POST',
      });
      
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  }

  const handleReject = async (requestId:any) => {
    try {
      await fetch(`http://4.240.76.79:3000/api/nurseRejectAppointmentRequest/${requestId}`, {
        method: 'POST',
      });

    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  }


  const formatDate = (dateString:any, startTime:any) => {
    const date = new Date(dateString); // The full date string including the date and time
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }); // Get the day of the week
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }); // Format the full date
  
    const formattedStartTime = new Date(`1970-01-01T${startTime}Z`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }); // Format the start time
  
    return `${formattedDate} (${dayOfWeek}) at ${formattedStartTime}`;
  };

  

  const renderCell = (request: AppointmentRequest, columnKey: string) => {
    switch (columnKey) {
      case "patient_name":
        return <span>{request.patient_name}</span>;
      case "doctor_name":
        return <span>{request.doctor_name}</span>;
      case "date_time":
        return (
          <span>
            {formatDate(request.preferred_date, request.start_time)}
          </span>
        );
      case "reason":
        return <span>{request.reason}</span>;
      case "urgency_level":
        return <Chip color={statusColorMap[request.urgency_level] || "default"}>{request.urgency_level}</Chip>;
      case "actions":
        return (
          <div className="flex gap-2">
            <Button size="sm" color="success" onClick={() => handleAccept(request.request_id)}>
              Accept
            </Button>
            <Button size="sm" color="danger" onClick={() => handleReject(request.request_id)}>
              Reject
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          isClearable
          placeholder="Search by patient name"
          size="sm"
          startContent={<SearchIcon />}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
      </div>
      <Table aria-label="Appointment Requests Table">
        <TableHeader>
          <TableColumn>PATIENT NAME</TableColumn>
          <TableColumn>DOCTOR NAME</TableColumn>
          <TableColumn>DATE & TIME</TableColumn>
          <TableColumn>REASON</TableColumn>
          <TableColumn>URGENCY LEVEL</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((request) => (
            <TableRow key={request.request_id}>
              <TableCell>{renderCell(request, "patient_name")}</TableCell>
              <TableCell>{renderCell(request, "doctor_name")}</TableCell>
              <TableCell>{renderCell(request, "date_time")}</TableCell>
              <TableCell>{renderCell(request, "reason")}</TableCell>
              <TableCell>{renderCell(request, "urgency_level")}</TableCell>
              <TableCell>{renderCell(request, "actions")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Pagination
          page={page}
          total={totalPages}
          onChange={setPage}
          showControls
          color = "warning"
        />
        <span>{filteredItems.length} requests found</span>
      </div>
    </div>
  );
}
