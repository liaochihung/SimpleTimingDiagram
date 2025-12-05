export interface Diagram {
    id: string;
    name: string;
    content: string;
    isSaved: boolean;
}

export interface DiagramConfig {
    signalHeight: number;
    spacing: number;
}

export interface Signal {
    name: string;
    wave: string;
}
