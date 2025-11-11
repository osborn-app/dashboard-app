'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import Alert from '@/lib/sweetalert';
import {
  useGetPageBySlug,
  useGetSectionsByPage,
  useCreateWebSection,
  useUpdateWebSection,
  useDeleteWebSection,
  useToggleVisibilitySection,
  useDuplicateWebSection,
  useReorderWebSections,
  useCreateWebPage,
} from '@/hooks/api/useWebContent';
import SectionsAccordion from './SectionsAccordion';
import AddSectionDialog from './AddSectionDialog';
import Swal from 'sweetalert2';

interface SectionEditorProps {
  pageSlug: string;
  pageTitle: string;
}

interface Section {
  id: number;
  type: string;
  name: string;
  content: any;
  order: number;
  is_visible: boolean;
}

export default function SectionEditor({
  pageSlug,
  pageTitle,
}: SectionEditorProps) {
  // API Hooks
  const {
    data: pageData,
    isLoading: isLoadingPage,
    isError: isPageError,
  } = useGetPageBySlug(pageSlug);

  const {
    data: sectionsData,
    isLoading: isLoadingSections,
    refetch: refetchSections,
  } = useGetSectionsByPage(pageData?.id || 0);

  const { mutateAsync: createSection } = useCreateWebSection();
  const { mutateAsync: updateSection } = useUpdateWebSection();
  const { mutateAsync: deleteSection } = useDeleteWebSection();
  const { mutateAsync: toggleVisibility } = useToggleVisibilitySection();
  const { mutateAsync: duplicateSection } = useDuplicateWebSection();
  const { mutateAsync: reorderSections } = useReorderWebSections();
  const { mutateAsync: createPage } = useCreateWebPage();

  // UI States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  const allowedSectionTypes = React.useMemo(() => {
    const sharedTypes = [
      'hero',
      'why_choose_us',
      'promo_grid',
      'steps',
      'features',
      'testimonials',
      'faq',
      'cta',
      'custom_html',
    ];

    const globalTypes = [
      'footer',
      'media_mentions',
    ]

    const orderSpecificTypes = [
      'order_must_read',
      'order_delivery_policy',
      'order_payment_info',
      'order_form_guide',
    ];

    const removeNonGlobal = (types: string[]) =>
      types.filter((type) => !['media_mentions', 'footer'].includes(type));

    if (pageSlug === 'global') {
      return Array.from(new Set([...globalTypes]));
    }

    if (pageSlug === 'orders') {
      return Array.from(
        new Set([...orderSpecificTypes]),
      );
    }

    return removeNonGlobal(sharedTypes);
  }, [pageSlug]);

  // Handlers
  const handleCreatePage = async () => {
    setIsCreatingPage(true);
    try {
      const pagePayload = {
        slug: pageSlug,
        title: pageTitle,
        description: `${pageTitle} page`,
        is_published: true,
        seo_meta: {
          title: `${pageTitle} - Transgo`,
          description: `${pageTitle} page of Transgo website`,
          keywords: pageSlug,
        },
      };

      await createPage(pagePayload);

      Alert.success('Berhasil', `Page "${pageTitle}" berhasil dibuat!`);

      // Reload page
      window.location.reload();
    } catch (error: any) {
      console.error('Create page error:', error);
      Alert.error(
        'Gagal',
        error?.response?.data?.message || 'Gagal membuat page.'
      );
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleAddSection = async (type: string, name: string) => {
    if (!pageData?.id) {
      Alert.error('Error', 'Page data tidak ditemukan');
      return;
    }

    try {
      // Get default content based on type
      const defaultContent = getDefaultContent(type);

      // Get next order number
      const nextOrder = sectionsData ? sectionsData.length + 1 : 1;

      const payload = {
        page_id: pageData.id,
        type: type as any, // Type will be validated by backend
        name,
        content: defaultContent,
        order: nextOrder,
        is_visible: true,
      };

      await createSection(payload);
      await refetchSections();

      Alert.success('Berhasil', 'Section berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Add section error:', error);
      Alert.error(
        'Gagal',
        error?.response?.data?.message || 'Gagal menambahkan section.'
      );
      throw error;
    }
  };

  const handleSaveSection = async (sectionId: number, content: any) => {
    try {
      await updateSection({
        id: sectionId,
        data: { content },
      });
      await refetchSections();
      Alert.success('Berhasil', 'Section berhasil diperbarui!');
    } catch (error: any) {
      console.error('Save section error:', error);
      Alert.error(
        'Gagal',
        error?.response?.data?.message || 'Gagal menyimpan section.'
      );
      throw error;
    }
  };

  const handleUpdateName = async (sectionId: number, name: string) => {
    try {
      await updateSection({
        id: sectionId,
        data: { name },
      });
      await refetchSections();
      Alert.success('Berhasil', 'Nama section berhasil diubah!');
    } catch (error: any) {
      console.error('Update name error:', error);
      Alert.error(
        'Gagal',
        error?.response?.data?.message || 'Gagal mengubah nama section.'
      );
      throw error;
    }
  };

  const handleDeleteSection = async (id: number) => {
    const result = await Alert.confirm({
      title: 'Hapus Section?',
      text: 'Section ini akan dihapus permanen!',
      icon: 'warning',
    });

    if (result.isConfirmed) {
      try {
        await deleteSection(id);
        await refetchSections();
        Alert.success('Berhasil', 'Section berhasil dihapus!');
      } catch (error: any) {
        console.error('Delete error:', error);
        Alert.error(
          'Gagal',
          error?.response?.data?.message || 'Gagal menghapus section.'
        );
      }
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateSection(id);
      await refetchSections();
      Alert.success('Berhasil', 'Section berhasil diduplikasi!');
    } catch (error: any) {
      console.error('Duplicate error:', error);
      Alert.error(
        'Gagal',
        error?.response?.data?.message || 'Gagal menduplikasi section.'
      );
    }
  };

  const handleToggleVisibility = async (id: number) => {
    try {
      await toggleVisibility(id);
      await refetchSections();
    } catch (error: any) {
      console.error('Toggle visibility error:', error);
      Alert.error(
        'Gagal',
        error?.response?.data?.message || 'Gagal mengubah visibility.'
      );
    }
  };

  const handleMoveUp = async (section: Section) => {
    if (!sectionsData || !pageData?.id) return;

    const sortedSections = [...sectionsData].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSections.findIndex((s) => s.id === section.id);

    if (currentIndex <= 0) return; // Already at top

    // Swap order
    const newOrder = [...sortedSections];
    [newOrder[currentIndex], newOrder[currentIndex - 1]] = [
      newOrder[currentIndex - 1],
      newOrder[currentIndex],
    ];

    try {
      await reorderSections({
        pageId: pageData.id,
        section_ids: newOrder.map((s) => s.id),
      });
      await refetchSections();
    } catch (error: any) {
      console.error('Reorder error:', error);
      Alert.error(
        'Gagal',
        error?.response?.data?.message || 'Gagal mengubah urutan.'
      );
    }
  };

  const handleMoveDown = async (section: Section) => {
    if (!sectionsData || !pageData?.id) return;

    const sortedSections = [...sectionsData].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSections.findIndex((s) => s.id === section.id);

    if (currentIndex >= sortedSections.length - 1) return; // Already at bottom

    // Swap order
    const newOrder = [...sortedSections];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
      newOrder[currentIndex + 1],
      newOrder[currentIndex],
    ];

    try {
      await reorderSections({
        pageId: pageData.id,
        section_ids: newOrder.map((s) => s.id),
      });
      await refetchSections();
    } catch (error: any) {
      console.error('Reorder error:', error);
      Alert.error(
        'Gagal',
        error?.response?.data?.message || 'Gagal mengubah urutan.'
      );
    }
  };

  const handleRefresh = async () => {
    await refetchSections();
    Alert.success('Berhasil', 'Data berhasil di-refresh!');
  };

  // Show error if page not found (404)
  if (isPageError && !isLoadingPage && !pageData) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg border bg-white">
        <div className="max-w-md space-y-4 text-center">
          <div className="text-6xl">📄</div>
          <h3 className="text-xl font-semibold text-gray-900">
            Page "{pageTitle}" Belum Ada
          </h3>
          <p className="text-gray-600">
            Page dengan slug{' '}
            <code className="rounded bg-gray-100 px-2 py-1">{pageSlug}</code>{' '}
            belum dibuat. Klik tombol di bawah untuk membuat page ini terlebih
            dahulu.
          </p>
          <Button
            onClick={handleCreatePage}
            disabled={isCreatingPage}
            size="lg"
            className="mt-4"
          >
            {isCreatingPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Page...
              </>
            ) : (
              <>Create "{pageTitle}" Page</>
            )}
          </Button>
          <p className="mt-2 text-xs text-gray-400">
            Setelah page dibuat, Anda bisa mulai menambahkan sections.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoadingPage || isLoadingSections) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-600">Loading {pageTitle}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold">{pageTitle}</h2>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <SectionsAccordion
          sections={(sectionsData || []) as Section[]}
          onSave={handleSaveSection}
          onUpdateName={handleUpdateName}
          onDelete={handleDeleteSection}
          onDuplicate={handleDuplicate}
          onToggleVisibility={handleToggleVisibility}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      </div>

      {/* Add Section Dialog */}
      <AddSectionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddSection}
        allowedTypes={allowedSectionTypes}
      />
    </div>
  );
}

// Helper function to get default content based on section type
function getDefaultContent(type: string): any {
  switch (type) {
    case 'hero':
      return {
        background_image: '',
        main_title: '<p>Your Title Here</p>',
        description: '<p>Your description here</p>',
      };
    case 'promo_grid':
      return {
        title: 'Our Promos',
        promos: [],
      };
    case 'steps':
      return {
        title: 'Cara Mudah Sewa Mobil',
        subtitle: 'Ikuti langkah-langkah berikut',
        steps: [],
      };
    case 'features':
      return {
        title: 'Keunggulan Kami',
        subtitle: 'Mengapa memilih kami?',
        features: [],
      };
    case 'testimonials':
      return {
        title: 'What Our Customers Say',
        testimonials: [],
      };
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        faqs: [],
      };
    case 'cta':
      return {
        title: 'Ready to get started?',
        description: 'Join us today',
        button_text: 'Get Started',
        button_url: '#',
      };
    case 'custom_html':
      return {
        html: '<div class="p-8 text-center">\n  <h2 class="text-3xl font-bold">Your Custom HTML</h2>\n  <p class="mt-4 text-gray-600">Supports Tailwind CSS!</p>\n</div>',
        css: '',
      };
    case 'why_choose_us':
      return {
        section_title: 'Why Transgo',
        main_title: 'Kenapa Harus Transgo Buat Sewa Mobil dan Motor?',
        description: 'Kami hadir dengan layanan sewa mobil dan motor di Jakarta yang cepat, mudah, dan pastinya terpercaya. Armada kami selalu terawat, harga transparan, dan pelayanannya profesional.',
        image: '',
        why_items: [
          {
            id: 'why-1',
            title: 'Bisa Sewa Kapan Aja',
            description: 'Kami menyediakan layanan sewa mobil dan motor Jakarta yang dapat diakses kapan saja, memberikan kemudahan bagi Anda yang memiliki jadwal fleksibel.'
          },
          {
            id: 'why-2',
            title: 'Tanpa DP atau Deposit',
            description: 'Tidak perlu khawatir dengan biaya tambahan di awal.'
          },
          {
            id: 'why-3',
            title: 'Unit Terlindungi & Gak Perlu Survey',
            description: 'Semua unit kami diasuransikan dan tidak memerlukan survei rumit.'
          },
          {
            id: 'why-4',
            title: 'Harga Mulai dari 40K per Hari',
            description: 'Harga terjangkau mulai dari 40 ribu per hari.'
          },
        ],
        client_section_title: 'Klien yang Udah Bareng Kami',
        client_section_description: 'Transgo dipercaya berbagai perusahaan dan brand untuk kebutuhan sewa kendaraan.',
        client_button_text: '+ 10.000 klien lainnya',
        client_button_link: '#',
        client_logos: [],
      };
    case 'media_mentions':
      return {
        title: 'Diliput di Berbagai Media',
        subtitle:
          'Transgo udah dipercaya banyak pengguna, dan juga pernah diliput oleh beberapa media keren berikut. Yuk, intip siapa aja yang udah bahas layanan sewa mobil & motor terdekat dari Transgo!',
        logos: [],
      };
    case 'footer':
      return {
        company_logo: null,
        copyright_text: '© 2025 - PT MARIFAH CIPTA BANGSA',
        powered_by_text: 'Powered by Transgo Sewa Mobil Motor Jakarta',
        social_links: [],
        support_links: [],
        locations_title: 'Kamu bisa sewa di lokasi mana aja?',
        locations: [],
        app_badges: [],
      };
    case 'order_must_read':
      return {
        title: 'Wajib Dibaca Sebelum Lanjut',
        subtitle:
          'Sebelum kamu booking, yuk luangin waktu sebentar buat baca info penting ini.',
        items: [
          {
            id: 'order-guideline-1',
            title: 'Peraturan Sebelum Melakukan Pemesanan Sewa Mobil dan Motor',
            content:
              '<p>Masukkan peraturan sewa kendaraan kamu di sini agar pelanggan memahami ketentuannya.</p>',
          },
          {
            id: 'order-guideline-2',
            title: 'Biaya Overtime',
            content:
              '<p>Jelaskan detail biaya overtime jika pelanggan mengembalikan kendaraan melebihi durasi sewa.</p>',
          },
          {
            id: 'order-guideline-3',
            title: 'Biaya Kerugian',
            content:
              '<p>Sertakan informasi mengenai tanggung jawab kerugian atau biaya penggantian.</p>',
          },
        ],
      };
    case 'order_delivery_policy':
      return {
        title: 'Ketentuan Antar–Jemput',
        subtitle:
          'Berikut ini biaya antar-jemput kendaraan per unit kalau dilakukan di luar jam operasional.',
        time_slots: [
          { id: 'slot-1', time_range: '06:30 – 21:00', additional_fee: 0 },
          { id: 'slot-2', time_range: '21:01 – 21:29', additional_fee: 20000 },
          { id: 'slot-3', time_range: '21:30 – 22:29', additional_fee: 40000 },
          { id: 'slot-4', time_range: '22:30 – 05:29', additional_fee: 50000 },
          { id: 'slot-5', time_range: '05:30 – 05:59', additional_fee: 40000 },
          { id: 'slot-6', time_range: '06:00 – 06:29', additional_fee: 20000 },
        ],
        notes: [
          'Diambil/dikembalikan ke pool Transgo di luar jam kerja akan dikenakan charge setengah dari biaya di atas.',
          'Mohon dikonfirmasi terlebih dahulu apakah kami bisa melayani di jam tersebut atau tidak.',
          'Serah terima unit di luar jam kerja akan dikenakan biaya tambahan sesuai ketentuan di atas.',
        ],
      };
    case 'order_payment_info':
      return {
        title: 'Pembayaran',
        subtitle: 'Kamu bisa melakukan pembayaran lewat metode resmi berikut ini:',
        methods: [
          {
            id: 'payment-1',
            bank_name: 'Paper',
            account_name: 'PT MARIFAH CIPTA BANGSA',
            account_number: '',
            icon_url: '',
          },
          {
            id: 'payment-2',
            bank_name: 'Mandiri',
            account_name: 'PT MARIFAH CIPTA BANGSA',
            account_number: '',
            icon_url: '',
          },
          {
            id: 'payment-3',
            bank_name: 'BCA',
            account_name: 'PT MARIFAH CIPTA BANGSA',
            account_number: '',
            icon_url: '',
          },
        ],
        disclaimer:
          'Jika transfer di luar metode pembayaran di atas, kami tidak bertanggung jawab atas kerugian yang dialami.',
      };
    case 'order_form_guide':
      return {
        title: 'Form Sewa Section',
        sections: [
          {
            id: 'form-guide-1',
            label: 'Lokasi Kendaraan',
            description:
              'Penjemputan dan pengantaran di luar kantor rental tersedia dengan biaya tambahan. Biaya tersebut tergantung pada jarak antara kantor rental dan lokasi yang Anda inginkan.',
          },
          {
            id: 'form-guide-2',
            label: 'Pemakaian',
            description:
              'Untuk ke luar kota akan dikenakan biaya tambahan harian. Jelaskan detail tarif tambahan sesuai area agar pelanggan memahami ketentuannya.',
          },
          {
            id: 'form-guide-3',
            label: 'Lokasi Pengambilan',
            description:
              'Pilih lokasi kendaraan bakal kamu ambil di hari pertama sewa, ya!',
          },
          {
            id: 'form-guide-4',
            label: 'Lokasi Pengembalian',
            description:
              'Pilih lokasi tempat kamu bakal balikin kendaraan di hari terakhir sewa, ya!',
          },
          {
            id: 'form-guide-5',
            label: 'Asuransi',
            description:
              'Pilih perlindungan yang paling pas biar perjalanan makin aman dan tenang, ya!',
          },
          {
            id: 'form-guide-6',
            label: 'Permintaan Khusus',
            description:
              'Tulis kebutuhan sewa kamu di sini, biar serasa pakai kendaraan sendiri!',
          },
        ],
      };
    default:
      return {};
  }
}
