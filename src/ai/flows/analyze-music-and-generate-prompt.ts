'use server';
/**
 * @fileOverview Analyzes music input (title, link, or lyrics), extracts emotional tones and keywords,
 * and generates a prompt suitable for the Meshy API to create a 3D model reflecting the music's essence.
 *
 * @interface AnalyzeMusicInput - Represents the input for analyzing music, including title, link, or lyrics.
 * @interface MeshyPromptOutput - Represents the output containing a prompt suitable for the Meshy API.
 * @function analyzeMusicAndGeneratePrompt - Analyzes music and generates a Meshy API prompt.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMusicInputSchema = z.object({
  musicInfo: z.string().describe('The music information, which can be a title, link, or lyrics.'),
});
export type AnalyzeMusicInput = z.infer<typeof AnalyzeMusicInputSchema>;

const MeshyPromptOutputSchema = z.object({
  prompt: z.string().describe('A prompt suitable for the Meshy API to create a 3D model.'),
});
export type MeshyPromptOutput = z.infer<typeof MeshyPromptOutputSchema>;

export async function analyzeMusicAndGeneratePrompt(
  input: AnalyzeMusicInput
): Promise<MeshyPromptOutput> {
  return analyzeMusicAndGeneratePromptFlow(input);
}

const analyzeMusicPrompt = ai.definePrompt({
  name: 'analyzeMusicPrompt',
  input: {schema: AnalyzeMusicInputSchema},
  output: {schema: MeshyPromptOutputSchema},
  prompt: `You are an AI assistant designed to analyze music information (title, link, or lyrics) and generate a prompt suitable for the Meshy API for 3D model generation.

  Analyze the following music information:
  {{musicInfo}}

  Extract the emotional tones, moods, and dominant concepts from the music information.
  Translate the extracted emotions and concepts into a concise prompt suitable for the Meshy API.
  The prompt should instruct Meshy to create a 3D model that captures the emotional essence of the song in form, color, and texture.
  Example: 'Create a glowing heart-shaped keychain representing dreamy melancholy in blue tones'. Return only the prompt.
  Do not add any other text.
  `,
});

const analyzeMusicAndGeneratePromptFlow = ai.defineFlow(
  {
    name: 'analyzeMusicAndGeneratePromptFlow',
    inputSchema: AnalyzeMusicInputSchema,
    outputSchema: MeshyPromptOutputSchema,
  },
  async input => {
    const {output} = await analyzeMusicPrompt(input);
    return output!;
  }
);
