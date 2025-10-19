import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test")({
  component: TestPage,
})

function TestPage() {
  return (
    <div>
      <h1>Test Page</h1>
      <p>This is a simple test page to check if React is rendering.</p>
    </div>
  )
}
