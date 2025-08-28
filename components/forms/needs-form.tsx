"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Select as AntdSelect, DatePicker, ConfigProvider } from "antd";
import idID from 'antd/es/locale/id_ID';
import { useGetInfinityFleetsForNeeds } from "@/hooks/api/useFleet";

import { useDebounce } from "use-debounce";

import dayjs from "dayjs";
import 'dayjs/locale/id';

type NeedsFormProps = {
  onSubmit: (form: { fleet_id: number; name: string; description: string; start_date: string; estimate_days: number; estimate_hours: number; estimate_minutes: number }) => void;
};

const formSchema = z.object({
  name: z.string().min(3, { message: "Nama maintenance minimal 3 karakter" }),
  fleet_id: z.string().min(1, { message: "Armada harus dipilih" }),
  description: z.string().optional(),
  start_date: z.string().min(1, { message: "Tanggal mulai harus diisi" }).refine(val => {
    if (!val) return false;
    return new Date(val).getTime() >= new Date().setHours(0,0,0,0);
  }, { message: "Tanggal mulai tidak boleh di masa lalu" }),
  estimate_days: z.coerce.number().min(0, { message: "Estimasi hari minimal 0" }),
  estimate_hours: z.coerce.number().min(0, { message: "Estimasi jam minimal 0" }),
  estimate_minutes: z.coerce.number().min(0, { message: "Estimasi menit minimal 0" }),
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
  } = useGetInfinityFleetsForNeeds(searchFleetDebounce);

  const form = useForm<NeedsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fleet_id: "",
      description: "",
      start_date: "",
      estimate_days: 0,
      estimate_hours: 0,
      estimate_minutes: 0,
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
                            {item.name} - {item.plate_number}
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
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="estimate_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimasi Durasi</FormLabel>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Hari:</Label>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            className="w-20"
                          />
                        </FormControl>
                      </div>

                      <FormField
                        control={form.control}
                        name="estimate_hours"
                        render={({ field: hoursField }) => (
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">Jam:</Label>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="23"
                                value={hoursField.value || 0}
                                onChange={(e) => {
                                  hoursField.onChange(parseInt(e.target.value) || 0);
                                }}
                                className="w-16"
                              />
                            </FormControl>
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimate_minutes"
                        render={({ field: minutesField }) => (
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">Menit:</Label>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="59"
                                value={minutesField.value || 0}
                                onChange={(e) => {
                                  minutesField.onChange(parseInt(e.target.value) || 0);
                                }}
                                className="w-16"
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                    </div>
                    <FormDescription>
                      Jam: 0-23, Menit: 0-59
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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