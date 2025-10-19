import { createFileRoute } from "@tanstack/react-router"
import { MUIThemeProvider } from "@/components/MUI/MUIThemeProvider"
import MUIDemo from "@/components/MUI/MUIDemo"

export const Route = createFileRoute("/_layout/mui-demo")({
  component: MUIDemoPage,
})

function MUIDemoPage() {
  return (
    <MUIThemeProvider>
      <MUIDemo />
    </MUIThemeProvider>
  )
}