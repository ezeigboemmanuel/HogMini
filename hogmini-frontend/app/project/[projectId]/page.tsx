import { redirect } from "next/navigation";

type Props = {
  params: { projectId: string } | Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const projectId = resolvedParams?.projectId ?? "";
  redirect(`/project/${projectId}/flags`);
}
