'use server';
/**
 * @fileOverview A flow for generating 3D models from text prompts using the Meshy API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
    const createResponse = await fetch('https://api.meshy.ai/v2/text-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: input.prompt,
        art_style: 'realistic',
        mode: 'preview', // or 'refine'
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Meshy API error (create): ${createResponse.statusText} - ${errorText}`);
    }

    const createPayload = await createResponse.json();
    const taskId =
      createPayload?.result ??
      createPayload?.task_id ??
      createPayload?.taskId ??
      createPayload?.id ??
      createPayload?.data?.task_id ??
      createPayload?.data?.taskId ??
      createPayload?.data?.id;

    if (!taskId) {
      throw new Error(
        `Meshy API did not return a task identifier. Raw response: ${JSON.stringify(createPayload)}`,
      );
    }

    // Poll for result
    let status = 'IN_PROGRESS';
    let result;

    while (status === 'IN_PROGRESS' || status === 'PENDING') {
      await sleep(5000); // Wait for 5 seconds before checking again
      const checkResponse = await fetch(`https://api.meshy.ai/v2/text-to-3d/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
        },
      });

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        throw new Error(`Meshy API error (check): ${checkResponse.statusText} - ${errorText}`);
      }
      
      result = await checkResponse.json();
      status = result.status ?? result.state ?? result.task_status;
    }

    if (status === 'SUCCEEDED') {
      const modelUrl = result.model_urls?.glb;

      if (!modelUrl) {
        throw new Error('Meshy task succeeded but no GLB model URL was returned.');
      }

      return {
        modelUrl,
        taskId,
      };
    } else {
      throw new Error(`Meshy task failed with status: ${status}. Reason: ${result.error?.message}`);
    }
  }
);
