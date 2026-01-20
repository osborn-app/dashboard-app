"use client";

import "./styles.css";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select as AntdSelect } from "antd";
import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { useDebounce } from "use-debounce";
import { z } from "zod";
import Spinner from "@/components/spinner";
import axios from "axios";
import { useRouter } from "next/navigation";
import UploadFile from "@/components/uploud-file";
import CustomDateTimePicker from "@/components/custom-datetime-picker";

const { Option } = AntdSelect;

// Schema validation
const formSchema = z.object({
  nominal: z.coerce.number().min(1, { message: "Nominal harus diisi" }),
  bank: z.string().min(1, { message: "Bank harus dipilih" }),
  transaction_proof_url: z.string().min(1, { message: "Bukti transaksi harus diupload" }),
  noRekening: z.string().optional(),
  driver: z.coerce.number().min(1, { message: "Driver harus dipilih" }),
  fleet: z.coerce.number().optional().nullable(),
  // product: z.coerce.number().optional().nullable(),
  location: z.coerce.number().min(1, { message: "Lokasi harus dipilih" }),
  date: z.coerce.date({ required_error: "Tanggal harus diisi" }),
  description: z.string().min(10, { message: "Keterangan minimal 10 karakter" }),
  quantity: z.coerce.number().default(1).optional(),
  category: z.coerce.number().min(1, { message: "Kategori harus dipilih" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function DriverReimbursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Search terms
  const [searchDriverTerm, setSearchDriverTerm] = useState("");
  const [searchFleetTerm, setSearchFleetTerm] = useState("");
  // const [searchProductTerm, setSearchProductTerm] = useState("");
  const [searchLocationTerm, setSearchLocationTerm] = useState("");
  const [searchCategoryTerm, setSearchCategoryTerm] = useState("");
  
  // Debounced search
  const [searchDriverDebounce] = useDebounce(searchDriverTerm, 500);
  const [searchFleetDebounce] = useDebounce(searchFleetTerm, 500);
  // const [searchProductDebounce] = useDebounce(searchProductTerm, 500);
  const [searchLocationDebounce] = useDebounce(searchLocationTerm, 500);
  const [searchCategoryDebounce] = useDebounce(searchCategoryTerm, 500);
  
  // Data states
  const [drivers, setDrivers] = useState<any[]>([]);
  const [fleets, setFleets] = useState<any[]>([]);
  // const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Loading states
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingFleets, setLoadingFleets] = useState(false);
  // const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Create axios instance with basic auth
  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000",
    auth: {
      username: process.env.NEXT_PUBLIC_BASIC_AUTH_USER ?? "admin",
      password: process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD ?? "admin",
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  const defaultValues: Partial<FormValues> = {
    driver: 0,
    fleet: null,
    // product: null,
    nominal: 0,
    bank: "",
    location: 0,
    noRekening: "",
    date: undefined,
    description: "",
    transaction_proof_url: "",
    quantity: 1,
    category: 0,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const fleetField = form.watch("fleet");
  // const productField = form.watch("product");
  const categoryField = form.watch("category");

  // Auto-set quantity to 1 when category is driver-related
  useEffect(() => {
    const selectedCategory = categories.find((cat: any) => cat.id === categoryField);
    if (selectedCategory?.name?.toLowerCase().includes("driver")) {
      form.setValue("quantity", 1);
    }
  }, [categoryField, form, categories]);

  // Fetch data functions
  const fetchDrivers = async (search: string = "") => {
    try {
      setLoadingDrivers(true);
      const response = await apiClient.get("/drivers", {
        params: { limit: 20, page: 1, q: search },
      });
      setDrivers(response.data?.data?.items || response.data?.items || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data driver",
      });
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchFleets = async (search: string = "") => {
    try {
      setLoadingFleets(true);
      const response = await apiClient.get("/fleets", {
        params: { limit: 20, page: 1, q: search },
      });
      setFleets(response.data?.data?.items || response.data?.items || []);
    } catch (error) {
      console.error("Error fetching fleets:", error);
    } finally {
      setLoadingFleets(false);
    }
  };

  /*const fetchProducts = async (search: string = "") => {
    try {
      setLoadingProducts(true);
      const response = await apiClient.get("/products", {
        params: { limit: 20, page: 1, q: search },
      });
      setProducts(response.data?.data?.items || response.data?.items || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };*/

  const fetchLocations = async (search: string = "") => {
    try {
      setLoadingLocations(true);
      const response = await apiClient.get("/locations", {
        params: { limit: 20, page: 1, q: search },
      });
      setLocations(response.data?.data?.items || response.data?.items || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchCategories = async (search: string = "") => {
    try {
      setLoadingCategories(true);
      const response = await apiClient.get("/realization/transaction-categories", {
        params: { 
          limit: 100, 
          page: 1, 
          is_active: true,
          q: search || undefined 
        },
      });
      setCategories(response.data?.data?.items || response.data?.items || response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDrivers();
    fetchFleets();
    // fetchProducts();
    fetchLocations();
    fetchCategories();
  }, []);

  // Search effects
  useEffect(() => {
    if (searchDriverDebounce !== undefined) {
      fetchDrivers(searchDriverDebounce);
    }
  }, [searchDriverDebounce]);

  useEffect(() => {
    if (searchFleetDebounce !== undefined) {
      fetchFleets(searchFleetDebounce);
    }
  }, [searchFleetDebounce]);

  // useEffect(() => {
  //   if (searchProductDebounce !== undefined) {
  //     fetchProducts(searchProductDebounce);
  //   }
  // }, [searchProductDebounce]);

  useEffect(() => {
    if (searchLocationDebounce !== undefined) {
      fetchLocations(searchLocationDebounce);
    }
  }, [searchLocationDebounce]);

  useEffect(() => {
    if (searchCategoryDebounce !== undefined) {
      fetchCategories(searchCategoryDebounce);
    }
  }, [searchCategoryDebounce]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      // Check if image URL exists (uploaded via UploadFile component)
      if (!data.transaction_proof_url) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Bukti transaksi harus diupload",
        });
        setLoading(false);
        return;
      }

      // Prepare payload
      const payload = {
        driver_id: data.driver,
        fleet_id: data.fleet || null,
        // product_id: data.product || null,
        nominal: data.nominal,
        bank: data.bank,
        location_id: data.location,
        noRekening: data.noRekening || "",
        date: data.date,
        quantity: data.quantity || 1,
        transaction_category_id: data.category,
        description: data.description,
        transaction_proof_url: data.transaction_proof_url,
      };

      const response = await apiClient.post("/driver-reimburses", payload);

      toast({
        variant: "success",
        title: "✓ Berhasil!",
        description: "Reimburse berhasil dibuat",
      });

      // Reset form
      form.reset();

      // Smooth scroll to top after success
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Navigate to dashboard or list page
      // router.push('/dashboard/reimburse');
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        variant: "destructive",
        title: "❌ Error!",
        description: error.response?.data?.message || "Gagal membuat reimburse",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto">
                <svg className="animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 bg-blue-600 rounded-full animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Mengirim Data...
            </h3>
            <p className="text-sm text-gray-600">
              Mohon tunggu, sedang memproses reimburse Anda
            </p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-5 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border-t-4 border-blue-600">
              <Heading
                title="📝 Reimburse Driver"
                description="Form pengajuan reimburse untuk driver Transgo"
              />
            </div>
          </div>

          <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 sm:space-y-4"
          >
            {/* Driver */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              name="driver"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required text-base font-semibold text-gray-700">
                    Nama Pengemudi
                  </FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      placeholder="Pilih pengemudi..."
                      style={{ height: "48px" }}
                      size="large"
                      onSearch={setSearchDriverTerm}
                      onChange={field.onChange}
                      filterOption={false}
                      loading={loadingDrivers}
                      {...(!isEmpty(field.value) && { value: field.value })}
                    >
                      {drivers.map((driver) => (
                        <Option key={driver.id} value={driver.id}>
                          {driver.name}
                        </Option>
                      ))}
                    </AntdSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* Nominal */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              control={form.control}
              name="nominal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required text-base font-semibold text-gray-700">
                    Nominal
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-500 font-medium">
                        Rp.
                      </span>
                      <NumericFormat
                        customInput={Input}
                        type="text"
                        className="pl-9 h-12 text-base"
                        allowLeadingZeros
                        thousandSeparator=","
                        allowNegative={false}
                        placeholder="Masukkan nominal..."
                        value={field.value?.toString() || ""}
                        onValueChange={({ floatValue }) =>
                          field.onChange(floatValue || 0)
                        }
                        onBlur={field.onBlur}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* Bank */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              name="bank"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required text-base font-semibold text-gray-700">
                    Nama Bank / Pembayaran
                  </FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      mode="tags"
                      maxTagCount={1}
                      size="large"
                      value={field.value}
                      placeholder="Pilih bank..."
                      onChange={(value) => {
                        const lastValue = Array.isArray(value)
                          ? value[value.length - 1]
                          : value;
                        field.onChange(lastValue);
                      }}
                      style={{ height: "48px" }}
                    >
                      {[
                        { value: "BCA", label: "BCA" },
                        { value: "BRI", label: "BRI" },
                        { value: "BNI", label: "BNI" },
                        { value: "MANDIRI", label: "MANDIRI" },
                        { value: "DKI", label: "DKI" },
                      ].map((bank) => (
                        <Option key={bank.value} value={bank.value}>
                          {bank.label}
                        </Option>
                      ))}
                    </AntdSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* Fleet */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              name="fleet"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-700">Pilih Fleet (Opsional)</FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      placeholder="Pilih fleet..."
                      style={{ height: "48px" }}
                      size="large"
                      // disabled={!!productField}
                      onSearch={setSearchFleetTerm}
                      // onChange={(value) => {
                      //   field.onChange(value);
                      //   if (value) {
                      //     form.setValue("product", null);
                      //   }
                      // }}
                      filterOption={false}
                      loading={loadingFleets}
                      allowClear
                      {...(!isEmpty(field.value) && { value: field.value })}
                    >
                      {fleets.map((fleet) => (
                        <Option key={fleet.id} value={fleet.id}>
                          {fleet.name}
                        </Option>
                      ))}
                    </AntdSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* Product */}
            {/* <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              name="product"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-700">Pilih Product (Opsional)</FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      placeholder="Pilih product..."
                      style={{ height: "48px" }}
                      size="large"
                      disabled={!!fleetField}
                      onSearch={setSearchProductTerm}
                      onChange={(value) => {
                        field.onChange(value);
                        if (value) {
                          form.setValue("fleet", null);
                        }
                      }}
                      filterOption={false}
                      loading={loadingProducts}
                      allowClear
                      {...(!isEmpty(field.value) && { value: field.value })}
                    >
                      {products.map((product) => (
                        <Option key={product.id} value={product.id}>
                          {product.name}
                        </Option>
                      ))}
                    </AntdSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div> */}

            {/* Date */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required text-base font-semibold text-gray-700 mb-2 block">
                    Tanggal & Waktu
                  </FormLabel>
                  <FormControl>
                    <CustomDateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pilih tanggal dan waktu"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              name="location"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required text-base font-semibold text-gray-700">Lokasi</FormLabel>
                  <FormControl>
                    <AntdSelect
                      showSearch
                      value={field.value}
                      placeholder="Pilih Lokasi..."
                      className="w-full"
                      style={{ height: "48px" }}
                      size="large"
                      onSearch={setSearchLocationTerm}
                      onChange={field.onChange}
                      filterOption={false}
                      loading={loadingLocations}
                      {...(!isEmpty(field.value) && { value: field.value })}
                    >
                      {locations.map((location) => (
                        <Option key={location.id} value={location.id}>
                          {location.name}
                        </Option>
                      ))}
                    </AntdSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* No Rekening */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              control={form.control}
              name="noRekening"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-700">No. Rekening / No. Pembayaran</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 text-base"
                      placeholder="Masukan no rekening / no pembayaran"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        e.target.value = e.target.value.trimStart();
                        field.onChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              name="category"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required text-base font-semibold text-gray-700">
                    Kategori
                  </FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      placeholder="Pilih kategori..."
                      style={{ height: "48px" }}
                      size="large"
                      value={field.value || undefined}
                      onChange={field.onChange}
                      onSearch={setSearchCategoryTerm}
                      filterOption={false}
                      loading={loadingCategories}
                    >
                      {categories.map((category: any) => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                    </AntdSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* Quantity */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-700">Quantity</FormLabel>
                  <FormControl>
                    <NumericFormat
                      disabled={(() => {
                        const selectedCategory = categories.find(
                          (cat: any) => cat.id === categoryField
                        );
                        return selectedCategory?.name?.toLowerCase().includes("driver");
                      })()}
                      customInput={Input}
                      type="text"
                      className="h-12 text-base"
                      allowLeadingZeros
                      thousandSeparator
                      allowNegative={false}
                      placeholder="Masukkan quantity..."
                      value={field.value?.toString() || ""}
                      onValueChange={({ floatValue }) =>
                        field.onChange(floatValue || 1)
                      }
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="relative label-required text-base font-semibold text-gray-700">
                      Keterangan
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="text-base min-h-[120px]"
                        placeholder="Isi keterangan anda dengan lengkap..."
                        rows={4}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          e.target.value = e.target.value.trimStart();
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <FormField
                control={form.control}
                name="transaction_proof_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="relative label-required text-base font-semibold text-gray-700">
                      Bukti Transaksi
                    </FormLabel>
                    <FormControl>
                      <UploadFile
                        initialData={null}
                        lastPath="create"
                        form={form}
                        name="transaction_proof_url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all p-4 sm:p-6">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 text-base sm:text-lg font-bold bg-white text-blue-600 hover:bg-gray-50"
              >
                {loading ? <Spinner className="h-5 w-5 mr-2" /> : null}
                {loading ? "Mengirim..." : "✓ Submit Reimburse"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
    </>
  );
}
