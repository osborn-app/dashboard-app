'use client'

import React, { useRef, useState, useEffect } from "react"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2, X, Check, Copy, ExternalLink, Search } from "lucide-react"
import Swal from "sweetalert2"
import useAxiosAuth from "@/hooks/axios/use-axios-auth"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Category, useCategoryApi } from "@/client/cmsCategoryClient"
import { CMSItem } from "../forms/types/cms"


interface CMSFormProps {
  articleId?: string
  mode: 'create' | 'edit'
}

export default function CMSForm({ articleId, mode }: CMSFormProps) {
  const router = useRouter()
  const isEditMode = mode === 'edit' && Boolean(articleId)
  const { fetchCategories } = useCategoryApi()
  
  const handleImageUploadToServer = async (file: File, axiosAuth: any): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "user");

      const res = await axiosAuth.post("/storages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data.download_url;
    } catch (error) {
      throw new Error("Gagal meng-upload gambar");
    }
  };

  const inputFileRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Category Dialog States
  const [showCategoryDialog, setShowCategoryDialog] = useState<boolean>(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false)
  const [categorySearch, setCategorySearch] = useState<string>('')
  
  // Success Dialog States
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false)
  const [articleUrl, setArticleUrl] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)
  
  const axiosAuth = useAxiosAuth();

  useEffect(() => {
    if (isEditMode && articleId) {
      fetchArticleData()
    }
  }, [articleId, isEditMode])

  useEffect(() => {
    if (showCategoryDialog) {
      loadCategories()
    }
  }, [showCategoryDialog, categorySearch])

  const loadCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const categoriesData = await fetchCategories({
        page: 1,
        limit: 100,
        q: categorySearch
      })
      setCategories(categoriesData)
    } catch (error) {
      Swal.fire("Error", "Gagal mengambil data kategori", "error")
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const fetchArticleData = async () => {
    if (!articleId) return
    
    setIsLoading(true)
    try {
      const response = await axiosAuth.get(`/cms/${articleId}`)
      const article: CMSItem = response.data
      
      setTitle(article.title)
      setDescription(article.description)
      setSlug(article.slug)
      setEditorContent(article.content)
      setUploadedImageUrl(article.thumbnail)
      setImagePreview(article.thumbnail)
      
      if (article.categories && article.categories.length > 0) {
        setSelectedCategories(article.categories.map(cat => cat.id))
      }
      
    } catch (error) {
      Swal.fire("Error", "Gagal mengambil data artikel", "error")
      router.push('/dashboard/cms')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setTitle(value)
    
    if (!isEditMode || !slug) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      )
    }
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
        const uploadedUrl = await handleImageUploadToServer(file, axiosAuth)
        setUploadedImageUrl(uploadedUrl)
        Swal.fire("Berhasil", "Gambar berhasil diupload!", "success")
      } catch (error) {
        Swal.fire("Gagal", "Gagal mengupload gambar ke server.", "error")
        setImagePreview(null)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleImageClick = () => {
    if (imagePreview) {
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(
          `<html>
            <head><title>Preview Gambar</title></head>
            <body style="margin:0">
              <img src="${imagePreview}" style="width:100vw; height:auto; display:block;" />
            </body>
          </html>`
        )
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

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleSubmitButtonClick = () => {

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

    setShowCategoryDialog(true)
  }

  const handleFinalSubmit = async () => {
    const payload = {
      title,
      slug,
      thumbnail: uploadedImageUrl,
      description,
      content: editorContent,
      is_active: true,
      category_ids: selectedCategories, 
    }

    setIsSubmitting(true)
    setShowCategoryDialog(false)
    
    try {
      let response;
      if (isEditMode) {
        response = await axiosAuth.put(`/cms/${articleId}`, payload)
        setArticleUrl(`https://transgo.id/content/${slug}`)
        setShowSuccessDialog(true)
      } else {
        response = await axiosAuth.post('/cms', payload)
        setArticleUrl(`https://transgo.id/content/${slug}`)
        setShowSuccessDialog(true)
      }
    } catch (error) {
      const errorMessage = isEditMode ? 
        "Terjadi kesalahan saat mengupdate artikel." : 
        "Terjadi kesalahan saat membuat artikel."
      Swal.fire("Gagal", errorMessage, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {

      const textArea = document.createElement('textarea')
      textArea.value = articleUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleOpenGoogleSearchConsole = () => {
    const gscUrl = `https://search.google.com/search-console`
    window.open(gscUrl, '_blank')
  }

  const handleVisitArticle = () => {
    window.open(articleUrl, '_blank')
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  if (isEditMode && isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-2">Memuat data artikel...</p>
      </div>
    )
  }

  return (
    <>
      <div className="w-full flex flex-col items-center">
        <div className="w-[90%]">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Edit Artikel' : 'Buat Artikel Baru'}
            </h1>
            {isEditMode && (
              <p className="text-gray-600 text-sm">
                ID Artikel: {articleId}
              </p>
            )}
          </div>

          <div className="mt-8">
            <p className="font-semibold mb-1">Masukkan Judul Dibawah Ini</p>
            <p className="text-[13px] mb-2">
              Untuk mengoptimalkan SEO, pastikan judul (title) halaman mengandung kata kunci utama dan ditulis menarik.
            </p>
            <Textarea
              placeholder="Masukkan Judul Disini"
              className="w-full h-[50px]"
              value={title}
              onChange={handleTitleChange}
            />
          </div>

          <div className="flex w-full mt-5 mb-[100px] justify-between gap-4">
            <div className="border border-gray-500 w-[70%] rounded-sm p-2">
              <SimpleEditor 
                onChange={setEditorContent} 
                initialContent={editorContent}
              />
            </div>

            <div className="w-[30%] flex flex-col">
              <div className="border border-gray-300 rounded-md p-2">
                <p className="font-semibold mb-2">Upload A File</p>
                <p className="text-[13px]">
                  Silahkan Upload 1 Gambar Untuk dijadikan Thumbnail pada artikel
                </p>

                <label
                  htmlFor="thumbnail"
                  className={`h-[130px] bg-[#F9FAFB] my-3 border border-dotted border-gray-500 rounded-md flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-100 transition ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
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
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={200}
                        height={130}
                        className="h-full object-contain"
                        unoptimized
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
                  Deskripsi (meta description) idealnya 150-160 karakter.
                </p>
                <Textarea
                  placeholder="Masukkan Deskripsi Disini"
                  className="w-full h-[50px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <p className="font-semibold mb-1 mt-5">Slug Artikel</p>
                <p className="text-[12px] mb-2">
                  Slug atau URL sebaiknya pendek, jelas, dan mengandung keyword.
                </p>
                <Input
                  placeholder="Slug akan sesuai Judul"
                  className="w-full"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />

                <Button
                  onClick={handleSubmitButtonClick}
                  className='text-white border w-full mt-4'
                  disabled={isSubmitting || isUploading || !uploadedImageUrl}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <p>{isEditMode ? 'Updating...' : 'Creating...'}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" />
                      <p>{isEditMode ? 'Update Artikel' : 'Buat Artikel'}</p>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection Dialog */}
      {showCategoryDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[400px] max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Pilih Kategori</h2>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100"
                onClick={() => setShowCategoryDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Loader */}
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Memuat kategori...</span>
              </div>
            ) : (
              <>
                {/* List kategori */}
                <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                  {filteredCategories.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Tidak ada kategori ditemukan
                    </p>
                  ) : (
                    filteredCategories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="h-4 w-4 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-gray-800">{category.name}</span>
                      </label>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-between items-center border-t pt-4">
                  <p className="text-sm text-gray-600">
                    {selectedCategories.length} kategori dipilih
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="px-4"
                      onClick={() => setShowCategoryDialog(false)}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleFinalSubmit}>
                      {isEditMode ? 'Update Artikel' : 'Buat Artikel'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[550px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditMode ? '🎉 Artikel Berhasil Diupdate!' : '🎉 Artikel Berhasil Dibuat!'}
                </h2>
                <p className="text-gray-600 text-sm">
                  Artikel Anda telah berhasil {isEditMode ? 'diperbarui' : 'dipublikasikan'} dan sekarang sudah dapat diakses.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔗 URL Artikel:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={articleUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-mono"
                />
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 transition-all duration-200 ${isCopied ? 'text-green-600 border-green-300 bg-green-50' : 'hover:border-blue-400'}`}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <div className="text-amber-600 mt-0.5">ℹ️</div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Informasi SEO & Pengindeksan</h3>
                  <p className="text-sm text-amber-700">
                    Untuk keperluan SEO, proses pengindeksan biasanya memakan waktu <strong>1-7 hari</strong>. 
                    Anda dapat mempercepat proses ini dengan menggunakan Google Search Console. 
                    Jika tidak menggunakan GSC, artikel tetap akan diindeks secara otomatis, namun mungkin membutuhkan waktu lebih lama.
                  </p>
                </div>
              </div>
            </div>

            {/* Step by Step Guide */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                📋 Panduan Submit ke Google Search Console
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    1
                  </div>
                  <div className="text-sm">
                    <strong>Salin Link Artikel</strong> - Klik tombol "Copy" di atas untuk menyalin URL artikel
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    2
                  </div>
                  <div className="text-sm">
                    <strong>Buka Google Search Console Dengan Email <span className="text-blue-500">transgoacc@gmail.com</span></strong> - Klik tombol orange di bawah untuk membuka GSC
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    3
                  </div>
                  <div className="text-sm">
                    <strong>Inspect URL</strong> - Paste URL artikel yang sudah disalin ke kolom "Inspect any URL"
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    4
                  </div>
                  <div className="text-sm">
                    <strong>Request Indexing</strong> - Klik "Request Indexing" untuk mempercepat pengindeksan
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleVisitArticle}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                👀 Lihat Artikel
              </Button>
              
              <Button
                onClick={handleOpenGoogleSearchConsole}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 font-medium"
              >
                <Search className="h-4 w-4" />
                🚀 Buka Google Search Console
              </Button>

              <div className="border-t pt-4 mt-2">
                <Button
                  onClick={() => {
                    setShowSuccessDialog(false)
                    router.push('/dashboard/cms')
                  }}
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
                >
                  ← Kembali ke Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}