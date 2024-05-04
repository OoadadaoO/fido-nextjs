"use client";

import { useTheme } from "@/hook/ThemeProvider";

export function ThemeButton() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      className="rounded-full bg-gray-200 p-2 dark:bg-gray-800"
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    >
      {theme === "light" ? "☀️" : "🌙"}
    </button>
  );
}
