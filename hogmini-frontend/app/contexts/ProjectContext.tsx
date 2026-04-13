"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";

export interface Environment {
  id: string;
  name: string;
  apiKey: string;
}

export interface Project {
  id: string;
  name: string;
  environments: Environment[];
}

interface ProjectContextType {
  project: Project | null;
  selectedEnvironment: Environment | null;
  environments: Environment[];
  isLoading: boolean;
  refreshProject: () => Promise<void>;
  setSelectedEnvironmentById: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ 
  children,
  initialProject 
}: { 
  children: React.ReactNode;
  initialProject?: Project | null;
}) {
  const { projectId } = useParams() as { projectId: string };
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [project, setProject] = useState<Project | null>(initialProject || null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [isLoading, setIsLoading] = useState(!initialProject);

  // Sync state from URL
  const envParam = searchParams.get("env");

  useEffect(() => {
    if (initialProject) {
      console.log(`🚀 [Time: ${new Date().toLocaleTimeString()}] ProjectContext: Hydrated from server storage.`);
    } else {
      console.log(`📡 [Time: ${new Date().toLocaleTimeString()}] ProjectContext: Client-side fetch initiated for ${projectId}`);
    }
  }, [initialProject, projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Handle environment selection logic (Initial and URL sync)
  useEffect(() => {
    if (!project || !project.environments.length) return;

    if (envParam) {
      const matching = project.environments.find(
        (e) => e.name.toLowerCase() === envParam.toLowerCase()
      );
      if (matching) {
        setSelectedEnvironment(matching);
        return;
      }
    }

    // Default selection
    if (!selectedEnvironment) {
       const devEnv = project.environments.find((e) => e.name === "Development") || project.environments[0];
       setSelectedEnvironment(devEnv);
    }
  }, [project, envParam]);

  const setSelectedEnvironmentById = (id: string) => {
    const env = project?.environments.find(e => e.id === id);
    if (env) {
      setSelectedEnvironment(env);
      
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("env", env.name.toLowerCase());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        selectedEnvironment,
        environments: project?.environments || [],
        isLoading,
        refreshProject: fetchProject,
        setSelectedEnvironmentById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
