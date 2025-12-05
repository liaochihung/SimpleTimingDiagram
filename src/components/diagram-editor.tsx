"use client";

import * as React from "react";
import { Diagram, DiagramConfig } from "@/lib/types";
import DiagramRenderer from "./diagram-renderer";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { getSymbolSuggestions, getTimingErrors } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";

interface DiagramEditorProps {
  diagram: Diagram;
  onContentChange: (content: string) => void;
  config: DiagramConfig;
}

export default function DiagramEditor({ diagram, onContentChange, config }: DiagramEditorProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [isCheckingErrors, setIsCheckingErrors] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (diagram.content) {
        handleSuggestSymbols();
      }
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [diagram.content]);
  
  const handleSuggestSymbols = async () => {
    setIsSuggesting(true);
    try {
      const result = await getSymbolSuggestions({
        currentDiagramContext: diagram.content,
        userInput: diagram.content.slice(-10),
      });
      setSuggestions(result.suggestedSymbols || []);
    } catch (error) {
      console.error("Error fetching symbol suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleCheckErrors = async () => {
    setIsCheckingErrors(true);
    try {
      const result = await getTimingErrors({ diagramDescription: diagram.content });
      if (result.isConsistent) {
        toast({
          title: "Analysis Complete",
          description: "No timing errors found.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Potential Errors Found",
          description: (
            <ul className="list-disc pl-5">
              {result.errors.map((error, i) => <li key={i}>{error}</li>)}
            </ul>
          ),
        });
      }
    } catch (error) {
      console.error("Error checking for timing errors:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not analyze the diagram.",
      });
    } finally {
      setIsCheckingErrors(false);
    }
  };
  
  const handleSuggestionClick = (symbol: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const { selectionStart, selectionEnd } = textarea;
      const newContent = 
        diagram.content.substring(0, selectionStart) +
        symbol +
        diagram.content.substring(selectionEnd);
      onContentChange(newContent);
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Editor</h3>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> AI Tools
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckErrors}
                disabled={isCheckingErrors}
              >
                {isCheckingErrors ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                Check for Errors
              </Button>
            </div>
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Symbol Suggestions</h4>
                {isSuggesting ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating suggestions...</span>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                    {suggestions.length > 0 ? (
                        suggestions.map((s, i) => (
                        <Button key={i} variant="outline" size="sm" onClick={() => handleSuggestionClick(s)}>
                            {s}
                        </Button>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">Type in the editor to get suggestions.</p>
                    )}
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1">
          <CardContent className="p-4 h-full">
            <ScrollArea className="h-full w-full">
                <DiagramRenderer content={diagram.content} config={config} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
