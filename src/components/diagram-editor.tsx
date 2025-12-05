"use client";

import * as React from "react";
import { Diagram, DiagramConfig } from "@/lib/types";
import DiagramRenderer from "./diagram-renderer";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, ClipboardPaste } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";

interface DiagramEditorProps {
  diagram: Diagram;
  onContentChange: (content: string) => void;
  config: DiagramConfig;
}

export default function DiagramEditor({
  diagram,
  onContentChange,
  config,
}: DiagramEditorProps) {
  const { toast } = useToast();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagram.content);
      toast({ title: "Copied to clipboard" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
      });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onContentChange(text);
      toast({ title: "Pasted from clipboard" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to paste",
        description: "Could not read content from clipboard.",
      });
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Editor</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handlePaste}>
                  <ClipboardPaste className="h-4 w-4" />
                  <span className="sr-only">Paste</span>
                </Button>
              </div>
            </div>
            <Textarea
              ref={textareaRef}
              value={diagram.content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Enter diagram source here..."
              className="flex-1 w-full font-code text-sm resize-none"
              aria-label="Diagram Editor"
            />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1">
          <CardContent className="p-4 h-full">
            <ScrollArea className="h-full w-full">
              <DiagramRenderer
                id="diagram-to-export"
                content={diagram.content}
                config={config}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
