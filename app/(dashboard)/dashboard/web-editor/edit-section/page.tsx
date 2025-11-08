'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BreadCrumb from '@/components/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionEditor from '@/components/web-editor/SectionEditor';
import { Loader2 } from 'lucide-react';

const breadcrumbItems = [
  { title: 'Web Editor', link: '/dashboard/web-editor/pages' },
  { title: 'Edit Section', link: '/dashboard/web-editor/edit-section' },
];

function EditSectionContent() {
  const searchParams = useSearchParams();
  const pageSlug = searchParams.get('page') || 'home';
  const [activeTab, setActiveTab] = useState(pageSlug);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Global Layout</TabsTrigger>
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="orders">Detail Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <SectionEditor 
            pageSlug="global" 
            pageTitle="GLOBAL LAYOUT"
          />
        </TabsContent>

        <TabsContent value="home" className="space-y-4">
          <SectionEditor 
            pageSlug="home" 
            pageTitle="HOME PAGE"
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <SectionEditor 
            pageSlug="orders" 
            pageTitle="DETAIL ORDERS"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EditSectionPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <EditSectionContent />
    </Suspense>
  );
}

