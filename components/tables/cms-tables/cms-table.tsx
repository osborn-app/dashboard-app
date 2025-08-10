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
import { Button } from "@/components/ui/button";
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


export function CMSTable({
  data,
  pageCount,
  pageNo,
  pageSize,
  totalUsers,
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{(pageNo - 1) * pageSize + index + 1}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell className="max-w-[250px] truncate">
                    {item.description}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.is_active}
                      disabled={loadingToggle === item.id}
                      onCheckedChange={(checked) =>
                        handleToggleStatus(item.id, checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
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