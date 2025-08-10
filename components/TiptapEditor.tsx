'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'

export default function TiptapEditor() {
  const editor = useEditor({
    extensions: [StarterKit, TaskList, TaskItem, Image],
    content: '<p>Hello Tiptap!</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
    immediatelyRender: false,
  })

  return (
    <div className="border rounded p-4">
      <EditorContent editor={editor} />
    </div>
  )
}
