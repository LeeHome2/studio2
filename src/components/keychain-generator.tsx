'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type FormState } from '@/app/actions';
import { MusicInputForm } from '@/components/music-input-form';
import { KeychainViewer } from '@/components/keychain-viewer';
import { Loader } from '@/components/loader';

export type ModelData = {
  prompt: string;
  modelUrl: string;
};

export default function KeychainGenerator() {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Analyzing Music...');
  const { toast } = useToast();

  const handleFormStateChange = useCallback((state: FormState, pending: boolean) => {
    if (pending) {
      setIsLoading(true);
      // Heuristic to guess the current step
      if (!state.prompt) {
        setLoaderText('Analyzing Music...');
      } else {
        setLoaderText('Generating 3D Model...');
      }
      return;
    }
    
    setIsLoading(false);
    
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Generation Error',
        description: state.error,
      });
    } else if (state.prompt && state.modelUrl) {
      const newModelData: ModelData = {
        prompt: state.prompt,
        modelUrl: state.modelUrl,
      };
      setModelData(newModelData);
      toast({
        title: 'Keychain Generated!',
        description: 'Your unique 3D model is ready.',
      });
    }
  }, [toast]);


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
              <Loader text={loaderText} />
            </div>
          )}
          <KeychainViewer modelData={modelData} />
        </div>
      </div>
    </div>
  );
}
