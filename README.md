# Voice Modeling

Voice Modeling is a modern web app for recording, tagging, and organizing voice notes or audio snippets. It features a beautiful, responsive UI built with React, TypeScript, and Vite, and includes real-time audio visualization, context tagging, and a smooth user experience.

## Features

This is an early build. You can simulate recording audio in your browser, add context tags to your recordings, and see a simple live volume visualization.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [pnpm](https://pnpm.io/) (recommended, but you can use npm or yarn if you prefer)

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/taylorkmho/voice-modeling.git
   cd voice-modeling
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   ```

### Running the App

Start the development server:

```sh
pnpm run dev
```

This will launch the app at [http://localhost:5173](http://localhost:5173) (or another port if 5173 is in use).

### Building for Production

To build the app for production:

```sh
pnpm run build
```

To preview the production build locally:

```sh
pnpm run preview
```

### Linting and Formatting

- **Lint code:** `pnpm run lint`
- **Format code:** `pnpm run format`

## Project Structure

- `src/App.tsx` – Main app layout and theme picker
- `src/components/ChatInput.tsx` – Audio recording and context tagging UI
- `src/components/ChatInputContext.tsx` – Context tag selection and management
- `src/hooks/` – Custom React hooks for audio recording and visualization
- `src/lib/` – Utility functions

## License

MIT
