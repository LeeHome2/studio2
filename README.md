# KeyChainify: AI-Powered Music to 3D Model Generator

This is a Next.js application built with Firebase Studio that transforms music inspiration into unique 3D keychain models using generative AI.

## How It Works

The application leverages a combination of a Next.js frontend, Genkit for AI orchestration, and the Meshy API for 3D model generation.

1.  **User Input**: The user provides music information (like a song title, lyrics, or a URL) through a form on the main page.

2.  **AI Analysis (Genkit)**: When the form is submitted, a Next.js Server Action is triggered. This action calls a Genkit flow (`analyzeMusicAndGeneratePrompt`) which uses Google's Gemini model to analyze the emotional tone and key concepts from the music input. It then generates a concise, descriptive prompt tailored for 3D model creation.

3.  **3D Model Generation (Meshy API)**: The Server Action takes this new prompt and calls a second Genkit flow (`meshyTextTo3D`). This flow handles communication with the external Meshy API:
    *   It sends a request to the Meshy text-to-3d endpoint with the generated prompt.
    *   It receives a unique task ID from Meshy.
    *   It periodically polls the Meshy API with the task ID to check the status of the 3D model generation.

4.  **Displaying the Model**: Once the polling confirms the model has been successfully created (`SUCCEEDED`), the flow retrieves the model's URL (`.glb` format). This URL is sent back to the client-side React component.

5.  **3D Rendering (Three.js)**: The `KeychainViewer` component uses Three.js and its `GLTFLoader` to load and render the 3D model from the received URL, allowing the user to view, rotate, and interact with their unique keychain.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (with React Server Components and Actions)
*   **AI Orchestration**: [Genkit](https://firebase.google.com/docs/genkit)
*   **Generative AI Models**:
    *   [Google Gemini](https://deepmind.google/technologies/gemini/) (for text analysis and prompt generation)
    *   [Meshy API](https://www.meshy.ai/) (for text-to-3D model generation)
*   **UI**: [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
*   **3D Rendering**: [Three.js](https://threejs.org/)

## Getting Started

### Prerequisites

*   Node.js and npm
*   A Firebase project

### Environment Variables

Before running the application, you need to set up your environment variables. Create a `.env` file in the root of the project and add your Meshy API key:

```
MESHY_API_KEY=your_meshy_api_key_here
```

### Running the Development Server

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.
