'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    faqs?: FaqItem[];
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    faqs: FaqItem[];
  }) => void;
}

export default function FaqForm({ initialData, onDataChange }: FaqFormProps) {
  const [title, setTitle] = useState(
    initialData?.title || 'Frequently Asked Questions'
  );
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle || 'Pertanyaan yang sering diajukan'
  );
  const [faqs, setFaqs] = useState<FaqItem[]>(initialData?.faqs || []);

  useEffect(() => {
    onDataChange({ title, subtitle, faqs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, faqs]);

  const handleAddFaq = () => {
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
    };
    setFaqs([...faqs, newFaq]);
  };

  const handleRemoveFaq = (index: number) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
  };

  const handleFaqChange = (
    index: number,
    field: keyof FaqItem,
    value: string
  ) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="grid gap-2">
        <Label htmlFor="faq-title">Section Title</Label>
        <Input
          id="faq-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Frequently Asked Questions"
        />
      </div>

      {/* Subtitle */}
      <div className="grid gap-2">
        <Label htmlFor="faq-subtitle">Subtitle</Label>
        <Input
          id="faq-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="e.g., Pertanyaan yang sering diajukan"
        />
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Questions & Answers</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddFaq}>
            <Plus className="mr-2 h-4 w-4" />
            Add FAQ
          </Button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="relative rounded-lg border bg-gray-50 p-4"
            >
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => handleRemoveFaq(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              <div className="space-y-3">
                {/* Question */}
                <div className="grid gap-2">
                  <Label className="text-xs">Question {index + 1}</Label>
                  <Input
                    placeholder="e.g., Berapa lama proses rental?"
                    value={faq.question}
                    onChange={(e) =>
                      handleFaqChange(index, 'question', e.target.value)
                    }
                  />
                </div>

                {/* Answer */}
                <div className="grid gap-2">
                  <Label className="text-xs">Answer</Label>
                  <Textarea
                    placeholder="Answer to the question..."
                    value={faq.answer}
                    onChange={(e) =>
                      handleFaqChange(index, 'answer', e.target.value)
                    }
                    rows={4}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {faqs.length === 0 && (
            <button
              type="button"
              onClick={handleAddFaq}
              className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100"
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Add First FAQ</p>
              </div>
            </button>
          )}
        </div>

        {faqs.length > 0 && (
          <p className="text-xs text-gray-500">Total: {faqs.length} FAQ(s)</p>
        )}
      </div>
    </div>
  );
}

