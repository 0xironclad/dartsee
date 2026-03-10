import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import "./index.css"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

const configureRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>{configureRoutes()}</BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
