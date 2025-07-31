import React from "react";
import { useRouter } from "next/router";
import { needsColumns } from "./columns";

type NeedsTableProps = {
  data: any[];
};

const NeedsTable: React.FC<NeedsTableProps> = ({ data }) => {
  const router = useRouter();

  const handleRowClick = (row: any) => {
    router.push(`/dashboard/maintenance/${row.id}/detail`);
  };

  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          {needsColumns.map((col, idx) => (
            <th key={idx} className="border px-2 py-1 text-left">{col.Header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={row.id || idx}
            className="hover:bg-gray-100 cursor-pointer"
            onClick={() => handleRowClick(row)}
          >
            {needsColumns.map((col, cidx) => (
              <td key={cidx} className="border px-2 py-1">
                {col.Cell
                  ? col.Cell({ value: row[col.accessor], row })
                  : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default NeedsTable;
