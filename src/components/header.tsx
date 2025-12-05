"use client";

import * as React from "react";
import { useState } from "react";
import { Diagram } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SidebarTrigger } from "./ui/sidebar";
import { Save, FileWarning } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Label } from "./ui/label";

interface AppHeaderProps {
  activeDiagram: Diagram;
  onSave: (name: string) => void;
}

export default function AppHeader({ activeDiagram, onSave }: AppHeaderProps) {
  const [diagramName, setDiagramName] = useState(activeDiagram.name);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave(diagramName);
    setOpen(false);
  };
  
  React.useEffect(() => {
    setDiagramName(activeDiagram.name);
  }, [activeDiagram.name]);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          {activeDiagram.name}
        </h1>
        {!activeDiagram.isSaved && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileWarning className="w-3 h-3" />
            <span>Unsaved changes</span>
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Diagram</DialogTitle>
            <DialogDescription>
              Give your diagram a name. You can access it later from the projects list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={diagramName}
                onChange={(e) => setDiagramName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
