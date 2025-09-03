"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Coins, TrendingUp, Scale, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Reports() {
  const router = useRouter();

  const handleCardClick = (reportType: string) => {
    router.push(`/dashboard/realisasi/laporan-keuangan/${reportType}`);
  };

  return (
    <div className="space-y-6">
      {/* Financial Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Jurnal Umum */}
        <Card 
          className="w-full h-48 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('jurnal-umum')}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
            {/* Title */}
            <div className="z-10">
              <h3 className="text-xl font-bold text-blue-800">Jurnal Umum</h3>
            </div>
            
            {/* Graphic - Bottom Right */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
              {/* Curved light blue shape */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200 rounded-full transform translate-x-8 translate-y-8"></div>
              
              {/* Document icon with coins */}
              <div className="absolute bottom-4 right-4 flex flex-col items-center">
                <FileText className="h-8 w-8 text-blue-400" />
                <div className="flex items-center space-x-1 mt-1">
                  <Coins className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-bold text-lg">Rp</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Laba Rugi */}
        <Card 
          className="w-full h-48 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('laba-rugi')}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
            {/* Title */}
            <div className="z-10">
              <h3 className="text-xl font-bold text-blue-800">Laba Rugi</h3>
            </div>
            
            {/* Graphic - Bottom Right */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
              {/* Curved light blue shape */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200 rounded-full transform translate-x-8 translate-y-8"></div>
              
              {/* Document icon with line graph */}
              <div className="absolute bottom-4 right-4 flex flex-col items-center">
                <FileText className="h-8 w-8 text-blue-400" />
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-bold text-lg">Rp</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Neraca */}
        <Card 
          className="w-full h-48 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('neraca')}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
            {/* Title */}
            <div className="z-10">
              <h3 className="text-xl font-bold text-blue-800">Neraca</h3>
            </div>
            
            {/* Graphic - Bottom Right */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
              {/* Curved light blue shape */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200 rounded-full transform translate-x-8 translate-y-8"></div>
              
              {/* Document icon with balance scale */}
              <div className="absolute bottom-4 right-4 flex flex-col items-center">
                <FileText className="h-8 w-8 text-blue-400" />
                <div className="flex items-center space-x-1 mt-1">
                  <Scale className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-bold text-lg">Rp</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arus Kas */}
        <Card 
          className="w-full h-48 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('arus-kas')}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
            {/* Title */}
            <div className="z-10">
              <h3 className="text-xl font-bold text-blue-800">Arus Kas</h3>
            </div>
            
            {/* Graphic - Bottom Right */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
              {/* Curved light blue shape */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200 rounded-full transform translate-x-8 translate-y-8"></div>
              
              {/* Document icon with arrows */}
              <div className="absolute bottom-4 right-4 flex flex-col items-center">
                <FileText className="h-8 w-8 text-blue-400" />
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpDown className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-bold text-lg">Rp</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Informasi Laporan</h4>
        <p className="text-sm text-blue-700">
          Klik pada salah satu laporan di atas untuk melihat detail lengkap. 
          Semua laporan menggunakan data transaksi yang telah dimasukkan dalam sistem.
        </p>
      </div>
    </div>
  );
}
