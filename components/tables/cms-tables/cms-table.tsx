"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { CMSItem, CMSTableProps } from "@/components/forms/types/cms";
import { X, Check, Link, Plus } from "lucide-react"
import { Popover } from "antd"
import { cn } from "@/lib/tiptap-utils";
import { useRouter } from "next/navigation";
import { formatDate, formatDateWithTimezone,  } from "@/lib/utils";


export function CMSTable({
  data,
  pageCount,
  pageNo,
  pageSize,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onPageChange,
  onPageSizeChange,
  onToggleStatus,
}: CMSTableProps) {
  const [rows, setRows] = React.useState<CMSItem[]>(() => data);
  const [loadingToggle, setLoadingToggle] = React.useState<number | null>(null);

  React.useEffect(() => {
    setRows(data);
  }, [data, pageNo, pageSize]);

  const canPreviousPage = pageNo > 1;
  const canNextPage = pageNo < pageCount;
  const router = useRouter();
  const handleFirstPage = () => onPageChange?.(1);
  const handlePreviousPage = () => canPreviousPage && onPageChange?.(pageNo - 1);
  const handleNextPage = () => canNextPage && onPageChange?.(pageNo + 1);
  const handleLastPage = () => onPageChange?.(pageCount);
  const handlePageSizeChange = (value: string) => onPageSizeChange?.(Number(value));

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    if (!onToggleStatus) return;

    setLoadingToggle(id);

    setRows((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_active: newStatus } : item))
    );

    try {
      await onToggleStatus(id, newStatus);
    } catch (error) {
      setRows((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: !newStatus } : item
        )
      );
    } finally {
      setLoadingToggle(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">

        <Table className="table-fixed w-full min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[5%] text-center">No</TableHead>
              <TableHead className="w-[25%]">Judul Artikel</TableHead>
              <TableHead className="w-[15%]">Tanggal Dibuat</TableHead>
              <TableHead className="w-[15%]">Tanggal Update</TableHead>
              <TableHead className="w-[8%] text-center">Indexed</TableHead>
              <TableHead className="w-[10%] text-center">Status</TableHead>
              <TableHead className="w-[13%] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">
                    {(pageNo - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="pr-2">
                    <div 
                      className="line-clamp-2 text-sm leading-relaxed" 
                      title={item.title}
                    >
                      {item.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div 
                      className="line-clamp-2 text-sm leading-relaxed break-words"
                      title={formatDateWithTimezone((item.created_at))}
                    >
                      {formatDateWithTimezone((item.created_at))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div 
                      className="line-clamp-2 text-sm leading-relaxed break-words"
                      title={formatDateWithTimezone((item.updated_at))}
                    >
                      {formatDateWithTimezone((item.updated_at))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.already_indexed ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={item.is_active}
                        disabled={loadingToggle === item.id}
                        onCheckedChange={(checked) =>
                          handleToggleStatus(item.id, checked)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Popover
                        placement="left"
                        trigger="click"
                        content={
                          <div className="max-w-[250px] p-3 flex flex-col gap-2">
                            <a
                              href={`https://transgo.id/content/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                            >
                              Lihat Artikel
                            </a>


                            <hr className="border-gray-200 my-1" />

                           <button
                            className="text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                            onClick={() => router.push(`/dashboard/cms/edit/${item.id}`)}
                          >
                            Edit Artikel
                          </button>
                          </div>
                        }
                      >
                        <Button>
                          Lihat Detail
                        </Button>
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
          <div className="flex items-center space-x-2">
            <p className="whitespace-nowrap text-sm font-medium">
              Data per halaman
            </p>
            <Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="flex w-[120px] items-center justify-center text-sm font-medium">
            Halaman {pageNo} dari {pageCount}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              aria-label="Go to first page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={handleFirstPage}
              disabled={!canPreviousPage}
            >
              <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to previous page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handlePreviousPage}
              disabled={!canPreviousPage}
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to next page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handleNextPage}
              disabled={!canNextPage}
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to last page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={handleLastPage}
              disabled={!canNextPage}
            >
              <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}