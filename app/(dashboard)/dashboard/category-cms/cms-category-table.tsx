"use client";

import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "antd";
import Swal from "sweetalert2";
import { useCategoryApi, Category } from "@/client/cmsCategoryClient";

const generateSlug = (text: string) =>
  text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function CMSCategoryTable() {
  const { fetchCategories, getCategory, createCategory, updateCategory, deleteCategory } =
    useCategoryApi();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // fetch data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories({ q: search });
        setCategories(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search]);

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus kategori?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      try {
        await deleteCategory(id);
        Swal.fire("Berhasil!", "Kategori dihapus.", "success");
        const data = await fetchCategories({ q: search });
        setCategories(data);
      } catch {
        Swal.fire("Gagal!", "Terjadi kesalahan.", "error");
      }
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormName("");
    setFormSlug("");
    setEditId(null);
    setModalOpen(true);
  };

  const openEditModal = async (id: number) => {
    setModalMode("edit");
    setModalOpen(true);
    setModalLoading(true);
    try {
      const category = await getCategory(id);
      setFormName(category.name);
      setFormSlug(category.slug);
      setEditId(category.id);
    } catch {
      Swal.fire("Error", "Gagal memuat data kategori", "error");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formSlug.trim()) {
      Swal.fire("Peringatan", "Nama dan Slug wajib diisi", "warning");
      return;
    }
    setModalLoading(true);

    try {
      if (modalMode === "add") {
        await createCategory({ name: formName, slug: formSlug });
      } else if (modalMode === "edit" && editId) {
        await updateCategory(editId, { name: formName, slug: formSlug });
      }
      Swal.fire("Sukses", "Kategori berhasil disimpan", "success");
      setModalOpen(false);
      const data = await fetchCategories({ q: search });
      setCategories(data);
    } catch (error: any) {
      Swal.fire("Error", error?.response?.data?.message || "Terjadi kesalahan", "error");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="w-[50%] text-[14px]">
          Silakan masukkan kategori yang sesuai, kategori ini akan mempengaruhi pengelompokan dan penentuan artikel
        </p>
        <Button size="sm" onClick={openAddModal}>Tambah Data</Button>
      </div>

      <div className="rounded-md border h-[calc(80vh-220px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead>Diupdate</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20">Memuat data...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20">Tidak ada data</TableCell></TableRow>
            ) : (
              categories.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>{new Date(cat.created_at).toLocaleString()}</TableCell>
                  <TableCell>{new Date(cat.updated_at).toLocaleString()}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(cat.id)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {modalMode === "add" ? "Tambah Kategori" : "Edit Kategori"}
            </h2>
            {modalLoading ? (
              <div className="text-center py-10">Memuat...</div>
            ) : (
              <>
                <label className="block mb-2 font-medium">Nama</label>
                <Input
                  value={formName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormName(val);
                    setFormSlug(generateSlug(val));
                  }}
                  placeholder="Masukkan nama kategori"
                  className="mb-4"
                />
                <label className="block mb-2 font-medium">Slug</label>
                <Input
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="Slug Kategori (Otomatis)"
                  className="mb-4"
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
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
