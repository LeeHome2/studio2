'use client';

import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type FormState } from '@/app/actions';
import { MusicInputForm } from '@/components/music-input-form';
import { KeychainViewer } from '@/components/keychain-viewer';
import { Loader } from '@/components/loader';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bot } from 'lucide-react';

export type ModelData = {
  prompt: string;
  modelUrl: string;
};

export default function KeychainGenerator() {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Analyzing Music...');
  const [latestPrompt, setLatestPrompt] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFormStateChange = useCallback((state: FormState, pending: boolean) => {
    if (pending) {
      setIsLoading(true);
      // Heuristic to guess the current step
      if (!state.prompt) {
        setLoaderText('Analyzing Music...');
      } else {
        setLoaderText('Generating 3D Model...');
        setLatestPrompt(state.prompt);
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
      setLatestPrompt(state.prompt);
      toast({
        title: 'Keychain Generated!',
        description: 'Your unique 3D model is ready.',
      });
    }
  }, [toast]);
  
  const DisplayPrompt = useMemo(() => {
    if (isLoading && loaderText.startsWith('Generating')) {
      return latestPrompt;
    }
    if (!isLoading && modelData) {
      return modelData.prompt;
    }
    return null;
  }, [isLoading, loaderText, modelData, latestPrompt]);


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
          {DisplayPrompt && (
            <Card className="bg-card/50">
              <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
                <Bot className="h-6 w-6 text-accent" />
                <CardTitle className="text-lg text-accent">AI-Generated Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{DisplayPrompt}</p>
              </CardContent>
            </Card>
          )}
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
