import * as z from "zod";

const additionalSchema = z.object({
  name: z.string().min(1, "deskripsi layanan"),
  price: z.string()
    .optional()
    .refine((val) => {
      // If value is an empty or undefined, it's valid (will be filtered out later)
      if (!val || val.trim() === "") return true;
      
      // If value exists, validate it's a valid number (including negative numbers)
      const cleanVal = val.replace(/,/g, "");
      const num = Number(cleanVal);
      return !isNaN(num); // Allow negative numbers, just ensure it's a valid number
    }, { message: "Harga harus berupa angka yang valid" })
    .transform((val) => {
      // If value is empty or undefined, return undefined
      if (!val || val.trim() === "") return undefined;
      
      // Transform valid values to numbers (including negative)
      const cleanVal = val.replace(/,/g, "");
      const num = Number(cleanVal);
      return num;
    }),
});

const formSchema = z.object({
  start_request: z.object({
    is_self_pickup: z.boolean(),
    // address: z.string().min(1, { message: "Tolong masukkan alamat" }),
    // distance: z.coerce.number().gte(0, "Jarak minimal 0 KM"),
    driver_id: z.string().optional(), // Changed from required to optional
  }),
  end_request: z.object({
    is_self_pickup: z.boolean(),
    // address: z.string().min(1, { message: "Tolong masukkan alamat" }),
    // distance: z.coerce.number().gte(0, "Jarak minimal 0 KM"),
    driver_id: z.string().optional(), // Changed from required to optional
  }),
  customer: z.string().min(1, { message: "Tolong pilih pelanggan" }),
  fleet: z.string().min(1, { message: "Tolong pilih armada" }),
  description: z.string().optional().nullable(),
  is_with_driver: z.any(),
  is_out_of_town: z.any(),
  // imgUrl: z.array(ImgSchema),
  date: z.coerce.date({ required_error: "Tolong masukkan Waktu" }),
  duration: z.coerce.string().min(1, { message: "tolong masukkan durasi" }),
  discount: z.coerce.string().min(1, { message: "tolong masukkan diskon" }),
  insurance_id: z.string().min(1, { message: "tolong pilih asuransi" }),
  additionals: z.array(additionalSchema),
});

const generateSchema = (startSelfPickUp?: boolean, endSelfPickup?: boolean) => {
  let schema = formSchema;

  if (!startSelfPickUp) {
    schema = schema.extend({
      service_price: z.coerce
        .string()
        .min(1, { message: "tolong masukkan harga layanan" })
        .refine((val) => {
          const cleanVal = val.replace(/,/g, "");
          const num = Number(cleanVal);
          return !isNaN(num); // Allow negative numbers, just ensure it's a valid number
        }, { message: "Harga layanan harus berupa angka yang valid" }),

      start_request: schema.shape.start_request.extend({
        address: z.string().min(1, { message: "Tolong masukkan alamat" }),
        distance: z.coerce.number().gte(0, "Jarak minimal 0 KM"),
      }),
    });
  }

  if (!endSelfPickup) {
    schema = schema.extend({
      service_price: z.coerce
        .string()
        .min(1, { message: "tolong masukkan harga layanan" })
        .refine((val) => {
          const cleanVal = val.replace(/,/g, "");
          const num = Number(cleanVal);
          return !isNaN(num); // Allow negative numbers, just ensure it's a valid number
        }, { message: "Harga layanan harus berupa angka yang valid" }),

      end_request: schema.shape.end_request.extend({
        address: z.string().min(1, { message: "Tolong masukkan alamat" }),
        distance: z.coerce.number().gte(0, "Jarak minimal 0 KM"),
      }),
    });
  }

  return schema;
};

const editFormSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(3, { message: "Name must be at least 3 characters" }),
  color: z
    .string({
      required_error: "Color is required",
      invalid_type_error: "Color must be a string",
    })
    .optional()
    .nullable(),
  plate_number: z
    .string({
      required_error: "plate number is required",
      invalid_type_error: "plate number must be a string",
    })
    .min(1, { message: "plate number is required" }),
  type: z.string({ required_error: "type is required" }).min(1, {
    message: "type is required",
  }),
  price: z.string({ required_error: "price is required" }).min(1, {
    message: "price is required",
  }),
  location_id: z.string().min(1, { message: "Tolong pilih lokasi" }),
});

export { formSchema, generateSchema, editFormSchema };
