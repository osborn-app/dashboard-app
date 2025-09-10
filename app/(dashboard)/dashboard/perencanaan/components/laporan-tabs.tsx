"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Scale, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface LaporanTabsProps {
  planningId: string;
}

const reportCards = [
  {
    title: "JURNAL UMUM",
    description: "Laporan jurnal umum perencanaan",
    icon: BookOpen,
    href: "/dashboard/perencanaan/detail/laporan/jurnal-umum",
    color: "bg-blue-500"
  },
  {
    title: "LABA RUGI",
    description: "Laporan laba rugi perencanaan",
    icon: TrendingUp,
    href: "/dashboard/perencanaan/detail/laporan/laba-rugi",
    color: "bg-green-500"
  },
  {
    title: "NERACA",
    description: "Laporan neraca perencanaan",
    icon: Scale,
    href: "/dashboard/perencanaan/detail/laporan/neraca",
    color: "bg-purple-500"
  },
  {
    title: "ARUS KAS",
    description: "Laporan arus kas perencanaan",
    icon: RefreshCw,
    href: "/dashboard/perencanaan/detail/laporan/arus-kas",
    color: "bg-orange-500"
  }
];

export function LaporanTabs({ planningId }: LaporanTabsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {reportCards.map((report, index) => {
        const IconComponent = report.icon;
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href={report.href}>
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
  );
}
