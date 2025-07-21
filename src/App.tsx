import "./App.css";
import { ChatInput } from "./components/ChatInput";
import { ThemePicker } from "./components/ThemePicker";

function App() {
  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <div className="mx-auto flex w-full max-w-4xl flex-col">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Voice Visualizer</h1>
          <ThemePicker />
        </header>

        <main className="flex min-h-0 grow flex-col items-center justify-end gap-4">
          <ChatInput />
        </main>
      </div>
    </div>
  );
}

export default App;
