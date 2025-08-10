'use client'

import React, { useRef, useState } from "react"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2 } from "lucide-react"
import Swal from "sweetalert2"
import useAxiosAuth from "@/hooks/axios/use-axios-auth"

// Function Sementara nunggu update aws
export async function handleImageUpload(file: File, axiosAuth: any): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "user");

    const res = await axiosAuth.post("/storages/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.download_url;
  } catch (error) {
    console.error("Upload gagal", error);
    throw new Error("Gagal meng-upload gambar");
  }
}

const Page = () => {
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const axiosAuth = useAxiosAuth();

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setTitle(value)
    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    )
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      setIsUploading(true)
      try {
        const uploadedUrl = await handleImageUpload(file, axiosAuth)
        setUploadedImageUrl(uploadedUrl)
        Swal.fire("Berhasil", "Gambar berhasil diupload!", "success")
      } catch (error) {
        console.error("Gagal upload gambar:", error)
        Swal.fire("Gagal", "Gagal mengupload gambar ke server.", "error")
        setImagePreview(null)
      } finally {
        setIsUploading(false)
      }
    }
  }
// deploy
  const handleImageClick = () => {
    if (imagePreview) {
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Preview Gambar</title></head>
            <body style="margin:0">
              <img src="${imagePreview}" style="width:100vw; height:auto; display:block;" />
            </body>
          </html>
        `)
        newWindow.document.close()
      }
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setUploadedImageUrl(null)
    if (inputFileRef.current) {
      inputFileRef.current.value = ''
    }
  }

  const handleUploadClick = async () => {
    if (!title.trim()) {
      return Swal.fire("Judul Kosong", "Silakan masukkan judul artikel.", "warning")
    }
    if (!editorContent.trim()) {
      return Swal.fire("Konten Kosong", "Silakan tulis konten artikel.", "warning")
    }
    if (!uploadedImageUrl) {
      return Swal.fire("Thumbnail Kosong", "Silakan upload thumbnail artikel dan tunggu hingga selesai diupload.", "warning")
    }
    if (!description.trim()) {
      return Swal.fire("Deskripsi Kosong", "Silakan masukkan deskripsi artikel.", "warning")
    }
    if (!slug.trim()) {
      return Swal.fire("Slug Kosong", "Slug artikel tidak boleh kosong.", "warning")
    }

    const payload = {
      title,
      slug,
      thumbnail: uploadedImageUrl,
      description,
      content: editorContent,
      is_active: true,
    }

    setIsSubmitting(true)
    try {
      const response = await axiosAuth.post('/cms', payload)
      console.log("Sukses upload:", response.data)
      Swal.fire({
        title: "Berhasil",
        text: "Artikel berhasil diupload!",
        icon: "success",
        confirmButtonText: "OK"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/dashboard/cms'
        }
      })

      setTitle('')
      setDescription('')
      setSlug('')
      setEditorContent('')
      setImagePreview(null)
      setUploadedImageUrl(null)
      if (inputFileRef.current) {
        inputFileRef.current.value = ''
      }
    } catch (error) {
      console.error("Gagal upload:", error)
      Swal.fire("Gagal", "Terjadi kesalahan saat mengupload artikel.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-[90%]">
        <div className="mt-8">
          <p className="font-semibold mb-1">Masukkan Judul Dibawah Ini</p>
          <p className="text-[13px] mb-2">
            Untuk mengoptimalkan SEO, pastikan judul (title) halaman mengandung kata kunci utama dan ditulis menarik, seperti <br />
            "Sewa Mobil Jakarta Murah - TransGo". Panjang idealnya 50-60 karakter agar tidak terpotong di hasil pencarian.
          </p>
          <Textarea
            placeholder="Masukkan Judul Disini"
            className="w-full h-[50px]"
            value={title}
            onChange={handleTitleChange}
          />
        </div>

        <div className="flex w-full my-5 justify-between gap-4">
          {/* Editor */}
          <div className="border border-gray-500 w-[70%] rounded-sm p-2">
            <SimpleEditor onChange={setEditorContent} />
          </div>

          <div className="w-[30%] flex flex-col">
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold mb-2">Upload A File</p>
              <p className="text-[13px]">
                Silahkan Upload 1 Gambar Untuk dijadikan Thumbnail pada artikel
              </p>

              <label
                htmlFor="thumbnail"
                className={`h-[130px] bg-[#F9FAFB] my-3 border border-dotted border-gray-500 rounded-md flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-100 transition ${isUploading ? 'pointer-events-none opacity-50' : ''
                  }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="mt-2 text-[12px]">Uploading...</p>
                  </div>
                ) : imagePreview ? (
                  <div
                    className="h-full w-full flex items-center justify-center cursor-pointer relative"
                    onClick={handleImageClick}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full object-contain"
                    />
                    {uploadedImageUrl && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    <p className="mt-2 text-[12px]">Click To Upload</p>
                    <p className="text-[11px]">SVG, PNG, JPG</p>
                  </>
                )}
                <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/*"
                  id="thumbnail"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </label>

              {imagePreview && (
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => inputFileRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Ganti Foto'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                  >
                    Hapus Foto
                  </Button>
                </div>
              )}

              {uploadedImageUrl && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <p className="text-green-700 font-medium">✓ Gambar berhasil diupload ke server</p>
                  <p className="text-green-600 break-all">{uploadedImageUrl}</p>
                </div>
              )}
            </div>

            <div className="mt-5">
              <p className="font-semibold mb-1">Masukkan Deskripsi Dibawah Ini</p>
              <p className="text-[12px] mb-2">
                Deskripsi (meta description) idealnya 150-160 karakter, berisi ringkasan konten yang menggoda untuk diklik, contohnya: "Butuh sewa mobil di Jakarta? TransGo siap antar jemput dengan harga terjangkau dan driver profesional."
              </p>
              <Textarea
                placeholder="Masukkan Deskripsi Disini"
                className="w-full h-[50px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <p className="font-semibold mb-1 mt-5">Slug Artikel</p>
              <p className="text-[12px] mb-2">
                Slug atau URL sebaiknya pendek, jelas, dan mengandung keyword, seperti /sewa-mobil-jakarta. Gunakan huruf kecil dan tanda hubung untuk memisahkan kata (Akan Sesuai Judul).
              </p>
              <Input
                placeholder="Slug akan sesuai Judul"
                className="w-full"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <Button
                onClick={handleUploadClick}
                className='text-white border w-full mt-4'
                disabled={isSubmitting || isUploading || !uploadedImageUrl}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <p>Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" />
                    <p>Upload</p>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page