"use client"

import React from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
        {projects.length === 0 ? (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold">Start your first project</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Add a project and we&apos;ll provision development and production environments automatically.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create feature flags, test them in each environment, and deploy with confidence.
              </p>
              <div className="mt-6">
                <Link href={`/org/${orgSlug}/projects/new`} className="inline-block">
                  <Button>Create project</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
