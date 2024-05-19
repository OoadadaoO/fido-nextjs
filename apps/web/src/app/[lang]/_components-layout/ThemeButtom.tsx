"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hook/ThemeProvider";

export function ThemeButton() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      // className="rounded-full bg-gray-200 p-2 dark:bg-gray-800"
      className="p-2"
      variant={"ghost"}
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    >
      {/* {theme === "light" ? "☀️" : "🌙"} */}
      {theme === "light" ? (
        <Sun className="aspect-square" />
      ) : (
        <Moon className="aspect-square" />
      )}
    </Button>
  );
}
