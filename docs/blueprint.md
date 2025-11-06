# **App Name**: KeyChainify

## Core Features:

- Music Input: Users can input music information via title, link, or lyrics. The system uses the text input to fetch or analyze the song's emotional profile.
- AI Music Analysis: Analyze emotional tones, moods, and dominant concepts using an embedding model (e.g., OpenAI text-embedding-3-large or LAION-CLAP). The model extracts key emotional keywords and color associations from the lyrics or title.
- LLM Prompt Builder: A small LLM pipeline translates extracted emotions into a Meshy-compatible prompt (e.g., 'Create a glowing heart-shaped keychain representing dreamy melancholy in blue tones').
- 3D Model Generation: Utilize the Meshy API to generate a unique 3D keychain model based on the AI analysis. The model captures the emotional essence of the song in form, color, and texture.
- Design Preview: Display the generated model in a 3D viewer (Three.js) with orbit controls, allowing users to preview from multiple angles. UI elements pulse in the song’s emotion color scheme.
- Download Model: Users can download the 3D keychain file in STL/GLB format for 3D printing or digital sharing.

## Style Guidelines:

- Background color: Dark charcoal (#121212) for a sophisticated dark mode theme.
- Primary color: Vibrant neon purple (#D43CFF) to add a pop of color and energy to the UI.
- Accent color: Neon Green (#39FF14) to highlight interactive elements and calls to action.
- Headline font: 'Space Grotesk' sans-serif for a computerized, techy feel; Body font: 'Inter' sans-serif.
- Use minimalist, glowing neon-style icons to represent different functions and music attributes.
- Design a clean, intuitive layout with a focus on visual hierarchy, making it easy for users to input information and view the 3D model.
- Incorporate subtle animations when loading the 3D model and when interacting with UI elements.