import { createFileRoute } from "@tanstack/react-router"
import { MUIThemeProvider } from "@/components/MUI/MUIThemeProvider"
import MUIRbacManagement from "@/components/RBAC/MUIRbacManagement"

export const Route = createFileRoute("/_layout/mui-rbac")({
  component: MUIRbacPage,
})

function MUIRbacPage() {
  return (
    <MUIThemeProvider>
      <MUIRbacManagement />
    </MUIThemeProvider>
  )
}
