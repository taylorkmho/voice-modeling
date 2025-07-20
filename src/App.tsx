import "./App.css";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { useTheme } from "./components/use-theme";

function App() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground p-8 border-2 border-red-500">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Voice Modeling</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Theme:</span>
            <select
              value={theme}
              onChange={e =>
                setTheme(e.target.value as "light" | "dark" | "system")
              }
              className="px-3 py-1 border border-border rounded-md bg-background text-foreground"
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
