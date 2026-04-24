# **App Name**: Kotoor Model AI

## Core Features:

- Model Generation Form: Allow users to select demographic, physical traits, and marketing archetypes for virtual models using interactive dropdowns.
- 3-Angle Model Synthesis: Triggers the generation of a 3-angle model using user inputs, constructing a strict prompt string, and displaying a 'Synthesizing Realistic Angles...' loading state for simulated image generation using 'picsum.photos' URLs.
- Active Model Display: Presents the currently generated virtual model across three high-quality display cards labeled 'Straight Close-up', 'Left Profile', and 'Right Profile', along with its unique 'Generation Seed'.
- Model Library Persistence: Manages saving generated model data (including images, seed, and constructed prompts) to the browser's 'localStorage' for data persistence across user sessions.
- Saved Models Browser: Displays a scrollable grid titled 'My Locked Models', showing previously saved models, each with its straight-on thumbnail, generation seed, and an option to delete.
- Delete Saved Model: Provides functionality to remove specific models from the local 'My Locked Models' library.

## Style Guidelines:

- A dark color scheme suitable for a professional CreaTech tool. The primary interactive color is a deep blue-violet (#5C63CC). The background is a very dark, desaturated blue-grey (#17171C), offering excellent contrast. An accent of bright cyan-blue (#82D1FF) is used for highlights and calls to action.
- The font for all text, including headlines and body, is 'Inter' (sans-serif), chosen for its modern, neutral, and highly readable qualities appropriate for a professional UI.
- Utilize Lucide React icons for a clean, modern, and functional aesthetic consistent with a professional CreaTech internal tool, enhancing navigation and feature recognition.
- Implement a responsive two-column dashboard layout using Tailwind CSS: the left column dedicated to the model generation form, and the right column for the active model display and 'My Locked Models' library. The 3-angle display utilizes Flexbox or CSS Grid for precise side-by-side positioning.
- Incorporate subtle hover effects on interactive elements such as buttons and model cards within the library. Display a loading spinner accompanied by 'Synthesizing Realistic Angles...' text during the model generation process to indicate activity.