"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Search, Plus, Trash2, MoreVertical, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGetArusKasReport, useGetPlanningCategoriesSelect, useGetPlanningCategoryAccounts } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArusKasCategoryAccounts } from '@/app/(dashboard)/dashboard/perencanaan/components/display-components';
import { ArusKasCategoryForm } from '@/app/(dashboard)/dashboard/perencanaan/components/arus-kas-category-form';
import { ArusKasAccountForm } from '@/app/(dashboard)/dashboard/perencanaan/components/arus-kas-account-form';
import { ArusKasDeleteCategoryDialog } from '@/app/(dashboard)/dashboard/perencanaan/components/dialogs';

export default function ArusKasPage() {
  const params = useParams();
  const planningId = params.planningId as string;
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Perencanaan", link: "/dashboard/perencanaan" },
    { title: "Detail Perencanaan", link: `/dashboard/perencanaan/${planningId}` },
    { title: "Laporan Arus Kas", link: "#" }
  ];

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('template');
  const [activeSubTab, setActiveSubTab] = useState('kategori');
  
  // State untuk modal
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // State untuk template categories dan accounts - akan diisi dari API
  const [arusKasCategories, setArusKasCategories] = useState<Array<{
    id: string, 
    name: string, 
    description: string,
    type: string,
    accounts: Array<{id: string, name: string, code: string}>
  }>>([]);

  // Fetch data dari API
  const { data: arusKasData, isLoading, error } = useGetArusKasReport({
    date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    date_to: dateTo ? dateTo.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  // Hook untuk API categories
  const { data: categoriesData, isLoading: isLoadingCategories, refetch: refetchCategories } = useGetPlanningCategoriesSelect();

  // Process categories data from API - memoized for performance
  const processedCategories = useMemo(() => {
    if (!categoriesData) return [];
    
    const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.data || [];
    
    // Filter kategori berdasarkan tipe LAINNYA saja
    const lainnyaCategories = categories.filter((cat: any) => cat.type === 'LAINNYA');
    
    // Transform data to match expected format
    const transformCategory = (category: any) => ({
      id: category.id.toString(),
      name: category.name,
      description: category.description || '',
      type: category.type || 'OPERASI',
      accounts: []
    });
    
    return lainnyaCategories.map(transformCategory);
  }, [categoriesData]);
  
  useEffect(() => {
    setArusKasCategories(processedCategories);
  }, [processedCategories]);

  // Handle rekap
  const handleRekap = () => {
    toast({
      title: 'Rekap Arus Kas',
      description: 'Fitur rekap akan segera tersedia',
    });
  };

  // Handler functions untuk kategori
  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: any) => {
    setSelectedCategory(category);
    setIsDeleteCategoryModalOpen(true);
  };

  // Handler functions untuk akun
  const handleAddAccount = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsAddAccountModalOpen(true);
  };

  const handleEditAccount = (accountId: string) => {
    setSelectedAccount({ id: accountId });
    setIsEditAccountModalOpen(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    toast({
      title: 'Delete Account',
      description: 'Fitur delete account akan segera tersedia',
    });
  };

  // Handler untuk data change
  const handleDataChange = () => {
    refetchCategories();
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading data: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Laporan Arus Kas" description="Laporan arus kas perencanaan keuangan" />
      </div>
      <Separator />

      {/* Main Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="data">Data Laporan</TabsTrigger>
          <TabsTrigger value="template">Template Laporan</TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <Card>
          <CardHeader>
            <CardTitle>Arus Kas Perencanaan</CardTitle>
            {arusKasData?.period && (
              <p className="text-sm text-gray-600 mt-1">
                Periode: {arusKasData.period}
              </p>
            )}
          </CardHeader>
          <CardContent>

            {/* Data Laporan Tab */}
            <TabsContent value="data" className="space-y-4">
              {/* Search dan Filter Section */}
              <div className="flex flex-wrap gap-4 mb-6">
                {/* Search Input */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cari berdasarkan nama kategori..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Date From */}
                <div className="min-w-[200px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: id }) : "Dari Tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div className="min-w-[200px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: id }) : "Sampai Tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Rekap Button */}
                <Button onClick={handleRekap} className="min-w-[200px]">
                  Rekap Arus Kas
                </Button>
              </div>

              {/* Table Arus Kas */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-r border-gray-300">
                        Nama Kategori Akun
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        RP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr className="bg-gray-100">
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : arusKasData ? (
                      <>
                        {/* Operating Activities */}
                        {arusKasData.operating_activities?.length > 0 ? (
                          arusKasData.operating_activities.map((item: any, index: number) => (
                            <tr key={`operating-${index}`} className="bg-gray-100 border-b border-gray-200">
                              <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || 'Arus Kas dari Aktivitas Operasi'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="px-4 py-3 text-sm text-gray-500 italic border-r border-gray-300" colSpan={2}>
                              Belum ada data aktivitas operasi
                            </td>
                          </tr>
                        )}

                        {/* TOTAL Aktivitas Operasi */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-300">
                            TOTAL Aktivitas Operasi
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {arusKasData.summary?.net_operating_cashflow ? `Rp. ${new Intl.NumberFormat('id-ID').format(arusKasData.summary.net_operating_cashflow)}` : '-'}
                          </td>
                        </tr>

                        {/* Investing Activities */}
                        {arusKasData.investing_activities?.length > 0 ? (
                          arusKasData.investing_activities.map((item: any, index: number) => (
                            <tr key={`investing-${index}`} className="bg-gray-100 border-b border-gray-200">
                              <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || 'Arus Kas dari Aktivitas Investasi'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="px-4 py-3 text-sm text-gray-500 italic border-r border-gray-300" colSpan={2}>
                              Belum ada data aktivitas investasi
                            </td>
                          </tr>
                        )}

                        {/* TOTAL Aktivitas Investasi */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-300">
                            TOTAL Aktivitas Investasi
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {arusKasData.summary?.net_investing_cashflow ? `Rp. ${new Intl.NumberFormat('id-ID').format(arusKasData.summary.net_investing_cashflow)}` : '-'}
                          </td>
                        </tr>

                        {/* Financing Activities */}
                        {arusKasData.financing_activities?.length > 0 ? (
                          arusKasData.financing_activities.map((item: any, index: number) => (
                            <tr key={`financing-${index}`} className="bg-gray-100 border-b border-gray-200">
                              <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || 'Arus Kas dari Aktivitas Pendanaan'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="px-4 py-3 text-sm text-gray-500 italic border-r border-gray-300" colSpan={2}>
                              Belum ada data aktivitas pendanaan
                            </td>
                          </tr>
                        )}

                        {/* TOTAL Aktivitas Pendanaan */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-300">
                            TOTAL Aktivitas Pendanaan
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {arusKasData.summary?.net_financing_cashflow ? `Rp. ${new Intl.NumberFormat('id-ID').format(arusKasData.summary.net_financing_cashflow)}` : '-'}
                          </td>
                        </tr>

                        {/* Penambahan Kas */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                            Penambahan Kas
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            {arusKasData.summary?.net_cashflow ? `Rp. ${new Intl.NumberFormat('id-ID').format(arusKasData.summary.net_cashflow)}` : '-'}
                          </td>
                        </tr>

                        {/* Saldo Awal */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                            Saldo Awal
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            -
                          </td>
                        </tr>

                        {/* Saldo Akhir */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                            Saldo Akhir
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            -
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr className="bg-gray-100">
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada data arus kas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Template Laporan Tab */}
            <TabsContent value="template" className="space-y-4">
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                {/* Custom Tab Navigation - Clean Design */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                  <button
                    onClick={() => setActiveSubTab('kategori')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeSubTab === 'kategori'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    KATEGORI
                  </button>
                  <button
                    onClick={() => setActiveSubTab('rumus')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeSubTab === 'rumus'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    RUMUS
                  </button>
                </div>

                {/* Kategori Sub Tab */}
                <TabsContent value="kategori" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Kategori Arus Kas</h3>
                    <Button onClick={() => setIsAddCategoryModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kategori
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Dynamic Categories - akan diisi dari API */}
                    {arusKasCategories.length > 0 ? (
                      arusKasCategories.map((category) => (
                        <div key={category.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-blue-600 text-lg">{category.name}</h4>
                            <div className="flex space-x-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleEditCategory({
                                    id: category.id,
                                    name: category.name,
                                    description: category.description,
                                    type: category.type
                                  })}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteCategory({
                                      id: category.id,
                                      name: category.name,
                                      description: category.description,
                                      type: category.type
                                    })}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {/* Header NAMA AKUN */}
                          <div className="bg-gray-100 p-2 mb-2">
                            <p className="font-bold text-gray-900">NAMA AKUN</p>
                          </div>
                          
                          <ArusKasCategoryAccounts
                            categoryId={category.id}
                            onAddAccount={() => handleAddAccount(category.id)}
                            onEditAccount={handleEditAccount}
                            onDeleteAccount={handleDeleteAccount}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Belum ada kategori arus kas. Tambahkan kategori di atas.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Rumus Sub Tab */}
                <TabsContent value="rumus" className="space-y-4">
                  <h3 className="text-lg font-semibold">Rumus Arus Kas</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Arus Kas Bersih</h4>
                      <p className="text-sm text-gray-600">Arus Kas Operasi + Arus Kas Investasi + Arus Kas Pendanaan</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Arus Kas Operasi</h4>
                      <p className="text-sm text-gray-600">Pendapatan Operasi - Beban Operasi</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Arus Kas Investasi</h4>
                      <p className="text-sm text-gray-600">Pembelian Aset - Penjualan Aset</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Arus Kas Pendanaan</h4>
                      <p className="text-sm text-gray-600">Modal Masuk - Modal Keluar</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </CardContent>
        </Card>
        </div>
      </Tabs>

      {/* Modal Forms */}
      <ArusKasCategoryForm 
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        categoryType="OPERASI"
        onDataChange={handleDataChange}
      />
      
      <ArusKasCategoryForm 
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        categoryType={selectedCategory?.type as 'OPERASI' | 'INVESTASI' | 'PENDANAAN' || 'OPERASI'}
        editData={selectedCategory}
        onDataChange={handleDataChange}
      />
      
      <ArusKasDeleteCategoryDialog
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        categoryId={selectedCategory?.id || ''}
        categoryName={selectedCategory?.name || ''}
        onDataChange={handleDataChange}
      />
      
      <ArusKasAccountForm
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        categoryId={selectedCategoryId}
        onSuccess={handleDataChange}
      />
      
      <ArusKasAccountForm
        isOpen={isEditAccountModalOpen}
        onClose={() => {
          setIsEditAccountModalOpen(false);
          setSelectedAccount(null);
        }}
        categoryId={selectedCategoryId}
        onSuccess={handleDataChange}
      />
    </div>
  );
}
