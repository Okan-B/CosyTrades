"use client";

import { PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";

interface JournalEditorProps {
  initialContent?: PartialBlock[];
  onSave?: (content: PartialBlock[]) => void;
}

export function JournalEditor({ initialContent, onSave }: JournalEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: initialContent,
  });

  const handleChange = () => {
    if (onSave) {
      onSave(editor.document);
    }
  };

  return (
    <div className="min-h-[500px] border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
      <BlockNoteView 
        editor={editor} 
        onChange={handleChange}
        className="min-h-[500px] p-4"
      />
    </div>
  );
}

