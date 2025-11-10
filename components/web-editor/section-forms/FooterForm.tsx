'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MediaAssetPicker from '../MediaAssetPicker';
import { MediaAsset } from '@/hooks/api/useWebContent';
import { Plus, Trash2 } from 'lucide-react';

interface CompanyLogoState {
  asset_id?: number | null;
  file_url?: string;
  name?: string;
}

interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

interface SupportLink {
  id: string;
  label: string;
  url: string;
}

interface LocationItem {
  id: string;
  label: string;
  address: string;
}

interface AppBadge {
  id: string;
  label: string;
  image_url: string;
  url: string;
}

interface FooterFormProps {
  initialData?: {
    company_logo?: CompanyLogoState;
    copyright_text?: string;
    powered_by_text?: string;
    social_links?: SocialLink[];
    support_links?: SupportLink[];
    locations_title?: string;
    locations?: LocationItem[];
    app_badges?: AppBadge[];
  };
  onDataChange: (data: {
    company_logo?: CompanyLogoState;
    copyright_text: string;
    powered_by_text: string;
    social_links: SocialLink[];
    support_links: SupportLink[];
    locations_title: string;
    locations: LocationItem[];
    app_badges: AppBadge[];
  }) => void;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: generateId(),
    label: 'admin@transgo.id',
    url: 'mailto:admin@transgo.id',
    icon: 'mail',
  },
  {
    id: generateId(),
    label: '081389292879 / 085718495924',
    url: 'https://wa.me/6281389292879',
    icon: 'phone',
  },
  {
    id: generateId(),
    label: '@transgo.id / @transgo.motor / @toprentcar.id',
    url: 'https://instagram.com/transgo.id',
    icon: 'instagram',
  },
];

const DEFAULT_SUPPORT_LINKS: SupportLink[] = [
  { id: generateId(), label: 'Contact Us', url: '#' },
  { id: generateId(), label: 'Privacy Policy', url: '#' },
  { id: generateId(), label: 'Terms of Service', url: '#' },
];

const DEFAULT_LOCATIONS: LocationItem[] = [
  { id: generateId(), label: 'Jakarta Timur', address: 'Jl Jendral Ahmad Yani No 160c, Bypass Matraman' },
  { id: generateId(), label: 'Jakarta Barat', address: 'Rukita Nusa Indah Tanjung Duren, Belakang Apartemen Mediterania' },
  { id: generateId(), label: 'Jakarta Selatan', address: 'Hotel Kartika Chandra, Kuningan' },
  { id: generateId(), label: 'Jakarta Selatan', address: 'Gedung ILP Pancoran' },
  { id: generateId(), label: 'Bandara Soekarno Hatta', address: 'Pasar Rakyat Cengkareng' },
  { id: generateId(), label: 'Depok', address: 'Jl. Rajawali II, Beji, Kecamatan Beji' },
  { id: generateId(), label: 'Cikarang Utara', address: 'Jl. Jati Buni Asih' },
  { id: generateId(), label: 'Medan', address: 'Komplek Villa Karidah Indah, JL. Karya Darma Ujung No.C12' },
];

const DEFAULT_APP_BADGES: AppBadge[] = [
  {
    id: generateId(),
    label: 'Google Play',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg',
    url: '#',
  },
  {
    id: generateId(),
    label: 'App Store',
    image_url: 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg',
    url: '#',
  },
];

const DEFAULT_COPYRIGHT = '© 2025 - PT MARIFAH CIPTA BANGSA';
const DEFAULT_POWERED_BY = 'Powered by Transgo Sewa Mobil Motor Jakarta';
const DEFAULT_LOCATIONS_TITLE = 'Kamu bisa sewa di lokasi mana aja?';

export default function FooterForm({ initialData, onDataChange }: FooterFormProps) {
  const [companyLogo, setCompanyLogo] = useState<CompanyLogoState | undefined>(
    initialData?.company_logo,
  );
  const [copyrightText, setCopyrightText] = useState(
    initialData?.copyright_text || DEFAULT_COPYRIGHT,
  );
  const [poweredByText, setPoweredByText] = useState(
    initialData?.powered_by_text || DEFAULT_POWERED_BY,
  );
  const [locationsTitle, setLocationsTitle] = useState(
    initialData?.locations_title || DEFAULT_LOCATIONS_TITLE,
  );
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    initialData?.social_links && initialData.social_links.length > 0
      ? initialData.social_links
      : DEFAULT_SOCIAL_LINKS,
  );
  const [supportLinks, setSupportLinks] = useState<SupportLink[]>(
    initialData?.support_links && initialData.support_links.length > 0
      ? initialData.support_links
      : DEFAULT_SUPPORT_LINKS,
  );
  const [locations, setLocations] = useState<LocationItem[]>(
    initialData?.locations && initialData.locations.length > 0
      ? initialData.locations
      : DEFAULT_LOCATIONS,
  );
  const [appBadges, setAppBadges] = useState<AppBadge[]>(
    initialData?.app_badges && initialData.app_badges.length > 0
      ? initialData.app_badges
      : DEFAULT_APP_BADGES,
  );
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!initialData) return;

    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }

    setCompanyLogo(initialData?.company_logo);
    setCopyrightText(initialData?.copyright_text || DEFAULT_COPYRIGHT);
    setPoweredByText(initialData?.powered_by_text || DEFAULT_POWERED_BY);
    setLocationsTitle(initialData?.locations_title || DEFAULT_LOCATIONS_TITLE);
    setSocialLinks(
      initialData?.social_links && initialData.social_links.length > 0
        ? initialData.social_links
        : DEFAULT_SOCIAL_LINKS,
    );
    setSupportLinks(
      initialData?.support_links && initialData.support_links.length > 0
        ? initialData.support_links
        : DEFAULT_SUPPORT_LINKS,
    );
    setLocations(
      initialData?.locations && initialData.locations.length > 0
        ? initialData.locations
        : DEFAULT_LOCATIONS,
    );
    setAppBadges(
      initialData?.app_badges && initialData.app_badges.length > 0
        ? initialData.app_badges
        : DEFAULT_APP_BADGES,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  useEffect(() => {
    isSyncingRef.current = true;
    onDataChange({
      company_logo: companyLogo,
      copyright_text: copyrightText,
      powered_by_text: poweredByText,
      social_links: socialLinks,
      support_links: supportLinks,
      locations_title: locationsTitle,
      locations,
      app_badges: appBadges,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    companyLogo,
    copyrightText,
    poweredByText,
    socialLinks,
    supportLinks,
    locationsTitle,
    locations,
    appBadges,
  ]);

  const handleSelectLogo = (asset: MediaAsset) => {
    setCompanyLogo({
      asset_id: asset.id,
      file_url: asset.fileUrl,
      name: asset.name,
    });
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(undefined);
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [
      ...prev,
      { id: generateId(), label: '', url: '', icon: '' },
    ]);
  };

  const updateSocialLink = (id: string, updates: Partial<SocialLink>) => {
    setSocialLinks((prev) => prev.map((link) => (link.id === id ? { ...link, ...updates } : link)));
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const addSupportLink = () => {
    setSupportLinks((prev) => [...prev, { id: generateId(), label: '', url: '' }]);
  };

  const updateSupportLink = (id: string, updates: Partial<SupportLink>) => {
    setSupportLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, ...updates } : link)),
    );
  };

  const removeSupportLink = (id: string) => {
    setSupportLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const addLocation = () => {
    setLocations((prev) => [...prev, { id: generateId(), label: '', address: '' }]);
  };

  const updateLocation = (id: string, updates: Partial<LocationItem>) => {
    setLocations((prev) =>
      prev.map((location) => (location.id === id ? { ...location, ...updates } : location)),
    );
  };

  const removeLocation = (id: string) => {
    setLocations((prev) => prev.filter((location) => location.id !== id));
  };

  const addAppBadge = () => {
    setAppBadges((prev) => [...prev, { id: generateId(), label: '', image_url: '', url: '' }]);
  };

  const updateAppBadge = (id: string, updates: Partial<AppBadge>) => {
    setAppBadges((prev) =>
      prev.map((badge) => (badge.id === id ? { ...badge, ...updates } : badge)),
    );
  };

  const removeAppBadge = (id: string) => {
    setAppBadges((prev) => prev.filter((badge) => badge.id !== id));
  };

  const selectedLogoIds = useMemo(
    () => (companyLogo?.asset_id ? [companyLogo.asset_id] : []),
    [companyLogo?.asset_id],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Perusahaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Copyright</Label>
              <Input
                value={copyrightText}
                onChange={(event) => setCopyrightText(event.target.value)}
                placeholder="© 2025 - PT MARIFAH CIPTA BANGSA"
              />
            </div>
            <div className="space-y-2">
              <Label>Powered By</Label>
              <Input
                value={poweredByText}
                onChange={(event) => setPoweredByText(event.target.value)}
                placeholder="Powered by Transgo Sewa Mobil Motor Jakarta"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo Perusahaan</Label>
            {companyLogo?.file_url ? (
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-40 overflow-hidden rounded border bg-muted">
                  <Image
                    src={companyLogo.file_url}
                    alt={companyLogo.name || 'Company Logo'}
                    fill
                    className="object-contain"
                  />
                </div>
                <Button variant="outline" onClick={handleRemoveLogo}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Logo
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada logo yang dipilih. Pilih atau upload logo dari library di bawah.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <MediaAssetPicker
        selectedIds={selectedLogoIds}
        onAdd={handleSelectLogo}
        onRemove={handleRemoveLogo}
        multiple={false}
        type="company_logo"
        title="Library Logo Perusahaan"
        helperText="Logo yang dipilih akan digunakan pada footer."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sosial Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialLinks.map((link) => (
            <div key={link.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={link.label}
                  onChange={(event) => updateSocialLink(link.id, { label: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL</Label>
                <Input
                  value={link.url}
                  onChange={(event) => updateSocialLink(link.id, { url: event.target.value })}
                />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="w-full space-y-1">
                  <Label className="text-xs">Icon (opsional)</Label>
                  <Input
                    value={link.icon || ''}
                    onChange={(event) => updateSocialLink(link.id, { icon: event.target.value })}
                    placeholder="Contoh: mail, phone, instagram"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="self-start text-destructive hover:text-destructive"
                  onClick={() => removeSocialLink(link.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSocialLink} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Sosial Media
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Support Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {supportLinks.map((link) => (
            <div key={link.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={link.label}
                  onChange={(event) => updateSupportLink(link.id, { label: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL</Label>
                <Input
                  value={link.url}
                  onChange={(event) => updateSupportLink(link.id, { url: event.target.value })}
                />
              </div>
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeSupportLink(link.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSupportLink} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Link Support
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lokasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Judul Bagian Lokasi</Label>
            <Input
              value={locationsTitle}
              onChange={(event) => setLocationsTitle(event.target.value)}
            />
          </div>

          {locations.map((location) => (
            <div key={location.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Nama Lokasi</Label>
                <Input
                  value={location.label}
                  onChange={(event) => updateLocation(location.id, { label: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Alamat</Label>
                <Textarea
                  value={location.address}
                  onChange={(event) => updateLocation(location.id, { address: event.target.value })}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeLocation(location.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Lokasi
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addLocation} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Lokasi
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Badge Aplikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appBadges.map((badge) => (
            <div key={badge.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={badge.label}
                  onChange={(event) => updateAppBadge(badge.id, { label: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL Badge</Label>
                <Input
                  value={badge.url}
                  onChange={(event) => updateAppBadge(badge.id, { url: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Gambar (URL)</Label>
                <Input
                  value={badge.image_url}
                  onChange={(event) =>
                    updateAppBadge(badge.id, { image_url: event.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeAppBadge(badge.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Badge
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addAppBadge} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Badge
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

