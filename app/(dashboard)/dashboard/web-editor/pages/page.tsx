'use client';

import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/breadcrumb';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetWebPages } from '@/hooks/api/useWebContent';
import Spinner from '@/components/spinner';

const breadcrumbItems = [
  { title: 'Web Editor', link: '/dashboard/web-editor/pages' },
  { title: 'Pages', link: '/dashboard/web-editor/pages' },
];

export default function WebEditorPagesPage() {
  const router = useRouter();
  const { data: pages, isLoading, isError } = useGetWebPages();

  const handleEditPage = (slug: string) => {
    router.push(`/dashboard/web-editor/edit-section?page=${slug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />
      
      <div className="flex items-start justify-between">
        <Heading
          title="Web Pages"
          description="Manage your website pages and sections"
        />
        <Button
          onClick={() => router.push('/dashboard/web-editor/pages/create')}
          className="text-xs md:text-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Page
        </Button>
      </div>
      
      <Separator />

      {isLoading && (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">Loading pages...</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="flex h-96 items-center justify-center">
          <p className="text-red-600">Failed to load pages. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && pages && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-gray-500">No pages found.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Click "Add Page" to create your first page.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {page.sections?.length || 0} sections
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.is_published ? 'default' : 'secondary'}>
                        {page.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(page.updated_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPage(page.slug)}
                      >
                        Edit Sections
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

