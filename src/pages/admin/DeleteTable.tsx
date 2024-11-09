import React from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Tooltip, 
  Button,
  Pagination
} from "@nextui-org/react";
import { DeleteIcon } from "./DeleteIcon";

const DeleteTable = ({ doctors, onDelete }) => {
  // Pagination state
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 5; // You can make this configurable if needed
  const pages = Math.ceil(doctors.length / rowsPerPage);

  // Get current page items
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return doctors.slice(start, end);
  }, [page, doctors]);

  const renderCell = (doctor, columnKey) => {
    const cellValue = doctor[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <div>
            <p className="font-semibold">
              Dr. {doctor.first_name} {doctor.last_name}
            </p>
            <p className="text-sm text-gray-600">License: {doctor.license_number}</p>
          </div>
        );
      case "specialization":
        return (
          <p className="text-sm text-green-300">{doctor.specialization_name}</p>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Tooltip color="danger" content="Delete">
              <span
                className="text-lg text-danger cursor-pointer"
                onClick={() => onDelete(doctor.doctor_id)}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  };

  // Navigation handlers
  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {`Showing ${((page - 1) * rowsPerPage) + 1} to ${Math.min(page * rowsPerPage, doctors.length)} of ${doctors.length} doctors`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="warning"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button 
            isDisabled={pages === 1 || page === 1} 
            size="sm" 
            variant="flat" 
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button 
            isDisabled={pages === 1 || page === pages} 
            size="sm" 
            variant="flat" 
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [page, pages, doctors.length]);

  return (
    <Table 
      aria-label="Doctors Table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
    >
      <TableHeader>
        <TableColumn>Name & License</TableColumn>
        <TableColumn>Specialization</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {items.map((doctor) => (
          <TableRow key={doctor.doctor_id}>
            <TableCell>{renderCell(doctor, "name")}</TableCell>
            <TableCell>{renderCell(doctor, "specialization")}</TableCell>
            <TableCell>{renderCell(doctor, "actions")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DeleteTable;