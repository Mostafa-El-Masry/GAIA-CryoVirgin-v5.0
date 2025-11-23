'use client';

import {
  useDesign,
  type Theme,
} from "@/app/DesignSystem/context/DesignProvider";
import { THEMES } from "@/app/DesignSystem/theme";

export default function ThemePicker() {
  const { theme, setTheme, brightness, setBrightness } = useDesign();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Theme</label>
        <select
          value={theme}
          onChange={(event) => setTheme(event.target.value as Theme)}
          className="gaia-input w-full max-w-xs rounded-md border px-3 py-2 text-sm focus:outline-none gaia-focus"
        >
          {THEMES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Background brightness
        </label>
        <input
          type="range"
          min={0.5}
          max={1.1}
          step={0.05}
          value={brightness}
          onChange={(e) => setBrightness(parseFloat(e.target.value))}
          className="w-full cursor-pointer accent-current"
        />
        <p className="gaia-muted text-xs">
          Fine-tune the theme if it feels too bright or too dim.
        </p>
      </div>
    </div>
  );
}
