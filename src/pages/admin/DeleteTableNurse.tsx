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

const DeleteTableNurse = ({ nurses, onDelete }) => {
  // Pagination state
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 5; // You can make this configurable if needed
  const pages = Math.ceil(nurses.length / rowsPerPage);

  // Get current page items
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return nurses.slice(start, end);
  }, [page, nurses]);

  const renderCell = (nurse, columnKey) => {
    const cellValue = nurse[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <div>
            <p className="font-semibold">
              {nurse.first_name} {nurse.last_name}
            </p>
            <p className="text-sm text-gray-600">License: {nurse.license_number}</p>
          </div>
        );
      case "specialization":
        return (
          <p
            className={`${
              nurse.status === 'active'
                ? 'bg-green-300 text-green-900'
                : 'bg-red-300 text-red-900'
            } text-sm font-semibold py-1 px-4 rounded-full inline-block min-w-[70px] text-center`}
          >
            {nurse.status}
          </p>
        );
      case "actions":
        return nurse.status === "active" && (
          <div className="flex items-center gap-2">
            <Tooltip color="danger" content="Delete">
              <span
                className="text-lg text-danger cursor-pointer"
                onClick={() => onDelete(nurse.nurse_id)}
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
          {`Showing ${((page - 1) * rowsPerPage) + 1} to ${Math.min(page * rowsPerPage, nurses.length)} of ${nurses.length} nurses`}
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
  }, [page, pages, nurses.length]);

  return (
    <Table 
      aria-label="Nurses Table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
    >
      <TableHeader>
        <TableColumn>Name & License</TableColumn>
        <TableColumn>Status of work</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {items.map((nurse) => (
          <TableRow key={nurse.nurse_id}>
            <TableCell>{renderCell(nurse, "name")}</TableCell>
            <TableCell>{renderCell(nurse, "specialization")}</TableCell>
            <TableCell>{renderCell(nurse, "actions")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DeleteTableNurse;