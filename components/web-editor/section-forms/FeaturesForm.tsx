'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface FeaturesFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    features?: FeatureItem[];
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    features: FeatureItem[];
  }) => void;
}

export default function FeaturesForm({
  initialData,
  onDataChange,
}: FeaturesFormProps) {
  const [title, setTitle] = useState(
    initialData?.title || 'Keunggulan Kami'
  );
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle || 'Mengapa memilih kami?'
  );
  const [features, setFeatures] = useState<FeatureItem[]>(
    initialData?.features || []
  );

  useEffect(() => {
    onDataChange({ title, subtitle, features });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, features]);

  const handleAddFeature = () => {
    const newFeature: FeatureItem = {
      id: `feature-${Date.now()}`,
      icon: '✨',
      title: '',
      description: '',
    };
    setFeatures([...features, newFeature]);
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  const handleFeatureChange = (
    index: number,
    field: keyof FeatureItem,
    value: string
  ) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeatures(newFeatures);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="grid gap-2">
        <Label htmlFor="features-title">Section Title</Label>
        <Input
          id="features-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Keunggulan Kami"
        />
      </div>

      {/* Subtitle */}
      <div className="grid gap-2">
        <Label htmlFor="features-subtitle">Subtitle</Label>
        <Input
          id="features-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="e.g., Mengapa memilih kami?"
        />
      </div>

      {/* Features List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Features</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFeature}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Feature
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="relative rounded-lg border bg-gray-50 p-4"
            >
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => handleRemoveFeature(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              <div className="space-y-3">
                {/* Icon (Emoji) */}
                <div className="grid gap-2">
                  <Label className="text-xs">Icon (Emoji)</Label>
                  <Input
                    placeholder="e.g., ✨ 🚗 💰 ⚡"
                    value={feature.icon}
                    onChange={(e) =>
                      handleFeatureChange(index, 'icon', e.target.value)
                    }
                    className="h-8 text-xl"
                    maxLength={2}
                  />
                </div>

                {/* Title */}
                <div className="grid gap-2">
                  <Label className="text-xs">Title</Label>
                  <Input
                    placeholder="Feature title"
                    value={feature.title}
                    onChange={(e) =>
                      handleFeatureChange(index, 'title', e.target.value)
                    }
                    className="h-8"
                  />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="Feature description..."
                    value={feature.description}
                    onChange={(e) =>
                      handleFeatureChange(index, 'description', e.target.value)
                    }
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {features.length === 0 && (
            <button
              type="button"
              onClick={handleAddFeature}
              className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100 md:col-span-2"
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Add First Feature</p>
              </div>
            </button>
          )}
        </div>

        {features.length > 0 && (
          <p className="text-xs text-gray-500">
            Total: {features.length} feature(s)
          </p>
        )}
      </div>
    </div>
  );
}

