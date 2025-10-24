"use client";

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
import { Select as AntdSelect, ConfigProvider, DatePicker } from "antd";
import locale from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
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

const { Option } = AntdSelect;

// Schema validation
const formSchema = z.object({
  nominal: z.coerce.number().min(1, { message: "Nominal harus diisi" }),
  bank: z.string().min(1, { message: "Bank harus dipilih" }),
  transaction_proof_url: z.string().min(1, { message: "Bukti transaksi harus diupload" }),
  noRekening: z.string().optional(),
  driver: z.coerce.number().min(1, { message: "Driver harus dipilih" }),
  fleet: z.coerce.number().optional().nullable(),
  product: z.coerce.number().optional().nullable(),
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
  const [searchProductTerm, setSearchProductTerm] = useState("");
  const [searchLocationTerm, setSearchLocationTerm] = useState("");
  
  // Debounced search
  const [searchDriverDebounce] = useDebounce(searchDriverTerm, 500);
  const [searchFleetDebounce] = useDebounce(searchFleetTerm, 500);
  const [searchProductDebounce] = useDebounce(searchProductTerm, 500);
  const [searchLocationDebounce] = useDebounce(searchLocationTerm, 500);
  
  // Data states
  const [drivers, setDrivers] = useState<any[]>([]);
  const [fleets, setFleets] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Loading states
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingFleets, setLoadingFleets] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
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
    product: null,
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
  const productField = form.watch("product");
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

  const fetchProducts = async (search: string = "") => {
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
  };

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

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiClient.get("/realization/transaction-categories/active");
      setCategories(response.data?.data || response.data || []);
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
    fetchProducts();
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

  useEffect(() => {
    if (searchProductDebounce !== undefined) {
      fetchProducts(searchProductDebounce);
    }
  }, [searchProductDebounce]);

  useEffect(() => {
    if (searchLocationDebounce !== undefined) {
      fetchLocations(searchLocationDebounce);
    }
  }, [searchLocationDebounce]);

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
        product_id: data.product || null,
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
        title: "Berhasil!",
        description: "Reimburse berhasil dibuat",
      });

      // Reset form
      form.reset();

      // Navigate to dashboard or list page
      // router.push('/dashboard/reimburse');
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.response?.data?.message || "Gagal membuat reimburse",
      });
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: any): boolean => {
    return current && current < dayjs().startOf("day");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Heading
            title="Reimburse Driver"
            description="Form pengajuan reimburse untuk driver Transgo"
          />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Driver */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              name="driver"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Nama Pengemudi
                  </FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      placeholder="Pilih pengemudi..."
                      style={{ height: "40px" }}
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              control={form.control}
              name="nominal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Nominal
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                        Rp.
                      </span>
                      <NumericFormat
                        customInput={Input}
                        type="text"
                        className="pl-9"
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              name="bank"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Nama Bank / Pembayaran
                  </FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      mode="tags"
                      maxTagCount={1}
                      value={field.value}
                      placeholder="Pilih bank..."
                      onChange={(value) => {
                        const lastValue = Array.isArray(value)
                          ? value[value.length - 1]
                          : value;
                        field.onChange(lastValue);
                      }}
                      style={{ height: "40px" }}
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              name="fleet"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Fleet (Opsional)</FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      placeholder="Pilih fleet..."
                      style={{ height: "40px" }}
                      disabled={!!productField}
                      onSearch={setSearchFleetTerm}
                      onChange={(value) => {
                        field.onChange(value);
                        if (value) {
                          form.setValue("product", null);
                        }
                      }}
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              name="product"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Product (Opsional)</FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      placeholder="Pilih product..."
                      style={{ height: "40px" }}
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
            </div>

            {/* Date */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <ConfigProvider locale={locale}>
                  <FormItem>
                    <FormLabel className="relative label-required">
                      Tanggal
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        disabledDate={disabledDate}
                        className="w-full h-[40px]"
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        value={field.value ? dayjs(field.value).locale("id") : undefined}
                        format={"HH:mm:ss - dddd, DD MMMM (YYYY)"}
                        showTime
                        placeholder="Pilih tanggal dan waktu"
                        showNow={false}
                        inputReadOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </ConfigProvider>
              )}
            />
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              name="location"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">Lokasi</FormLabel>
                  <FormControl>
                    <AntdSelect
                      showSearch
                      value={field.value}
                      placeholder="Pilih Lokasi..."
                      className="w-full"
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              control={form.control}
              name="noRekening"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Rekening / No. Pembayaran</FormLabel>
                  <FormControl>
                    <Input
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              name="category"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Kategori
                  </FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      showSearch
                      placeholder="Pilih kategori..."
                      style={{ height: "40px" }}
                      value={field.value || undefined}
                      onChange={field.onChange}
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="relative label-required">
                      Keterangan
                    </FormLabel>
                    <FormControl>
                      <Textarea
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormField
                control={form.control}
                name="transaction_proof_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="relative label-required">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
              {loading ? "Mengirim..." : "Submit Reimburse"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
