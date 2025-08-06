import React from "react";
import CellAction from "./call-action";

export const needsColumns = [
  {
    Header: "Armada",
    accessor: "armada",
  },
  {
    Header: "Mulai",
    accessor: "mulai",
    Cell: ({ value }: { value: string }) =>
      value ? new Date(value).toLocaleDateString() : "-",
  },
  {
    Header: "Estimasi (hari)",
    accessor: "estimasi",
  },
  {
    Header: "Aksi",
    accessor: "action",
    Cell: ({ row }: { row: any }) => <CellAction row={row} />,
  },
];
