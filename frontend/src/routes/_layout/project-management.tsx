import { createFileRoute } from "@tanstack/react-router"
import ProjectManagement from "@/components/ProjectManagement/ProjectManagement"

export const Route = createFileRoute("/_layout/project-management")({
  component: ProjectManagementPage,
})

function ProjectManagementPage() {
  return <ProjectManagement />
}
