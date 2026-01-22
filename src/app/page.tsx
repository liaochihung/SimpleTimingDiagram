"use client";

import * as React from "react";
import { Diagram, DiagramConfig } from "@/lib/types";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import SidebarContent from "@/components/sidebar-content";
import AppHeader from "@/components/header";
import DiagramEditor from "@/components/diagram-editor";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

const initialDiagrams: Diagram[] = [
  {
    id: "1",
    name: "Example: SPI",
    content: `// Markers can be placed on the first line
Marker=|a     |b     |c
SCK:   ~_~_~_~_~_~_~_
MOSI:  x[10110101]x
MISO:  x[01101010]x`,
    isSaved: true,
  },
  {
    id: "2",
    name: "Example: I2C",
    content: `Marker= |START |A6    |A5    |A4    |A3    |A2    |A1    |A0    |ACK   |D7    |D6    |STOP
SCL:    ~____/~~____/~~____/~~____/~~____/~~____/~~____/~~____/~~____/~~____/~~____/~~__
SDA:    ~~___/SADR6/SADR5/SADR4/SADR3/SADR2/SADR1/SADR0/ACK__/DATA7/DATA6/____~~`,
    isSaved: true,
  },
];

const defaultDiagramContent = `// Welcome to Simple Timing Diagram!
// Markers go on the first line: Marker= |a |b
// Then add your signals line-by-line.
`;

export default function Home() {
  const { toast } = useToast();
  const [diagrams, setDiagrams] = React.useState<Diagram[]>(initialDiagrams);
  const [activeDiagram, setActiveDiagram] = React.useState<Diagram>({
    id: uuidv4(),
    name: "Untitled Diagram",
    content: defaultDiagramContent,
    isSaved: false,
  });
  const [config, setConfig] = React.useState<DiagramConfig>({
    signalHeight: 40,
    spacing: 15,
  });

  const handleSetActiveDiagram = (diagramId: string) => {
    const diagram = diagrams.find((d) => d.id === diagramId);
    if (diagram) {
      setActiveDiagram({ ...diagram });
    }
  };

  const handleNewDiagram = () => {
    setActiveDiagram({
      id: uuidv4(),
      name: "Untitled Diagram",
      content: defaultDiagramContent,
      isSaved: false,
    });
  };

  const handleSaveDiagram = (name: string) => {
    const newDiagram = { ...activeDiagram, name, isSaved: true };
    const existingIndex = diagrams.findIndex((d) => d.id === newDiagram.id);

    if (existingIndex === -1) {
      setDiagrams([...diagrams, newDiagram]);
    } else {
      const updatedDiagrams = [...diagrams];
      updatedDiagrams[existingIndex] = newDiagram;
      setDiagrams(updatedDiagrams);
    }
    setActiveDiagram(newDiagram);
    toast({ title: "Diagram Saved", description: `"${name}" has been saved.` });
  };

  const handleContentChange = (content: string) => {
    setActiveDiagram((prev) => ({ ...prev, content, isSaved: false }));
  };

  const handleExport = (format: "svg" | "png") => {
    const svgElement = document.getElementById("diagram-to-export");
    if (!svgElement) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not find the diagram to export.",
      });
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;

    if (format === "svg") {
      downloadLink.download = `${activeDiagram.name}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(url);
      toast({ title: "SVG Exported" });
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");
        downloadLink.href = pngUrl;
        downloadLink.download = `${activeDiagram.name}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(pngUrl);
        toast({ title: "PNG Exported" });
      };
      img.src = url;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent
          diagrams={diagrams}
          activeDiagramId={activeDiagram.id}
          setActiveDiagram={handleSetActiveDiagram}
          newDiagram={handleNewDiagram}
          config={config}
          setConfig={setConfig}
        />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader
          activeDiagram={activeDiagram}
          onSave={handleSaveDiagram}
          onExport={handleExport}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DiagramEditor
            diagram={activeDiagram}
            onContentChange={handleContentChange}
            config={config}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
