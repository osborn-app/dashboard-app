"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Cloud } from "lucide-react";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const breadcrumbItems = [
  { title: "Realisasi", link: "/dashboard/realisasi" },
  { title: "Laporan Keuangan", link: "/dashboard/realisasi" },
  { title: "Jurnal Umum", link: "/dashboard/realisasi/laporan-keuangan/jurnal-umum" }
];

export default function JurnalUmumPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Jurnal Umum" />
      </div>
      <Separator />

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          {/* Search and Action Bar */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Cari Akun"
                className="w-full"
              />
            </div>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Cari
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Cloud className="h-4 w-4 mr-2" />
              Rekap Jurnal Umum
            </Button>
          </div>

          {/* Financial Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tanggal</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Akun</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Debit</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Kredit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">13/08/2025</td>
                  <td className="py-3 px-4 text-gray-900">11130 - DANA PMU</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp11</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">13/08/2025</td>
                  <td className="py-3 px-4 text-gray-900">11120 - DANA BOS</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp11</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">12/07/2025</td>
                  <td className="py-3 px-4 text-gray-900">0123456789 - DANA PEMBANGUNAN LAB</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp437.500</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">12/07/2025</td>
                  <td className="py-3 px-4 text-gray-900">- AKUMULATIF LABA (RUGI)</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp437.500</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">12/06/2025</td>
                  <td className="py-3 px-4 text-gray-900">0123456789 - DANA PEMBANGUNAN LAB</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp437.500</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">12/06/2025</td>
                  <td className="py-3 px-4 text-gray-900">- AKUMULATIF LABA (RUGI)</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp437.500</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">11/06/2025</td>
                  <td className="py-3 px-4 text-gray-900">11441 - SPP</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp150.000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">11/06/2025</td>
                  <td className="py-3 px-4 text-gray-900">11441 - SPP</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp150.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">07/06/2025</td>
                  <td className="py-3 px-4 text-gray-900">11441 - SPP</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp600.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">07/06/2025</td>
                  <td className="py-3 px-4 text-gray-900">11441 - SPP</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp600.000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">07/06/2025</td>
                  <td className="py-3 px-4 text-gray-900">11441 - SPP</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp150.000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">07/06/2025</td>
                  <td className="py-3 px-4 text-gray-900">11441 - SPP</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp150.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}