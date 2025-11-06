'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type FormState } from '@/app/actions';
import { MusicInputForm } from '@/components/music-input-form';
import { KeychainViewer } from '@/components/keychain-viewer';
import { Loader } from '@/components/loader';

export type ModelData = {
  prompt: string;
  color: string;
  shape: string;
};

export default function KeychainGenerator() {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormStateChange = useCallback((state: FormState, pending: boolean) => {
    setIsLoading(pending);

    if (pending) return;
    
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Generation Error',
        description: state.error,
      });
    } else if (state.prompt) {
      const newModelData: ModelData = {
        prompt: state.prompt,
        ...parsePrompt(state.prompt),
      };
      setModelData(newModelData);
      toast({
        title: 'Keychain Generated!',
        description: 'Your unique 3D model is ready.',
      });
    }
  }, [toast]);

  const parsePrompt = (prompt: string): { color: string; shape: string } => {
    const lowercasedPrompt = prompt.toLowerCase();
    
    // Color Parsing
    const colorMap: Record<string, string> = {
      blue: '#3b82f6', red: '#ef4444', green: '#22c55e',
      yellow: '#eab308', purple: '#8b5cf6', orange: '#f97316',
      pink: '#ec4899', cyan: '#06b6d4', white: '#ffffff', black: '#000000',
    };
    const foundColor = Object.keys(colorMap).find(c => lowercasedPrompt.includes(c)) || 'purple';

    // Shape Parsing
    const shapeMap: Record<string, string> = {
      heart: 'heart', star: 'star', sphere: 'sphere',
      cube: 'cube', box: 'cube', knot: 'knot',
      torus: 'torus', ring: 'torus',
    };
    const foundShape = Object.keys(shapeMap).find(s => lowercasedPrompt.includes(s)) || 'knot';
    
    return { color: colorMap[foundColor], shape: shapeMap[foundShape] };
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
              Music to Model
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Enter a song title, lyrics, or a link to transform musical vibes into a unique, AI-generated 3D keychain.
            </p>
          </div>
          <MusicInputForm onStateChange={handleFormStateChange} />
        </div>
        <div className="relative aspect-square min-h-[300px] rounded-lg border-2 border-dashed border-border bg-card/50 shadow-inner">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
              <Loader text="Analyzing Music..." />
            </div>
          )}
          <KeychainViewer modelData={modelData} />
        </div>
      </div>
    </div>
  );
}
