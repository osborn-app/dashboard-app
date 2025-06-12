"use client";

import { useState, useEffect } from "react";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCustomers } from "@/hooks/api/useCustomer";
import { Input, Tabs } from "antd";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import CommentDialog from "./comment-dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function VerificationTableWrapper() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const pageLimit = 10;

  const axiosAuth = useAxiosAuth();
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading } = useGetCustomers(
    {
      limit: pageLimit,
      page: page,
      status: "verified",
      statusadditionaldata: activeTab,
      q: search,
    },
      { enabled: true },
      "needconfirmation",
      "additionaldata" 
    );

  const customers = data?.items || [];
  const totalPages = data?.pagination?.total_page || 1;

  const openCommentDialog = async (id: string, status: string) => {
    setIsDialogOpen(true);
    setDialogLoading(true);
    setSelectedCustomerId(id)
    setSelectedStatus(status)
    try {
      const res = await axiosAuth.get(`/customers/${id}/comments`);
      setDialogData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setDialogLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Tabs
            defaultActiveKey="pending"
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setPage(1);
            }}
            items={[
              {
                label: (
                  <span className={`font-medium flex items-center text-[14px]`}>
                    Menunggu Konfirmasi Admin
                  </span>
                ),
                key: "pending",
              },
              {
                label: (
                  <span className={`font-medium flex items-center text-[14px]`}>
                    Menunggu User Upload
                  </span>
                ),
                key: "required",
              },
            ]}
          />
          <Input
            placeholder="Cari Berdasarkan Nama User"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-sm"
          />
        </div> 

        {/* Table */}
        <div className="rounded-md border h-[calc(80vh-220px)] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead>Nomor Darurat</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ height: '200px', textAlign: 'center', verticalAlign: 'middle' }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ height: '200px', textAlign: 'center', verticalAlign: 'middle' }}>
                    Tidak ada data ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((item: any) => (
                  <TableRow
                    key={item.id}
                    onClick={(e) => {
                      const isButton = (e.target as HTMLElement).closest('button');
                      if (!isButton) {
                        router.push(`/dashboard/customers/${item.id}/detail`);
                      }
                    }}
                    style={{ cursor: 'pointer' }} 
                  >
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.phone_number}</TableCell>
                    <TableCell>{item.emergency_phone_number}</TableCell>
                    <TableCell>
                      {item.gender === 'male' ? 'Pria' : item.gender === 'female' ? 'Wanita' : item.gender}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          openCommentDialog(item.id, item.additional_data_status);
                        }}
                      >
                        Tinjau
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
          <div className="flex w-[120px] items-center justify-center text-sm font-medium">
            Halaman {page} dari {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              aria-label="Go to first page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to previous page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to next page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to last page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <CommentDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        commentData={dialogData}
        loading={dialogLoading}
        customerId={selectedCustomerId}
        status_data='pending'
      />

    </>
  );
}
