import { createFileRoute } from "@tanstack/react-router"
import { MUIThemeProvider } from "@/components/MUI/MUIThemeProvider"
import HybridExample from "@/components/MUI/HybridExample"

export const Route = createFileRoute("/_layout/hybrid-demo")({
  component: HybridDemoPage,
})

function HybridDemoPage() {
  return (
    <MUIThemeProvider>
      <HybridExample />
    </MUIThemeProvider>
  )
}