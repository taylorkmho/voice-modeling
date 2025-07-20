import "./App.css";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { ThemePicker } from "./components/ThemePicker";

function App() {
  return (
    <div className="bg-background text-foreground min-h-screen border-2 border-red-500">
      <main className="mx-auto flex w-full max-w-4xl flex-col">
        <div className="flex items-center justify-between border-2 border-green-500">
          <h1 className="text-3xl font-bold">Voice Modeling</h1>
          <ThemePicker />
        </div>

        <div className="flex min-h-0 grow flex-col items-center gap-4 border-2 border-amber-500">
          <AudioVisualizer />
        </div>
      </main>
    </div>
  );
}

export default App;
