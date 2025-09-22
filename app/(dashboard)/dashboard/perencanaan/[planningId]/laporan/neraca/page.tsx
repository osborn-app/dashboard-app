"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Search, Plus, Trash2, MoreVertical, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGetNeracaReport, useGetPlanningCategoriesSelect } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CategoryAccounts } from '@/app/(dashboard)/dashboard/perencanaan/components/display-components';
import { CategoryForm } from '@/app/(dashboard)/dashboard/perencanaan/components/category-form';
import { AccountForm } from '@/app/(dashboard)/dashboard/perencanaan/components/account-form';
import { DeleteCategoryDialog } from '@/app/(dashboard)/dashboard/perencanaan/components/dialogs';

export default function NeracaPage() {
  const params = useParams();
  const planningId = params.planningId as string;
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Perencanaan", link: "/dashboard/perencanaan" },
    { title: "Detail Perencanaan", link: `/dashboard/perencanaan/${planningId}` },
    { title: "Laporan Neraca", link: "#" }
  ];

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('aktiva');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    description: string;
    type: string;
  } | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // State untuk template categories dan accounts - akan diisi dari API
  const [aktivaCategories, setAktivaCategories] = useState<Array<{
    id: string, 
    name: string, 
    description: string,
    type: string,
    accounts: Array<{id: string, name: string, code: string}>
  }>>([]);
  const [pasivaCategories, setPasivaCategories] = useState<Array<{
    id: string, 
    name: string, 
    description: string,
    type: string,
    accounts: Array<{id: string, name: string, code: string}>
  }>>([]);

  // Fetch data dari API
  const { data: neracaData, isLoading, error } = useGetNeracaReport({
    date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    date_to: dateTo ? dateTo.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    template_id: planningId, // Use planningId as template_id
  });

  // Hook untuk API categories
  const { data: categoriesData, isLoading: isLoadingCategories, refetch: refetchCategories } = useGetPlanningCategoriesSelect();





  // ✅ Process categories data from API - memoized for performance
  const processedCategories = useMemo(() => {
    if (!categoriesData) return { aktiva: [], pasiva: [] };
    
    const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.data || [];
    
    // Filter kategori berdasarkan tipe (aktiva/pasiva)
    const aktiva = categories.filter((cat: any) => cat.type === 'AKTIVA');
    const pasiva = categories.filter((cat: any) => cat.type === 'PASIVA');
    
    // Transform data to match expected format
    const transformCategory = (category: any) => ({
      id: category.id.toString(),
      name: category.name,
      description: category.description || '',
      type: category.type || 'AKTIVA',
      accounts: []
    });
    
    const transformedAktiva = aktiva.map(transformCategory);
    const transformedPasiva = pasiva.map(transformCategory);
    
    return { aktiva: transformedAktiva, pasiva: transformedPasiva };
  }, [categoriesData]);
  
  // ✅ useEffect dengan dependency yang benar
  useEffect(() => {
    if (processedCategories.aktiva.length > 0 || processedCategories.pasiva.length > 0) {
      setAktivaCategories(processedCategories.aktiva);
      setPasivaCategories(processedCategories.pasiva);
    }
  }, [processedCategories]);



  // Handle rekap
  const handleRekap = () => {
    toast({
      title: 'Rekap Neraca',
      description: 'Fitur rekap akan segera tersedia',
    });
  };

  // Handle tambah kategori
  const handleAddCategory = () => {
    setIsAddCategoryModalOpen(true);
  };


  // Handle edit kategori
  const handleEditCategory = (category: { id: string; name: string; description: string; type: string }) => {
    setSelectedCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  // Handle delete kategori
  const handleDeleteCategory = (category: { id: string; name: string; description: string; type: string }) => {
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
      description: `Hapus account dengan ID: ${accountId}`,
    });
  };

  // Handle refresh data
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
        <Heading title="Laporan Neraca" description="Laporan neraca perencanaan keuangan" />
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
            <CardTitle>Neraca Perencanaan</CardTitle>
            {neracaData?.period && (
              <p className="text-sm text-gray-600 mt-1">
                Periode: {neracaData.period}
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
                        placeholder="Cari berdasarkan nama akun..."
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
                    Rekap Neraca
                  </Button>
                </div>

                {/* Table Neraca */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-300" rowSpan={2}>
                          NO AKUN
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-300" rowSpan={2}>
                          NAMA AKUN
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700 border-r border-gray-300" colSpan={2}>
                          PERENCANAAN
                        </th>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-right py-2 px-4 font-medium text-gray-600 border-r border-gray-300">
                          RP
                        </th>
                        <th className="text-right py-2 px-4 font-medium text-gray-600">
                          RP
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : neracaData ? (
                        <>
                          {/* AKTIVA Section - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-center" colSpan={4}>
                              AKTIVA
                            </td>
                          </tr>
                          
                          {/* AKTIVA LANCAR - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="py-3 px-4 text-sm font-medium text-gray-800 text-center" colSpan={4}>
                              AKTIVA LANCAR
                            </td>
                          </tr>
                          
                          {/* Data AKTIVA LANCAR (putih) */}
                          {neracaData.assets?.filter((item: any) => item.account_code?.startsWith('11')).length > 0 ? (
                            neracaData.assets.filter((item: any) => item.account_code?.startsWith('11')).map((item: any, index: number) => (
                              <tr key={`current-asset-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                                <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                  {item.account_code || '-'}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                  {item.account_name || '-'}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                  {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : ''}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                  -
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="bg-white border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-500 italic border-r border-gray-300" colSpan={4}>
                                Belum ada data aktiva lancar
                              </td>
                            </tr>
                          )}
                          
                          {/* TOTAL AKTIVA LANCAR - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                              TOTAL AKTIVA LANCAR
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                              {neracaData.assets?.filter((item: any) => item.account_code?.startsWith('11')).reduce((sum: number, item: any) => sum + (item.amount || 0), 0) > 0 ? 
                                `Rp. ${new Intl.NumberFormat('id-ID').format(neracaData.assets.filter((item: any) => item.account_code?.startsWith('11')).reduce((sum: number, item: any) => sum + (item.amount || 0), 0))}` : 
                                'Rp. 0'}
                            </td>
                          </tr>
                          
                          {/* AKTIVA TETAP - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="py-3 px-4 text-sm font-medium text-gray-800 text-center" colSpan={4}>
                              AKTIVA TETAP
                            </td>
                          </tr>
                          
                          {/* Data AKTIVA TETAP (putih) */}
                          {neracaData.assets?.filter((item: any) => item.account_code?.startsWith('12')).length > 0 ? (
                            neracaData.assets.filter((item: any) => item.account_code?.startsWith('12')).map((item: any, index: number) => (
                              <tr key={`fixed-asset-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                                <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                  {item.account_code || '-'}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                  {item.account_name || '-'}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                  {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : ''}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                  -
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="bg-white border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-500 italic border-r border-gray-300" colSpan={4}>
                                Belum ada data aktiva tetap
                              </td>
                            </tr>
                          )}
                          
                          {/* TOTAL AKTIVA TETAP - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                              TOTAL AKTIVA TETAP
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                              {neracaData.assets?.filter((item: any) => item.account_code?.startsWith('12')).reduce((sum: number, item: any) => sum + (item.amount || 0), 0) > 0 ? 
                                `Rp. ${new Intl.NumberFormat('id-ID').format(neracaData.assets.filter((item: any) => item.account_code?.startsWith('12')).reduce((sum: number, item: any) => sum + (item.amount || 0), 0))}` : 
                                'Rp. 0'}
                            </td>
                          </tr>
                          
                          {/* TOTAL AKTIVA - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-t-2 border-gray-400 border-b border-gray-200">
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                              TOTAL AKTIVA
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                              {neracaData.summary?.total_assets ? `Rp. ${new Intl.NumberFormat('id-ID').format(neracaData.summary.total_assets)}` : 'Rp. 0'}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            Tidak ada data neraca
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
                      onClick={() => setActiveSubTab('aktiva')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeSubTab === 'aktiva'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      AKTIVA
                    </button>
                    <button
                      onClick={() => setActiveSubTab('pasiva')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeSubTab === 'pasiva'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      PASIVA
                    </button>
                  </div>

                  {/* AKTIVA Sub Tab */}
                  <TabsContent value="aktiva" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Kategori Aktiva</h3>
                      <Button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        TAMBAH KATEGORI
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Dynamic Categories - akan diisi dari API */}
                      {aktivaCategories.length > 0 ? (
                        aktivaCategories.map((category) => (
                          <div key={category.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-green-600 text-lg">{category.name}</h4>
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
                            
                            <CategoryAccounts 
                              categoryId={category.id}
                              onAddAccount={() => handleAddAccount(category.id)}
                              onEditAccount={handleEditAccount}
                              onDeleteAccount={handleDeleteAccount}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Belum ada kategori aktiva. Tambahkan kategori di atas.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* PASIVA Sub Tab */}
                  <TabsContent value="pasiva" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Kategori Pasiva</h3>
                      <Button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        TAMBAH KATEGORI
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Dynamic Categories - akan diisi dari API */}
                      {pasivaCategories.length > 0 ? (
                        pasivaCategories.map((category) => (
                          <div key={category.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-green-600 text-lg">{category.name}</h4>
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
                            
                            <CategoryAccounts 
                              categoryId={category.id}
                              onAddAccount={() => handleAddAccount(category.id)}
                              onEditAccount={handleEditAccount}
                              onDeleteAccount={handleDeleteAccount}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Belum ada kategori pasiva. Tambahkan kategori di atas.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
          </CardContent>
        </Card>
      </div>
      </Tabs>

      {/* Form Components */}
      <CategoryForm 
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        categoryType={activeSubTab.toUpperCase() as 'AKTIVA' | 'PASIVA'}
        onDataChange={handleDataChange}
      />
      
      <CategoryForm 
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        categoryType={selectedCategory?.type as 'AKTIVA' | 'PASIVA' || activeSubTab.toUpperCase() as 'AKTIVA' | 'PASIVA'}
        editData={selectedCategory}
        onDataChange={handleDataChange}
      />
      
      <DeleteCategoryDialog
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        categoryId={selectedCategory?.id || ''}
        categoryName={selectedCategory?.name || ''}
        onDataChange={handleDataChange}
      />
      
      <AccountForm 
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        categoryId={selectedCategoryId}
        onSuccess={handleDataChange}
      />
      
      <AccountForm
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