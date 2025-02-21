import { z } from "zod";

// export const formSchema = z.object({
//   nominal: z.number().min(1, "Tolong masukkan nominal anda"),
//   bank_name: z.any(),
//   noRekening: z.string().min(5, "Tolong masukkan nomor rekening anda"),
//   driver_id: z.any(),
//   location_id: z.any(),
//   date: z.coerce.date({ required_error: "Tolong masukkan Waktu" }),
//   description: z.string().min(10, "Keterangan wajib di isi!"),
// });

export const formSchema = z.object({
  nominal: z.coerce
    .number()
    .min(1, { message: "Tolong masukkan nominal anda" }),
  bank: z.string().min(1, { message: "Tolong masukkan nama bank" }),
  transaction_proof_url: z
    .string()
    .url("URL bukti transaksi tidak valid")
    .optional()
    .nullable(),
  noRekening: z
    .string()
    .min(5, { message: "Tolong masukkan nomor rekening anda" }),
  driver: z.coerce.number().min(1, { message: "Driver ID wajib diisi" }),
  fleet: z.coerce.number().min(1, { message: "Fleet ID wajib diisi" }),
  location: z.coerce.number().min(1, { message: "Lokasi wajib diisi" }),
  date: z.coerce.date({ required_error: "Tolong masukkan Waktu" }),
  description: z.string().min(10, { message: "Keterangan wajib di isi!" }),
});

export const editSchema = z.object({
  nominal: z.coerce
    .number()
    .min(1, { message: "Tolong masukkan nominal anda" }),
  bank: z.string().min(1, { message: "Tolong masukkan nama bank" }),
  transfer_proof_url: z
    .string()
    .url("URL bukti transfer tidak valid")
    .optional()
    .nullable(),
  noRekening: z
    .string()
    .min(5, { message: "Tolong masukkan nomor rekening anda" }),
  fleet: z.coerce.number().min(1, { message: "Fleet ID wajib diisi" }),
  driver: z.coerce.number().min(1, { message: "Driver ID wajib diisi" }),
  location: z.coerce.number().min(1, { message: "Lokasi wajib diisi" }),
  date: z.coerce.date({ required_error: "Tolong masukkan Waktu" }),
  description: z.string().min(10, { message: "Keterangan wajib di isi!" }),
});
