
'use server';

import { analyzeMusicAndGeneratePrompt } from '@/ai/flows/analyze-music-and-generate-prompt';
import { z } from 'zod';

const formSchema = z.object({
  musicInfo: z.string().min(10, 'Please enter at least 10 characters of a song title, URL, or lyrics.').max(1000, 'Input is too long. Please limit to 1000 characters.'),
});

export type FormState = {
  prompt?: string;
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

  try {
    const result = await analyzeMusicAndGeneratePrompt({
      musicInfo: validatedFields.data.musicInfo,
    });
    return { prompt: result.prompt, timestamp: Date.now() };
  } catch (e) {
    console.error('Error in generateKeychainAction:', e);
    return { error: 'An unexpected error occurred while generating the prompt. Please try again later.' };
  }
}
