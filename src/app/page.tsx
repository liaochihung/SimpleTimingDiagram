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
    name: "Example: t1, t2, t3",
    content: `// Markers can be placed on the first line
Marker= |a  b     |c
t1:     _~~__~~__//_~~_
t2:     x*0*1*..2..*3*x
t3:     x[0][1]..[2].[3]x`,
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

const defaultDiagramContent = `// Welcome to WebJackTimer!
// Markers go on the first line: Marker= |a |b
// Then add your signals line-by-line.
// Use the symbol reference in the sidebar.
`;

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
      content: defaultDiagramContent,
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
