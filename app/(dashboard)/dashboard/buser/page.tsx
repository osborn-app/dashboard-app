"use client";
import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import BuserTableWrapper from "./buser-table-wrapper";
import { useSearchParams } from "next/navigation";

const breadcrumbItems = [{ title: "Buser", link: "/dashboard/buser" }];

export default function BuserPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("status") ?? "peringatan";

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex items-start justify-between">
        <Heading title="Buser" />
      </div>
      <Separator />
      <Tabs value={defaultTab} className="space-y-4">
        <BuserTableWrapper />
      </Tabs>
    </div>
  );
}
// trigger deploy dev.dashboard.transgo.id