import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getProducts } from "@/client/productClient";
import ProductTableWrapper from "./product-table-wrapper";

const breadcrumbItems = [{ title: "Products", link: "/dashboard/products" }];

export const metadata: Metadata = {
  title: "Products | Transgo",
  description: "Manage products like iPhone, Camera, Outdoor, Starlink",
};

const page = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Products" description="Manage your products inventory" />

          <Link
            href={"/dashboard/products/create"}
            className={cn(buttonVariants({ variant: "main" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </div>
        <Separator />
        
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProductTableWrapper />
        </HydrationBoundary>
      </div>
    </>
  );
};

export default page; 