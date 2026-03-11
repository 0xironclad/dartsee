import { NavLink, Route, Routes } from "react-router-dom"
import { Moon, Sun, Target } from "lucide-react"
import GamesList from "@/pages/GamesList"
import GameDetail from "@/pages/GameDetail"
import Stats from "@/pages/Stats"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

const navItems = [
  { to: "/", label: "Games" },
  { to: "/stats", label: "Stats" },
]

export function App() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light")
    else if (theme === "light") setTheme("dark")
    else setTheme("dark")
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <NavLink to="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Dartsee
            </span>
          </NavLink>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-2 h-4 w-px bg-border" />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <Routes>
          <Route path="/" element={<GamesList />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
