import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  osPreference: Theme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  osPreference: "light",
});

const STORAGE_KEY = "matango-theme";
const INIT_FLAG_KEY = "matango-theme-initialized";

function detectOSPreference(): Theme {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem(STORAGE_KEY);

  // Returning user — respect saved preference
  if (stored === "dark" || stored === "light") return stored;

  // First visit — detect OS, log it, but default to light (brand authority)
  const osPref = detectOSPreference();
  console.info(`[Theme] OS preference detected: ${osPref}. Defaulting to light (brand default).`);
  localStorage.setItem(STORAGE_KEY, "light");
  localStorage.setItem(INIT_FLAG_KEY, "true");

  return "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [osPreference] = useState<Theme>(detectOSPreference);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, osPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
