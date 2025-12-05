"use client";

import { DiagramConfig, Signal } from "@/lib/types";
import { useMemo } from "react";

interface DiagramRendererProps {
  content: string;
  config: DiagramConfig;
}

const SYMBOL_WIDTH = 20;
const NAME_WIDTH = 100;
const PADDING = 10;

const parseContent = (content: string): Signal[] => {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"));
  
  const signals: Signal[] = [];
  for (const line of lines) {
    const parts = line.split(":");
    const name = parts[0]?.trim() || "untitled";
    let wave = parts[1]?.trim() || "";

    // Handle named markers |a, |b etc.
    // This is a simplification and might need to be more robust
    wave = wave.replace(/\|\s*([a-zA-Z0-9])/g, '|$1');

    signals.push({ name, wave });
  }
  return signals;
};

export default function DiagramRenderer({ content, config }: DiagramRendererProps) {
  const signals = useMemo(() => parseContent(content), [content]);
  
  if (signals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No diagram to display. Start typing in the editor.</p>
      </div>
    );
  }

  const maxWaveLength = Math.max(0, ...signals.map(s => s.wave.length));
  const totalWidth = NAME_WIDTH + (maxWaveLength * SYMBOL_WIDTH) + PADDING * 2;
  const totalHeight = signals.length * config.signalHeight + PADDING * 2;

  const renderWave = (wave: string, yOffset: number, isFirstSignal: boolean) => {
    let path = "";
    let lastState: 'h' | 'l' | 'x' = 'x';
    const highY = yOffset + config.signalHeight * 0.2;
    const lowY = yOffset + config.signalHeight * 0.8;
    const midY = yOffset + config.signalHeight * 0.5;

    const elements: JSX.Element[] = [];

    for (let i = 0; i < wave.length; i++) {
      const char = wave[i];
      const nextChar = wave[i + 1];
      const x = NAME_WIDTH + i * SYMBOL_WIDTH;

      const drawLine = (y: number) => `L ${x + SYMBOL_WIDTH} ${y}`;
      
      switch (char) {
        case '~':
          path += lastState === 'l' ? `M ${x} ${lowY} L ${x} ${midY} L ${x+SYMBOL_WIDTH/2} ${highY} L ${x+SYMBOL_WIDTH} ${highY}` : `M ${x} ${highY} `;
          lastState = 'h';
          break;
        case '_':
          path += lastState === 'h' ? `M ${x} ${highY} L ${x} ${midY} L ${x+SYMBOL_WIDTH/2} ${lowY} L ${x+SYMBOL_WIDTH} ${lowY}` : `M ${x} ${lowY} `;
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
        case 'h':
          path += lastState === 'l' ? `L ${x} ${lowY} L ${x} ${highY} ` : `M ${x} ${highY} `;
          path += drawLine(highY);
          lastState = 'h';
          break;
        case 'l':
          path += lastState === 'h' ? `L ${x} ${highY} L ${x} ${lowY} ` : `M ${x} ${lowY} `;
          path += drawLine(lowY);
          lastState = 'l';
          break;
        case 'p':
          path += `M ${x} ${lowY} L ${x + SYMBOL_WIDTH / 2} ${lowY} L ${x + SYMBOL_WIDTH / 2} ${highY} L ${x + SYMBOL_WIDTH} ${highY}`;
          lastState = 'h';
          break;
        case 'n':
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
        case 'z':
            path += `M ${x + SYMBOL_WIDTH * 0.1} ${midY} ` + drawLine(midY);
            lastState = 'x';
            break;
        case '|':
             const markerX = x + SYMBOL_WIDTH / 2;
             elements.push(
                 <line key={`marker-line-${i}`} x1={markerX} y1={yOffset - PADDING} x2={markerX} y2={totalHeight} stroke="hsl(var(--border))" strokeDasharray="4 4" />
             );
             if (nextChar && nextChar.match(/[a-zA-Z0-9]/)) {
                if (isFirstSignal) {
                  elements.push(
                    <text key={`marker-text-${i}`} x={markerX} y={yOffset-PADDING-2} textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" >
                        {nextChar}
                    </text>
                  );
                }
                i++; // Skip the next character as it's part of the marker
             }
            break;
        case '=': // Bus separator
             elements.push(
                 <path key={`bus-${i}`} d={`M ${x} ${highY} L ${x+SYMBOL_WIDTH} ${highY} M ${x} ${lowY} L ${x+SYMBOL_WIDTH} ${lowY}`} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
             );
            lastState = 'x';
            break;
        default: // Data
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
    <svg width={totalWidth} height={totalHeight} className="font-sans" aria-label="Timing Diagram">
      <rect width="100%" height="100%" fill="hsl(var(--background))" />
      {signals.map((signal, index) => {
        const y = index * config.signalHeight + PADDING;
        return (
          <g key={signal.name + index} transform={`translate(${PADDING}, ${y})`}>
            <text x="0" y={config.signalHeight / 2 + 5} fill="hsl(var(--foreground))" fontSize="14" fontWeight="500">
              {signal.name}
            </text>
            {renderWave(signal.wave, 0, index === 0)}
          </g>
        );
      })}
    </svg>
  );
}
