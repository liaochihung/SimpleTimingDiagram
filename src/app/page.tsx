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

const initialDiagrams: Diagram[] = [
  {
    id: "1",
    name: "Example: SPI",
    content: `SCK: p.n.p.n.p.n.p.n.p.n.p.n.p.n.p.n.
CS:  l.....h........................
MOSI: x.D7.D6.D5.D4.D3.D2.D1.D0.x........
MISO: x..z.....z..z..z..z..z..z..z.x...`,
    isSaved: true,
  },
  {
    id: "2",
    name: "Example: I2C",
    content: `SCL: h.p.n.p.n.p.n.p.n.p.n.p.n.p.n.p.n.h
SDA: h.SA6.SA5.SA4.SA3.SA2.SA1.SA0.A.D7.D6.h`,
    isSaved: true,
  },
];

const defaultDiagramContent = `// Welcome to WebJackTimer!
// See the symbol reference in the sidebar.
//
// Example:
SIGNAL_NAME: p.n.h.l.x|D|z`;

export default function Home() {
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
      content: ``,
      isSaved: false,
    });
  };

  const handleSaveDiagram = (name: string) => {
    const newDiagram = { ...activeDiagram, name, isSaved: true };
    const existingIndex = diagrams.findIndex((d) => d.id === newDiagram.id);

    if (existingIndex !== -1) {
      const updatedDiagrams = [...diagrams];
      updatedDiagrams[existingIndex] = newDiagram;
      setDiagrams(updatedDiagrams);
    } else {
      setDiagrams([...diagrams, newDiagram]);
    }
    setActiveDiagram(newDiagram);
  };
  
  const handleContentChange = (content: string) => {
    setActiveDiagram(prev => ({ ...prev, content, isSaved: false }));
  }

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
