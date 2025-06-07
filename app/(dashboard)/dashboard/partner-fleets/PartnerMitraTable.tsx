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
import { Input, Select } from "antd";
import Swal from "sweetalert2";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";


type FleetParner = {
  id: number;
  fleet_name: string;
  number_plate: string;
  color: string;
  driver_id?: number;
  name?: string;
};




export default function DriverMitraTable() {
  const [drivers, setDrivers] = useState<FleetParner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [unassignedDrivers, setUnassignedDrivers] = useState<any[]>([]); 
  const [currentDriverOption, setCurrentDriverOption] = useState<any | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formDriverName, setFormDriverName] = useState("");
  const [formPhoneNumber, setFormPhoneNumber] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [driverId, setDriverId] = useState<number | undefined>(undefined);
  const [modalLoading, setModalLoading] = useState(false);

  const axiosAuth = useAxiosAuth();

  const resetModalState = () => {
    setFormDriverName("");
    setFormPhoneNumber("");
    setEditId(null);
    setDriverId(undefined);
    setCurrentDriverOption(null);
    setModalMode("add");
  };



  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchInput]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        q: search,
      });

      const res = await axiosAuth.get(`/fleet-mitra?${params.toString()}`);
      
      const json = res.data;
      
      setDrivers(json.data);
      setTotal(json.total);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedDrivers = async () => {
    try {
      const res = await axiosAuth.get("/driver_mitra/unassigned");
      setUnassignedDrivers(res.data);
    } catch (error) {
      console.error("Gagal mengambil driver yang belum ditugaskan:", error);
    }
  };


  useEffect(() => {
    fetchDrivers();
    fetchUnassignedDrivers();
  }, [search, page]);

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus driver?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axiosAuth.delete(`/fleet-mitra/${id}`);

        if (res.status === 200) {
          Swal.fire("Berhasil!", "Driver telah dihapus.", "success");
          fetchDrivers(); 
        } else {
          throw new Error("Gagal menghapus data.");
        }
      } catch (err) {
        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus.", "error");
      }
    }
  };


  // Open modal add
  const openAddModal = () => {
    resetModalState();
    setModalMode("add");
    setFormDriverName("");
    setFormPhoneNumber("");
    setEditId(null);
    setModalOpen(true);
    setDriverId(undefined);
  };

  // Open modal edit, fetch by id
  const openEditModal = async (id: number) => {
  resetModalState();
  setModalMode("edit");
  setModalOpen(true);
  setModalLoading(true);
  try {
    const res = await axiosAuth.get(`/fleet-mitra/${id}`);
    const driver: FleetParner = res.data;

    setFormDriverName(driver.fleet_name);
    setFormPhoneNumber(driver.number_plate);
    setEditId(driver.id);
    setDriverId(driver.driver_id);

    if (driver.driver_id && driver.name) {
      setCurrentDriverOption({
        value: driver.driver_id,
        label: driver.name,
      });
    } else {
      setCurrentDriverOption(null);
    }
  } catch (error) {
    Swal.fire("Error", "Gagal memuat data driver", "error");
    setModalOpen(false);
  } finally {
    setModalLoading(false);
  }
};



  // Submit form add or edit
  const handleSubmit = async () => {
    if (!formDriverName.trim() || !formPhoneNumber.trim()) {
      Swal.fire("Peringatan", "Nama dan No. Telepon wajib diisi", "warning");
      return;
    }
    setModalLoading(true);
    try {
      let res;
      if (modalMode === "add") {
        res = await axiosAuth.post("/fleet-mitra", {
          fleet_name: formDriverName,
          number_plate: formPhoneNumber,
          driver_id: driverId,
        });
      } else if (modalMode === "edit" && editId !== null) {
        res = await axiosAuth.put(`/fleet-mitra/${editId}`, {
          fleet_name: formDriverName,
          number_plate: formPhoneNumber,
          driver_id: driverId, 
        });
      }

      if (res && res.status === 200 || res?.status === 201) {
        Swal.fire("Sukses", `Driver berhasil ${modalMode === "add" ? "ditambah" : "diedit"}`, "success");
        setModalOpen(false);
        fetchDrivers();
        fetchUnassignedDrivers()
      } else {
        throw new Error("Gagal menyimpan data");
      }
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan data driver", "error");
    } finally {
      setModalLoading(false);
    }
  };


  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Cari nama driver..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button size="sm" onClick={openAddModal}>
          Tambah Data
        </Button>
      </div>

      <div className="rounded-md border h-[calc(80vh-220px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[250px] truncate">Nama</TableHead>
              <TableHead className="max-w-[150px] truncate">Plat Nomor</TableHead>
              <TableHead className="max-w-[150px] truncate">Driver</TableHead>
              <TableHead>Foto Profil</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20">
                  Tidak ada data ditemukan
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="max-w-[250px] truncate">{driver.fleet_name}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{driver.number_plate}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{driver.name ?? '-'}</TableCell>
                  <TableCell>
                    <a
                      href=''
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lihat Foto
                    </a>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(driver.id)}
                    >
                      Edit Data
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(driver.id)}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {modalMode === "add" ? "Tambah Fleet" : "Edit Fleet"}
            </h2>
            {modalLoading ? (
              <div className="text-center py-10">Memuat...</div>
            ) : (
              <>
                <label className="block mb-2 font-medium">Nama Fleet</label>
                <Input
                  value={formDriverName}
                  onChange={(e) => setFormDriverName(e.target.value)}
                  placeholder="Masukkan Nama Fleet"
                  className="mb-4"
                />
                <label className="block mb-2 font-medium">Plat Nomor</label>
                <Input
                  value={formPhoneNumber}
                  onChange={(e) => setFormPhoneNumber(e.target.value)}
                  placeholder="Masukkan Plat Nomor"
                  className="mb-4"
                />
                <label className="block mb-2 font-medium">Pilih Driver</label>
                <Select
                  value={driverId}
                  onChange={(value) => setDriverId(value)}
                  options={[
                    ...(currentDriverOption ? [currentDriverOption] : []),
                    ...unassignedDrivers.map((driver) => ({
                      value: driver.id,
                      label: driver.name,
                    })),
                  ]}
                  placeholder="Pilih Driver"
                  className="mb-4 w-full"
                />


                <div className="flex justify-end space-x-2">
                 <Button
                  variant="outline"
                  onClick={() => {
                    setModalOpen(false);
                    resetModalState();
                  }}
                  disabled={modalLoading}
                >
                  Batal
                </Button>

                  <Button onClick={handleSubmit} disabled={modalLoading}>
                    {modalMode === "add" ? "Tambah" : "Simpan"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
