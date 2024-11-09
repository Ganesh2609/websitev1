"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Appointment } from "@/types/types";
import { StatusBadge } from "@/components/StatusBadge";
import { getProperDate } from "@/lib/utils";


export const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-medium ">
          {appointment.patient_first_name + " " + appointment.patient_last_name}
        </p>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const appointment = row.original;
      return <p className="text-14-medium ">{appointment.reason}</p>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular min-w-[100px]">
          {getProperDate(appointment.date.toString()).dateOnly}
        </p>
      );
    },
  },
  {
    accessorKey: "slot",
    header: "Solt",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular min-w-[100px]">
          {appointment.start_time}
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
  }
];
