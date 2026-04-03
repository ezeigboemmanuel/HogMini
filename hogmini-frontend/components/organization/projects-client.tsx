"use client"

import React, { useState } from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import CreateProjectDialog from "./create-project-dialog"

export default function ProjectsClient({
  orgSlug,
  projects,
}: {
  orgSlug: string
  projects: Project[]
}) {
  return (
    <ProtectedRoute>
      <div className="space-y-4">
        {projects.length === 0 && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold">Start your first project</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Add a project and we&apos;ll provision development and production environments automatically.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create feature flags, test them in each environment, and deploy with confidence.
              </p>
              <div className="mt-6">
                <CreateProjectInvoker orgSlug={orgSlug} asCard={false} />
              </div>
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateProjectInvoker orgSlug={orgSlug} asCard />
            {projects.map((p) => (
              <a
                key={p.id}
                href={`/project/${p.id}`}
                className="block bg-card text-card-foreground rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <h3 className="text-lg font-medium">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">ID: {p.id}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

function CreateProjectInvoker({ orgSlug, asCard = true }: { orgSlug: string; asCard?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {asCard ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full rounded-lg border bg-card p-4 text-left text-card-foreground transition-colors hover:bg-accent cursor-pointer"
        >
          <h3 className="text-lg font-medium">Create project</h3>
          <p className="mt-2 text-sm text-muted-foreground">Set up a new project and environments</p>
        </button>
      ) : (
        <Button onClick={() => setOpen(true)} className="cursor-pointer">
          Create project
        </Button>
      )}
      <CreateProjectDialog open={open} onOpenChange={setOpen} orgSlug={orgSlug} />
    </>
  )
}
