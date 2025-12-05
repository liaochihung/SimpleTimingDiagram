"use client";

import { DiagramConfig, Signal } from "@/lib/types";
import { useMemo } from "react";

interface DiagramRendererProps {
  id?: string;
  content: string;
  config: DiagramConfig;
}

const SYMBOL_WIDTH = 20;
const NAME_WIDTH = 100;
const PADDING = 10;
const MARKER_HEIGHT = 15;


interface Marker {
  position: number;
  name: string;
}

const parseContent = (content: string): { signals: Signal[], markers: Marker[] } => {
  const lines = content
    .split("\n")
    .map((line) => line.trimEnd()) // Keep leading spaces for marker alignment
    .filter((line) => line && !line.startsWith("//"));
  
  const signals: Signal[] = [];
  let markers: Marker[] = [];

  const markerLine = lines.find(l => l.toUpperCase().startsWith("MARKER="));
  if (markerLine) {
    const markerContent = markerLine.substring(7);
    let nameRegex = /\|(\w*)/g;
    let match;
    while ((match = nameRegex.exec(markerContent)) !== null) {
        markers.push({ position: match.index, name: match[1] });
    }
  }

  const signalLines = lines.filter(l => !l.toUpperCase().startsWith("MARKER="));

  for (const line of signalLines) {
    const parts = line.split(":");
    const name = parts[0]?.trim() || "untitled";
    let wave = parts[1] || ""; // Don't trim start, it matters

    signals.push({ name, wave });
  }
  return { signals, markers };
};

export default function DiagramRenderer({ id, content, config }: DiagramRendererProps) {
  const { signals, markers } = useMemo(() => parseContent(content), [content]);
  
  if (signals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No diagram to display. Start typing in the editor.</p>
      </div>
    );
  }

  const maxWaveLength = Math.max(0, ...signals.map(s => s.wave.length));
  const totalWidth = NAME_WIDTH + (maxWaveLength * SYMBOL_WIDTH) + PADDING * 2;
  const totalHeight = signals.length * config.signalHeight + PADDING * 2 + MARKER_HEIGHT;

  const renderWave = (wave: string, yOffset: number) => {
    let path = "";
    let lastState: 'h' | 'l' | 'x' = 'x';
    const highY = yOffset + config.signalHeight * 0.2;
    const lowY = yOffset + config.signalHeight * 0.8;
    const midY = yOffset + config.signalHeight * 0.5;

    const elements: JSX.Element[] = [];

    for (let i = 0; i < wave.length; i++) {
      const char = wave[i];
      const x = NAME_WIDTH + i * SYMBOL_WIDTH;

      const drawLine = (y: number) => `L ${x + SYMBOL_WIDTH} ${y}`;
      
      switch (char) {
        case '~':
          path += lastState !== 'h' ? `M ${x} ${lowY} L ${x} ${highY} ` : `M ${x} ${highY} `;
          path += drawLine(highY);
          lastState = 'h';
          break;
        case '_':
          path += lastState !== 'l' ? `M ${x} ${highY} L ${x} ${lowY} ` : `M ${x} ${lowY} `;
          path += drawLine(lowY);
          lastState = 'l';
          break;
        case '/':
          path += `M ${x} ${lowY} L ${x + SYMBOL_WIDTH} ${highY} `;
          lastState = 'h';
          break;
        case '\\':
          path += `M ${x} ${highY} L ${x + SYMBOL_WIDTH} ${lowY} `;
          lastState = 'l';
          break;
        case 'h': // Legacy support
          path += lastState === 'l' ? `L ${x} ${lowY} L ${x} ${highY} ` : `M ${x} ${highY} `;
          path += drawLine(highY);
          lastState = 'h';
          break;
        case 'l': // Legacy support
          path += lastState === 'h' ? `L ${x} ${highY} L ${x} ${lowY} ` : `M ${x} ${lowY} `;
          path += drawLine(lowY);
          lastState = 'l';
          break;
        case 'p': // Legacy posedge
          path += `M ${x} ${lowY} L ${x + SYMBOL_WIDTH / 2} ${lowY} L ${x + SYMBOL_WIDTH / 2} ${highY} L ${x + SYMBOL_WIDTH} ${highY}`;
          lastState = 'h';
          break;
        case 'n': // Legacy negedge
          path += `M ${x} ${highY} L ${x + SYMBOL_WIDTH / 2} ${highY} L ${x + SYMBOL_WIDTH / 2} ${lowY} L ${x + SYMBOL_WIDTH} ${lowY}`;
          lastState = 'l';
          break;
        case 'x':
           elements.push(
            <path key={`x-${i}`} d={`M ${x} ${highY} L ${x+SYMBOL_WIDTH} ${highY} M ${x} ${lowY} L ${x+SYMBOL_WIDTH} ${lowY}`} stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="4 2" />
          );
          lastState = 'x';
          break;
        case '.':
           if (lastState === 'h') path += drawLine(highY);
           if (lastState === 'l') path += drawLine(lowY);
           if (lastState === 'x')  elements.push(
            <path key={`x-.${i}`} d={`M ${x} ${highY} L ${x+SYMBOL_WIDTH} ${highY} M ${x} ${lowY} L ${x+SYMBOL_WIDTH} ${lowY}`} stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="4 2" />
          );
          break;
        case '-':
            path += `M ${x + SYMBOL_WIDTH * 0.1} ${midY} ` + drawLine(midY);
            lastState = 'x';
            break;
        case ':': // Break
             elements.push(
                 <path key={`break-${i}`} d={`M ${x + SYMBOL_WIDTH*0.3} ${highY - 5} L ${x + SYMBOL_WIDTH*0.7} ${lowY + 5} M ${x + SYMBOL_WIDTH*0.7} ${highY - 5} L ${x + SYMBOL_WIDTH*0.3} ${lowY + 5}`} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
             );
            lastState = 'x';
            break;
        case '*': // Data cross over
             elements.push(
                <path key={`crossover-${i}`} d={`M ${x} ${highY} L ${x+SYMBOL_WIDTH} ${lowY} M ${x} ${lowY} L ${x+SYMBOL_WIDTH} ${highY}`} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
             );
            lastState = 'x';
            break;
        case '[':
            elements.push(
                <path key={`d-begin-${i}`} d={`M ${x} ${highY} L ${x + SYMBOL_WIDTH / 2} ${highY} L ${x + SYMBOL_WIDTH} ${midY} L ${x + SYMBOL_WIDTH / 2} ${lowY} L ${x} ${lowY} Z`} stroke="hsl(var(--primary))" strokeWidth="2" fill="hsl(var(--background))" />
            );
            path += `M ${x} ${lowY} L ${x+SYMBOL_WIDTH} ${lowY} M ${x} ${highY} L ${x+SYMBOL_WIDTH} ${highY}`;
            lastState = 'x';
            break;
        case ']':
            elements.push(
                <path key={`d-end-${i}`} d={`M ${x + SYMBOL_WIDTH} ${highY} L ${x + SYMBOL_WIDTH / 2} ${highY} L ${x} ${midY} L ${x + SYMBOL_WIDTH/2} ${lowY} L ${x+SYMBOL_WIDTH} ${lowY} Z`} stroke="hsl(var(--primary))" strokeWidth="2" fill="hsl(var(--background))" />
            );
            path += `M ${x} ${lowY} L ${x+SYMBOL_WIDTH} ${lowY} M ${x} ${highY} L ${x+SYMBOL_WIDTH} ${highY}`;
            lastState = 'x';
            break;

        default: // Data or space
            if (char.trim() === '') { // Treat space as a continuation
                if (lastState === 'h') path += drawLine(highY);
                if (lastState === 'l') path += drawLine(lowY);
                if (lastState === 'x')  elements.push(
                    <path key={`x-space-${i}`} d={`M ${x} ${highY} L ${x+SYMBOL_WIDTH} ${highY} M ${x} ${lowY} L ${x+SYMBOL_WIDTH} ${lowY}`} stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="4 2" />
                );
                break;
            }

            elements.push(
                <rect key={`d-`+i} x={x} y={yOffset + config.signalHeight * 0.1} width={SYMBOL_WIDTH} height={config.signalHeight * 0.8} fill="hsl(var(--secondary))" rx="2" />
            );
            elements.push(
                 <text key={`t-`+i} x={x+SYMBOL_WIDTH/2} y={midY + 5} textAnchor="middle" fontSize="12" fill="hsl(var(--secondary-foreground))">{char}</text>
            );
            path += `M ${x} ${lowY} L ${x+SYMBOL_WIDTH} ${lowY} M ${x} ${highY} L ${x+SYMBOL_WIDTH} ${highY}`;
            lastState = 'x';
      }
    }
    elements.unshift(<path key="wave-path" d={path} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />);
    return elements;
  };

  return (
    <svg id={id} width={totalWidth} height={totalHeight} className="font-sans" aria-label="Timing Diagram"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" fill="hsl(var(--background))" />
      
      {/* Markers */}
      <g transform={`translate(${PADDING}, ${PADDING})`}>
        {markers.map((marker, index) => {
            const markerX = NAME_WIDTH + marker.position * SYMBOL_WIDTH + SYMBOL_WIDTH / 2;
            return (
                <g key={`marker-group-${index}`}>
                    <line 
                        key={`marker-line-${index}`} 
                        x1={markerX} 
                        y1={0} 
                        x2={markerX} 
                        y2={totalHeight} 
                        stroke="hsl(var(--border))" 
                        strokeDasharray="4 4" />
                    <text 
                        key={`marker-text-${index}`} 
                        x={markerX} 
                        y={MARKER_HEIGHT - 2} 
                        textAnchor="middle" 
                        fontSize="12" 
                        fill="hsl(var(--muted-foreground))"
                    >
                        {marker.name}
                    </text>
                </g>
            )
        })}
      </g>
      
      {signals.map((signal, index) => {
        const y = index * config.signalHeight + PADDING + MARKER_HEIGHT;
        return (
          <g key={signal.name + index} transform={`translate(${PADDING}, ${y})`}>
            <text x="0" y={config.signalHeight / 2 + 5} fill="hsl(var(--foreground))" fontSize="14" fontWeight="500">
              {signal.name}
            </text>
            {renderWave(signal.wave, 0)}
          </g>
        );
      })}
    </svg>
  );
}
