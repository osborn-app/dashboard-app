'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Eye, Code } from 'lucide-react';

interface CustomHtmlFormProps {
  initialData?: {
    html?: string;
    css?: string;
  };
  onDataChange: (data: { html: string; css: string }) => void;
}

export default function CustomHtmlForm({
  initialData,
  onDataChange,
}: CustomHtmlFormProps) {
  const [html, setHtml] = useState(
    initialData?.html || '<div class="custom-section">\n  <h2>Custom Content</h2>\n  <p>Your custom HTML here...</p>\n</div>'
  );
  const [css, setCss] = useState(
    initialData?.css || '.custom-section {\n  padding: 2rem;\n  text-align: center;\n}'
  );
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    onDataChange({ html, css });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, css]);

  return (
    <div className="space-y-6">
      {/* HTML Editor */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="custom-html">HTML Code</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <Code className="mr-2 h-4 w-4" />
                Code
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>
        <Textarea
          id="custom-html"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder="<div>Your HTML here...</div>"
          rows={12}
          className="font-mono text-sm"
        />
      </div>

      {/* CSS Editor */}
      <div className="grid gap-2">
        <Label htmlFor="custom-css">CSS Code (Optional)</Label>
        <Textarea
          id="custom-css"
          value={css}
          onChange={(e) => setCss(e.target.value)}
          placeholder=".your-class { color: red; }"
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="rounded-lg border bg-white p-4">
          <Label className="mb-2 block text-sm font-medium">Preview:</Label>
          <div className="rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-4">
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <p className="mt-2 text-xs text-amber-600">
            ⚠️ Preview may not match exactly with frontend styles
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm">
        <p className="font-medium text-blue-900">💡 Tips:</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-blue-800">
          <li>✅ <strong>Tailwind CSS is supported!</strong> Use utility classes like <code className="bg-blue-100 px-1">bg-blue-500 text-white p-4</code></li>
          <li>Use semantic HTML5 elements</li>
          <li>Combine Tailwind utilities with custom CSS if needed</li>
          <li>Test your HTML in preview mode</li>
          <li>Be careful with <code className="bg-blue-100 px-1">&lt;script&gt;</code> tags</li>
        </ul>
      </div>
    </div>
  );
}

