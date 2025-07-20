import "./App.css";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { useTheme } from "./components/use-theme";

function App() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-background text-foreground min-h-screen border-2 border-red-500">
      <main className="mx-auto flex w-full max-w-4xl flex-col">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Voice Modeling</h1>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Theme:</span>
            <select
              value={theme}
              onChange={e =>
                setTheme(e.target.value as "light" | "dark" | "system")
              }
              className="border-border bg-background text-foreground rounded-md border px-3 py-1"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        <AudioVisualizer />
      </div>
    </div>
  );
}

export default App;
