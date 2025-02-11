import { ITotal } from "@/hooks/components/useRecapsStore";
import { formatRupiah } from "@/lib/utils";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";


export default function DashboardTable<TData, TValue>({
    columns,
    data,
    total
}: {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    total: ITotal;
}) {

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="relative border max-h-[calc(100vh-200px)] border-neutral-200 border-solid rounded-lg overflow-auto">
            <table className="min-w-full border-separate border-spacing-0">
                <thead className="bg-slate-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="top-0 sticky z-50">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <th
                                        key={header.id}
                                        className={`h-[48px] bg-slate-200 border-b border-neutral-200 border-solid py-[14px] ${
                                            // @ts-ignore
                                            header.column.columnDef.meta?.centerHeader
                                                ? "text-center last:pr-[10px]"
                                                : "text-left first:pl-[10px]"
                                            }`}
                                        style={{
                                            ...(header.column.getSize() && {
                                                minWidth: header.column.getSize(),
                                                maxWidth: "max-content",
                                            }),
                                            // @ts-ignore
                                            ...(header.column.columnDef.meta?.stickyColumn && {
                                                right:
                                                    header.column.getSize() === 154
                                                        ? 600
                                                        : // @ts-ignore
                                                        header.column.columnDef.meta?.index *
                                                        header.column.getSize(),
                                                zIndex: 40,
                                                position: "sticky",
                                            }),
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            className="cursor-pointer hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                            key={row.id}
                        >
                            {row.getVisibleCells().map((cell) => {
                                return (
                                    <td
                                        key={cell.id}
                                        className={`h-[48px] bg-white border-b border-solid border-neutral-200 ${
                                            // @ts-ignore
                                            cell.column.columnDef.meta?.centerHeader
                                                ? "text-center last:pr-[10px]"
                                                : "text-left first:pl-[10px]"
                                            } ${
                                            // @ts-ignore
                                            cell.column.columnDef.meta?.stickyColumn || ""
                                            }`}
                                        style={{
                                            ...(cell.column.getSize() && {
                                                minWidth: cell.column.getSize(),
                                                maxWidth: "max-content",
                                            }),
                                            // @ts-ignore
                                            ...(cell.column.columnDef.meta?.stickyColumn && {
                                                right:
                                                    cell.column.getSize() === 154
                                                        ? 600
                                                        : // @ts-ignore
                                                        cell.column.columnDef.meta?.index *
                                                        cell.column.getSize(),
                                                zIndex: 20,
                                                position: "sticky",
                                            }),
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
