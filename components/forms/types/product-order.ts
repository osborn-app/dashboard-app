import { z } from "zod";

export interface ProductOrderFormProps {
  initialData?: any;
  isEdit?: boolean | null;
  productOrderId?: string;
}

export interface DetailPrice {
  sub_total_price: number;
  total_tax: number;
  total_price: number;
  discount_amount: number;
}

export const productOrderSchema = z.object({
  customer: z.string().min(1, "Customer is required").or(z.undefined()),
  product: z.string().min(1, "Product is required").or(z.undefined()),
  date: z.any(),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().optional(),
  discount: z.string().optional(),
  insurance_id: z.string().optional(),
  is_with_driver: z.boolean().optional(),
  is_out_of_town: z.boolean().optional(),
  service_price: z.string().optional(),
  start_request: z.object({
    is_self_pickup: z.boolean(),
    driver_id: z.string().optional(),
    distance: z.union([z.string(), z.number()]).optional(),
    address: z.string().optional(),
  }),
  end_request: z.object({
    is_self_pickup: z.boolean(),
    driver_id: z.string().optional(),
    distance: z.union([z.string(), z.number()]).optional(),
    address: z.string().optional(),
  }),
  additionals: z.array(z.object({
    name: z.string(),
    price: z.coerce.number().min(1, { message: "tolong masukkan harga layanan" }),
  })).optional(),
}).refine((data) => {
  // Additional validation for required fields when creating
  if (!data.customer || !data.product || !data.date || !data.duration) {
    return false;
  }
  return true;
}, {
  message: "Please fill all required fields",
  path: ["form"]
});

export type ProductOrderFormValues = z.infer<typeof productOrderSchema>; 