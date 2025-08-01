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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Fleet = { id: number; name: string };
type NeedsFormProps = {
  fleets: Fleet[];
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

export default function NeedsForm({ fleets, onSubmit }: NeedsFormProps) {
  const [search, setSearch] = useState("");
  const filteredFleets = fleets.filter(fleet =>
    fleet.name.toLowerCase().includes(search.toLowerCase())
  );
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

  return (
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
                    <Input placeholder="Nama maintenance" {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Armada" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1">
                          <Input
                            placeholder="Cari Armada..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                        {filteredFleets.map(fleet => (
                          <SelectItem key={fleet.id} value={fleet.id.toString()}>
                            {fleet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Input type="date" {...field} />
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
                    <Input type="number" min={1} {...field} />
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
  );
}