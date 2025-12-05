"use client";

import { Diagram, DiagramConfig } from "@/lib/types";
import {
  SidebarHeader,
  SidebarContent as SidebarContentArea,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "./ui/sidebar";
import { Logo } from "./icons";
import { Button } from "./ui/button";
import { FilePlus2, Settings, List } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface SidebarContentProps {
  diagrams: Diagram[];
  activeDiagramId: string;
  setActiveDiagram: (id: string) => void;
  newDiagram: () => void;
  config: DiagramConfig;
  setConfig: (config: DiagramConfig) => void;
}

const symbolReference = [
    { symbol: 'p', description: 'Positive edge clock' },
    { symbol: 'n', description: 'Negative edge clock' },
    { symbol: 'h', description: 'High signal' },
    { symbol: 'l', description: 'Low signal' },
    { symbol: '.', description: 'Continue state' },
    { symbol: 'x', description: 'Unknown state' },
    { symbol: 'D', description: 'Data block (e.g., D1)' },
    { symbol: 'z', description: 'High impedance' },
    { symbol: '-', description: 'Tristate' },
    { symbol: '~', description: 'Hi edge' },
    { symbol: '_', description: 'Lo edge' },
    { symbol: '/', description: 'Hi edge slow' },
    { symbol: '\\', description: 'Lo edge slow' },
    { symbol: '[', description: 'Data begin' },
    { symbol: ']', description: 'Data end' },
    { symbol: '*', description: 'Data cross over' },
    { symbol: '<', description: 'Data begin slow' },
    { symbol: '>', description: 'Data end slow' },
    { symbol: ':', description: 'Break' },
    { symbol: '|', description: 'Marker' },
]

export default function SidebarContent({
  diagrams,
  activeDiagramId,
  setActiveDiagram,
  newDiagram,
  config,
  setConfig,
}: SidebarContentProps) {
  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">WebJackTimer</span>
        </div>
      </SidebarHeader>

      <SidebarContentArea className="p-0">
        <SidebarGroup>
            <Button className="w-full" onClick={newDiagram}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                New Diagram
            </Button>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2"><List className="w-4 h-4" />Projects</SidebarGroupLabel>
          <SidebarMenu>
            {diagrams.map((diagram) => (
              <SidebarMenuItem key={diagram.id}>
                <SidebarMenuButton
                  isActive={diagram.id === activeDiagramId}
                  onClick={() => setActiveDiagram(diagram.id)}
                >
                  <span>{diagram.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContentArea>

      <SidebarFooter className="p-0 border-t">
        <Accordion type="multiple" className="w-full px-2" defaultValue={['symbols']}>
            <AccordionItem value="symbols">
                <AccordionTrigger>Symbol Reference</AccordionTrigger>
                <AccordionContent>
                    <ul className="space-y-2 text-sm text-muted-foreground px-2">
                        {symbolReference.map(item => (
                            <li key={item.symbol} className="flex justify-between">
                                <code className="font-code bg-muted px-1 rounded-sm">{item.symbol}</code>
                                <span>{item.description}</span>
                            </li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="settings">
                <AccordionTrigger className="flex items-center gap-2"><Settings className="w-4 h-4" />Customization</AccordionTrigger>
                <AccordionContent className="space-y-4 px-2">
                    <div className="space-y-2">
                        <Label htmlFor="signal-height">Signal Height: {config.signalHeight}px</Label>
                        <Slider 
                            id="signal-height"
                            min={20}
                            max={80}
                            step={2}
                            value={[config.signalHeight]}
                            onValueChange={([value]) => setConfig({...config, signalHeight: value})}
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </SidebarFooter>
    </>
  );
}
