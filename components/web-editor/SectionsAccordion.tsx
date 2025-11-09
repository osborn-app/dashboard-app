'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import dynamic from 'next/dynamic';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Save,
  Loader2,
  Target,
  Grid3x3,
  List,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Megaphone,
  Code,
  CheckCircle2,
  Edit2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
const LoadingFallback = () => (
  <div className="flex items-center justify-center rounded border border-dashed border-gray-200 bg-white/50 p-6 text-sm text-gray-500">
    Loading editor...
  </div>
);

const HeroSectionForm = dynamic(() => import('./section-forms/HeroSectionForm'), {
  ssr: false,
  loading: LoadingFallback,
});
const PromoGridForm = dynamic(() => import('./section-forms/PromoGridForm'), {
  ssr: false,
  loading: LoadingFallback,
});
const StepsForm = dynamic(() => import('./section-forms/StepsForm'), {
  ssr: false,
  loading: LoadingFallback,
});
const FeaturesForm = dynamic(() => import('./section-forms/FeaturesForm'), {
  ssr: false,
  loading: LoadingFallback,
});
const TestimonialsForm = dynamic(() => import('./section-forms/TestimonialsForm'), {
  ssr: false,
  loading: LoadingFallback,
});
const FaqForm = dynamic(() => import('./section-forms/FaqForm'), {
  ssr: false,
  loading: LoadingFallback,
});
const CtaForm = dynamic(() => import('./section-forms/CtaForm'), {
  ssr: false,
  loading: LoadingFallback,
});
const CustomHtmlForm = dynamic(() => import('./section-forms/CustomHtmlForm'), {
  ssr: false,
  loading: LoadingFallback,
});
const WhyChooseUsForm = dynamic(() => import('./section-forms/WhyChooseUsForm'), {
  ssr: false,
  loading: LoadingFallback,
});

interface Section {
  id: number;
  type: string;
  name: string;
  content: any;
  order: number;
  is_visible: boolean;
}

interface SectionsAccordionProps {
  sections: Section[];
  onSave: (sectionId: number, content: any) => Promise<void>;
  onUpdateName: (sectionId: number, name: string) => Promise<void>;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onToggleVisibility: (id: number) => void;
  onMoveUp: (section: Section) => void;
  onMoveDown: (section: Section) => void;
}

export default function SectionsAccordion({
  sections,
  onSave,
  onUpdateName,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
}: SectionsAccordionProps) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const [savingSection, setSavingSection] = useState<number | null>(null);
  const [sectionData, setSectionData] = useState<{ [key: number]: any }>({});
  const [editingName, setEditingName] = useState<number | null>(null);
  const [sectionNames, setSectionNames] = useState<{ [key: number]: string }>({});
  const [renderedSections, setRenderedSections] = useState<Set<number>>(new Set());

  const ensureRendered = (id: number) => {
    setRenderedSections((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const toggleSection = (id: number) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
      ensureRendered(id);
    }
    setOpenSections(newOpen);
  };

  // Ensure we clean up rendered sections if the list changes
  React.useEffect(() => {
    const currentIds = new Set(sections.map((section) => section.id));
    setRenderedSections((prev) => {
      const next = new Set<number>();
      prev.forEach((id) => {
        if (currentIds.has(id)) {
          next.add(id);
        }
      });
      return next;
    });

    // Auto-render the first section to reduce initial wait when user opens it
    if (sections.length > 0) {
      ensureRendered(sections[0].id);
    }
  }, [sections]);

  const handleSave = async (sectionId: number) => {
    const data = sectionData[sectionId];
    if (!data) return;

    setSavingSection(sectionId);
    try {
      await onSave(sectionId, data);
    } finally {
      setSavingSection(null);
    }
  };

  const handleDataChange = (sectionId: number, data: any) => {
    setSectionData((prev) => ({ ...prev, [sectionId]: data }));
  };

  const getSectionIcon = (type: string) => {
    const iconProps = { className: 'h-5 w-5' };
    
    switch (type) {
      case 'hero':
        return <Target {...iconProps} />;
      case 'promo_grid':
        return <Grid3x3 {...iconProps} />;
      case 'steps':
        return <List {...iconProps} />;
      case 'features':
        return <Sparkles {...iconProps} />;
      case 'testimonials':
        return <MessageSquare {...iconProps} />;
      case 'faq':
        return <HelpCircle {...iconProps} />;
      case 'cta':
        return <Megaphone {...iconProps} />;
      case 'custom_html':
        return <Code {...iconProps} />;
      case 'why_choose_us':
        return <CheckCircle2 {...iconProps} />;
      default:
        return <Code {...iconProps} />;
    }
  };

  const renderForm = (section: Section) => {
    const initialData = sectionData[section.id] || section.content;

    switch (section.type) {
      case 'hero':
        return (
          <HeroSectionForm
            initialData={initialData}
            onDataChange={(data) => handleDataChange(section.id, data)}
          />
        );
      case 'promo_grid':
        return (
          <PromoGridForm
            initialData={initialData}
            onDataChange={(data) => handleDataChange(section.id, data)}
          />
        );
      case 'steps':
        return (
          <StepsForm
            initialData={initialData}
            onDataChange={(data) => handleDataChange(section.id, data)}
          />
        );
      case 'features':
        return (
          <FeaturesForm
            initialData={initialData}
            onDataChange={(data) => handleDataChange(section.id, data)}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsForm
            initialData={initialData}
            onDataChange={(data) => handleDataChange(section.id, data)}
          />
        );
      case 'faq':
        return (
          <FaqForm
            initialData={initialData}
            onDataChange={(data) => handleDataChange(section.id, data)}
          />
        );
      case 'cta':
        return (
          <CtaForm
            initialData={initialData}
            onDataChange={(data) => handleDataChange(section.id, data)}
          />
        );
      case 'custom_html':
        return (
          <CustomHtmlForm
            initialData={initialData}
            onDataChange={(data) => handleDataChange(section.id, data)}
          />
        );
      case 'why_choose_us':
        return (
          <WhyChooseUsForm
            initialData={initialData}
            onDataChange={(data) => handleDataChange(section.id, data)}
          />
        );
      default:
        return <div className="text-gray-500">Unknown section type: {section.type}</div>;
    }
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed bg-gray-50 p-12 text-center">
        <p className="text-gray-500">
          Belum ada sections. Klik "Add Section" untuk menambahkan.
        </p>
      </div>
    );
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {sortedSections.map((section, index) => {
        const isOpen = openSections.has(section.id);
        const isSaving = savingSection === section.id;
        const shouldRenderContent =
          renderedSections.has(section.id) || isOpen;

        return (
          <Collapsible
            key={section.id}
            open={isOpen}
            onOpenChange={() => toggleSection(section.id)}
          >
            <div
              className={`rounded-lg border bg-white transition-all ${
                !section.is_visible ? 'opacity-60' : ''
              }`}
            >
              {/* Header */}
              <CollapsibleTrigger asChild>
                <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-primary">{getSectionIcon(section.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {editingName === section.id ? (
                          <Input
                            value={sectionNames[section.id] || section.name}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSectionNames((prev) => ({
                                ...prev,
                                [section.id]: e.target.value,
                              }));
                            }}
                            onBlur={async () => {
                              if (sectionNames[section.id] && sectionNames[section.id] !== section.name) {
                                await onUpdateName(section.id, sectionNames[section.id]);
                              }
                              setEditingName(null);
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                              if (e.key === 'Escape') {
                                setSectionNames((prev) => {
                                  const newNames = { ...prev };
                                  delete newNames[section.id];
                                  return newNames;
                                });
                                setEditingName(null);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 font-semibold"
                            autoFocus
                          />
                        ) : (
                          <>
                            <h3 className="font-semibold">{section.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSectionNames((prev) => ({
                                  ...prev,
                                  [section.id]: section.name,
                                }));
                                setEditingName(section.id);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {section.type}
                        </Badge>
                        <Badge
                          variant={section.is_visible ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {section.is_visible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(section);
                      }}
                      disabled={index === 0}
                      title="Move Up"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>

                    {/* Move Down */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(section);
                      }}
                      disabled={index === sortedSections.length - 1}
                      title="Move Down"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>

                    {/* Toggle Visibility */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(section.id);
                      }}
                      title={section.is_visible ? 'Hide' : 'Show'}
                    >
                      {section.is_visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Duplicate */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(section.id);
                      }}
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(section.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Expand/Collapse */}
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* Content */}
              <CollapsibleContent>
                {shouldRenderContent ? (
                  <div className="border-t bg-gray-50 p-6">
                    {renderForm(section)}

                    {/* Save Button */}
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => handleSave(section.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Section
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t bg-gray-50 p-6">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}

