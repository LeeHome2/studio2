
'use server';

import { analyzeMusicAndGeneratePrompt } from '@/ai/flows/analyze-music-and-generate-prompt';
import { meshyTextTo3D } from '@/ai/flows/meshy-text-to-3d';
import { z } from 'zod';

const formSchema = z.object({
  musicInfo: z.string().min(10, 'Please enter at least 10 characters of a song title, URL, or lyrics.').max(1000, 'Input is too long. Please limit to 1000 characters.'),
});

export type FormState = {
  prompt?: string;
  modelUrl?: string;
  error?: string;
  timestamp?: number;
};

export async function generateKeychainAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    musicInfo: formData.get('musicInfo'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.musicInfo?.[0],
    };
  }

  let musicAnalysis;
  try {
    musicAnalysis = await analyzeMusicAndGeneratePrompt({
      musicInfo: validatedFields.data.musicInfo,
    });
  } catch(e: any) {
    console.error('Error in music analysis step:', e);
    return { error: e.message || 'An unexpected error occurred while analyzing the music.' };
  }
    
  // Return intermediate state so UI can update with the prompt
  const intermediateState: FormState = { prompt: musicAnalysis.prompt, timestamp: Date.now() };

  try {
    const meshyResult = await meshyTextTo3D({ prompt: musicAnalysis.prompt });
    return { 
      ...intermediateState,
      modelUrl: meshyResult.modelUrl,
    };
  } catch (e: any) {
    console.error('Error in 3D generation step:', e);
    return { 
        ...intermediateState,
        error: e.message || 'An unexpected error occurred while generating the model. Please try again later.' 
    };
  }
}
