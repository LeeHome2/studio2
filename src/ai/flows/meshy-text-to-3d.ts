'use server';
/**
 * @fileOverview A flow for generating 3D models from text prompts using the Meshy API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MeshyTextTo3DInputSchema = z.object({
  prompt: z.string().describe('The text prompt for 3D model generation.'),
});
export type MeshyTextTo3DInput = z.infer<typeof MeshyTextTo3DInputSchema>;

const MeshyTextTo3DOutputSchema = z.object({
  modelUrl: z.string().describe('The URL of the generated 3D model.'),
  taskId: z.string().describe('The ID of the Meshy API task.'),
});
export type MeshyTextTo3DOutput = z.infer<typeof MeshyTextTo3DOutputSchema>;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function meshyTextTo3D(input: MeshyTextTo3DInput): Promise<MeshyTextTo3DOutput> {
  return meshyTextTo3DFlow(input);
}

const meshyTextTo3DFlow = ai.defineFlow(
  {
    name: 'meshyTextTo3DFlow',
    inputSchema: MeshyTextTo3DInputSchema,
    outputSchema: MeshyTextTo3DOutputSchema,
  },
  async (input) => {
    if (!process.env.MESHY_API_KEY) {
      throw new Error('MESHY_API_KEY environment variable is not set.');
    }

    // Create task
    const createResponse = await fetch('https://api.meshy.ai/v1/text-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: input.prompt,
        mode: 'preview', // or 'refine'
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Meshy API error (create): ${createResponse.statusText} - ${errorText}`);
    }

    const { result: taskId } = await createResponse.json();

    // Poll for result
    let status = 'IN_PROGRESS';
    let result;

    while (status === 'IN_PROGRESS' || status === 'PENDING') {
      await sleep(5000); // Wait for 5 seconds before checking again
      const checkResponse = await fetch(`https://api.meshy.ai/v1/text-to-3d/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
        },
      });

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        throw new Error(`Meshy API error (check): ${checkResponse.statusText} - ${errorText}`);
      }
      
      result = await checkResponse.json();
      status = result.status;
    }

    if (status === 'SUCCEEDED') {
      return {
        modelUrl: result.model_urls.glb,
        taskId,
      };
    } else {
      throw new Error(`Meshy task failed with status: ${status}. Reason: ${result.error?.message}`);
    }
  }
);
