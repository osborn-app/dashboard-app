'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface StepItem {
  id: string;
  number: number;
  title: string;
  description: string;
}

interface StepsFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    steps?: StepItem[];
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    steps: StepItem[];
  }) => void;
}

export default function StepsForm({
  initialData,
  onDataChange,
}: StepsFormProps) {
  const [title, setTitle] = useState(
    initialData?.title || 'Cara Mudah Sewa Mobil'
  );
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle || 'Ikuti langkah-langkah berikut'
  );
  const [steps, setSteps] = useState<StepItem[]>(initialData?.steps || []);

  useEffect(() => {
    onDataChange({ title, subtitle, steps });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, steps]);

  const handleAddStep = () => {
    const newStep: StepItem = {
      id: `step-${Date.now()}`,
      number: steps.length + 1,
      title: '',
      description: '',
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumbered = newSteps.map((step, i) => ({
      ...step,
      number: i + 1,
    }));
    setSteps(renumbered);
  };

  const handleStepChange = (
    index: number,
    field: keyof StepItem,
    value: string
  ) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="grid gap-2">
        <Label htmlFor="steps-title">Section Title</Label>
        <Input
          id="steps-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Cara Mudah Sewa Mobil"
        />
      </div>

      {/* Subtitle */}
      <div className="grid gap-2">
        <Label htmlFor="steps-subtitle">Subtitle</Label>
        <Input
          id="steps-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="e.g., Ikuti langkah-langkah berikut"
        />
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Steps</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddStep}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative rounded-lg border bg-gray-50 p-4"
            >
              <div className="flex items-start gap-3">
                {/* Number Badge */}
                <div className="flex flex-col items-center gap-2">
                  <GripVertical className="h-5 w-5 cursor-move text-gray-400" />
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {step.number}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Step title (e.g., Pilih Mobil)"
                    value={step.title}
                    onChange={(e) =>
                      handleStepChange(index, 'title', e.target.value)
                    }
                  />
                  <Textarea
                    placeholder="Step description..."
                    value={step.description}
                    onChange={(e) =>
                      handleStepChange(index, 'description', e.target.value)
                    }
                    rows={3}
                  />
                </div>

                {/* Delete Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleRemoveStep(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {steps.length === 0 && (
            <button
              type="button"
              onClick={handleAddStep}
              className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100"
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Add First Step</p>
              </div>
            </button>
          )}
        </div>

        {steps.length > 0 && (
          <p className="text-xs text-gray-500">Total: {steps.length} step(s)</p>
        )}
      </div>
    </div>
  );
}

