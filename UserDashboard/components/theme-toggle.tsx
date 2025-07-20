"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThemeToggleProps {
  theme: "dark" | "light"
  toggleTheme: () => void
}

export function ThemeToggle({ theme, toggleTheme }: ThemeToggleProps) {
  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className={`fixed top-6 right-6 z-50 rounded-full backdrop-blur-sm transition-all duration-300 ${
        theme === "dark"
          ? "bg-gray-800/80 border-gray-700 hover:bg-gray-700 text-white"
          : "bg-white/80 border-gray-200 hover:bg-gray-100 text-gray-900"
      }`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400 transition-transform duration-300 hover:rotate-180" />
      ) : (
        <Moon className="w-5 h-5 text-purple-600 transition-transform duration-300 hover:rotate-180" />
      )}
    </Button>
  )
}
