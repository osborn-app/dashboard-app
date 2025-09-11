"use client";

import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Scale, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "#" },
  { title: "Laporan", link: "#" }
];

const reportCards = [
  {
    title: "JURNAL UMUM",
    description: "Laporan jurnal umum perencanaan",
    icon: BookOpen,
    href: "/dashboard/perencanaan/[planningId]/laporan/jurnal-umum",
    color: "bg-blue-500"
  },
  {
    title: "LABA RUGI",
    description: "Laporan laba rugi perencanaan",
    icon: TrendingUp,
    href: "/dashboard/perencanaan/[planningId]/laporan/laba-rugi",
    color: "bg-green-500"
  },
  {
    title: "NERACA",
    description: "Laporan neraca perencanaan",
    icon: Scale,
    href: "/dashboard/perencanaan/[planningId]/laporan/neraca",
    color: "bg-purple-500"
  },
  {
    title: "ARUS KAS",
    description: "Laporan arus kas perencanaan",
    icon: RefreshCw,
    href: "/dashboard/perencanaan/[planningId]/laporan/arus-kas",
    color: "bg-orange-500"
  }
];

export default function LaporanPage() {
  const params = useParams();
  const planningId = params.planningId as string;

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Laporan" description="Pilih jenis laporan yang ingin dilihat" />
        </div>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reportCards.map((report, index) => {
            const IconComponent = report.icon;
            const href = report.href.replace('[planningId]', planningId);
            
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={href}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${report.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {report.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">
                      {report.description}
                    </CardDescription>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
