import { useTheme } from "./use-theme";

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Theme:</span>
      <select
        value={theme}
        onChange={e => setTheme(e.target.value as "light" | "dark" | "system")}
        className="border-border bg-background text-foreground rounded-md border px-3 py-1"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
