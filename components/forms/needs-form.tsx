"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Select as AntdSelect, DatePicker, ConfigProvider } from "antd";
import idID from 'antd/es/locale/id_ID';
import { useGetInfinityFleets } from "@/hooks/api/useFleet";
import { useGetInfinityLocation } from "@/hooks/api/useLocation";
import { useDebounce } from "use-debounce";
import { isEmpty } from "lodash";
import dayjs from "dayjs";
import 'dayjs/locale/id';

type NeedsFormProps = {
  onSubmit: (form: { fleet_id: number; name: string; description: string; start_date: string; estimate_days: number }) => void;
};

const formSchema = z.object({
  name: z.string().min(3, { message: "Nama maintenance minimal 3 karakter" }),
  fleet_id: z.string().min(1, { message: "Armada harus dipilih" }),
  description: z.string().optional(),
  start_date: z.string().min(1, { message: "Tanggal mulai harus diisi" }).refine(val => {
    if (!val) return false;
    return new Date(val).getTime() >= new Date().setHours(0,0,0,0);
  }, { message: "Tanggal mulai tidak boleh di masa lalu" }),
  estimate_days: z.coerce.number().min(1, { message: "Estimasi hari minimal 1" }),
});

type NeedsFormValues = z.infer<typeof formSchema>;

export default function NeedsForm({ onSubmit }: NeedsFormProps) {
  const [searchFleetTerm, setSearchFleetTerm] = useState("");
  const [searchFleetDebounce] = useDebounce(searchFleetTerm, 500);
  const {
    data: fleets,
    isFetching: isFetchingFleets,
    fetchNextPage: fetchNextFleets,
    hasNextPage: hasNextFleets,
    isFetchingNextPage: isFetchingNextFleets,
  } = useGetInfinityFleets(searchFleetDebounce);
  const [searchLocationTerm, setSearchLocationTerm] = useState("");
  const [searchLocationDebounce] = useDebounce(searchLocationTerm, 500);
  const {
    data: locations,
    isFetching: isFetchingLocations,
    fetchNextPage: fetchNextLocations,
    hasNextPage: hasNextLocations,
    isFetchingNextPage: isFetchingNextLocations,
  } = useGetInfinityLocation(searchLocationDebounce);

  const form = useForm<NeedsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fleet_id: "",
      description: "",
      start_date: "",
      estimate_days: 1,
    },
  });

  dayjs.locale('id');
  return (
    <ConfigProvider locale={idID}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Form Maintenance Armada</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              onSubmit({
                ...data,
                fleet_id: Number(data.fleet_id),
                description: data.description ?? "",
              });
            })}
            className="space-y-8 w-full"
          >
            <div className="md:grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Maintenance</FormLabel>
                  <FormControl>
                    <AntdSelect
                      placeholder="Pilih tipe maintenance"
                      value={field.value || undefined}
                      onChange={field.onChange}
                      style={{ width: "100%" }}
                    >
                      <AntdSelect.Option value="Perbaikan (Maintenance)">Perbaikan (Maintenance)</AntdSelect.Option>
                      <AntdSelect.Option value="Penggunaan Internal">Penggunaan Internal</AntdSelect.Option>
                    </AntdSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fleet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Armada</FormLabel>
                  <FormControl>
                    <AntdSelect
                      showSearch
                      placeholder="Pilih Armada"
                      style={{ width: "100%" }}
                      onSearch={setSearchFleetTerm}
                      onChange={field.onChange}
                      onPopupScroll={() => {
                        if (hasNextFleets && !isFetchingNextFleets) fetchNextFleets();
                      }}
                      filterOption={false}
                      notFoundContent={isFetchingNextFleets ? <p className="px-3 text-sm">loading</p> : null}
                      value={field.value || undefined}
                    >
                      {fleets?.pages?.map((page: any) =>
                        page.data.items.map((item: any) => (
                          <AntdSelect.Option key={item.id} value={item.id.toString()}>
                            {item.name}
                          </AntdSelect.Option>
                        ))
                      )}
                      {isFetchingNextFleets && (
                        <AntdSelect.Option disabled>
                          <p className="px-3 text-sm">loading</p>
                        </AntdSelect.Option>
                      )}
                    </AntdSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dropdown Cabang pakai API lokasi */}
            <FormItem>
              <FormLabel>Cabang</FormLabel>
              <FormControl>
                <AntdSelect
                  showSearch
                  placeholder="Pilih cabang"
                  style={{ width: "100%" }}
                  onSearch={setSearchLocationTerm}
                  onPopupScroll={() => {
                    if (hasNextLocations && !isFetchingNextLocations) fetchNextLocations();
                  }}
                  filterOption={false}
                  notFoundContent={isFetchingNextLocations ? <p className="px-3 text-sm">loading</p> : null}
                >
                  {locations?.pages?.map((page: any) =>
                    page.data.items.map((item: any) => (
                      <AntdSelect.Option key={item.id} value={item.id.toString()}>
                        {item.name || item.location_name || item.nama || `Cabang ${item.id}`}
                      </AntdSelect.Option>
                    ))
                  )}
                  {isFetchingNextLocations && (
                    <AntdSelect.Option disabled>
                      <p className="px-3 text-sm">loading</p>
                    </AntdSelect.Option>
                  )}
                </AntdSelect>
              </FormControl>
            </FormItem>
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Input placeholder="Deskripsi maintenance (opsional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Mulai</FormLabel>
                  <FormControl>
                    <DatePicker
                      placeholder="Pilih tanggal mulai"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY - dddd, DD MMMM YYYY (HH:mm:ss)"
                      showTime={{ format: 'HH:mm:ss' }}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => {
                        field.onChange(date ? date.format("YYYY-MM-DDTHH:mm:ss") : "");
                      }}
                      disabledDate={(current) => {
                        return current && current < dayjs().startOf('day');
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimate_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimasi Hari</FormLabel>
                  <FormControl>
                    <AntdSelect
                      placeholder="Pilih estimasi hari"
                      value={field.value || undefined}
                      onChange={field.onChange}
                      style={{ width: "100%" }}
                    >
                      {Array.from({ length: 30 }, (_, i) => (
                        <AntdSelect.Option key={i + 1} value={i + 1}>{`${i + 1} Hari`}</AntdSelect.Option>
                      ))}
                    </AntdSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
            <div className="flex justify-end gap-4">
              <Button type="submit" variant="main">Konfirmasi</Button>
            </div>
          </form>
        </Form>
      </div>
    </ConfigProvider>
  );
}