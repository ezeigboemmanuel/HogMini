"use client";

import * as React from "react";
import { Eye, EyeOff, Copy, Check, Key, Terminal, Code, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SdkClientProps {
  project: {
    id: string;
    name: string;
    apiKey: string;
  };
}

import { useProject } from "@/app/contexts/ProjectContext";

export default function SdkClient({ project }: SdkClientProps) {
  const { selectedEnvironment } = useProject();
  const [showKey, setShowKey] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);
  const [selectedSdk, setSelectedSdk] = React.useState("nextServer");

  const effectiveApiKey = selectedEnvironment?.apiKey || project.apiKey;

  const copyToClipboard = (text: string, type: "key" | "id") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
    toast.success(`${type === "key" ? "API Key" : "Project ID"} copied to clipboard`);
  };

  const snippets: {
    [key: string]: {
      install: { npm: string; pnpm: string; yarn: string } | string;
      usage: string;
    };
  } = {
    fetch: {
      install: `# No installation required for basic fetch usage`,
      usage: `// Standard JavaScript Fetch
const fetchFlags = async () => {
  const res = await fetch(\`http://localhost:3001/sdk/rules\`, {
    headers: {
      'Authorization': '${effectiveApiKey}'
    }
  });
  const data = await res.json();
  return data.flags; // Returns array of flags for this environment
};`,
    },
    nextServer: {
      install: {
        npm: `npm install hogmini-node`,
        pnpm: `pnpm add hogmini-node`,
        yarn: `yarn add hogmini-node`,
      },
      usage: `import { HogMini } from "hogmini-node";

// 1. Initialize the SDK
const hog = new HogMini("http://localhost:3001", "${effectiveApiKey}");
await hog.init();

// 2. Evaluate a flag
const isEnabled = hog.get("my-feature-flag", { userId: "user_123" });

if (isEnabled) {
  console.log("Feature is active!");
}`,
    },
    reactClient: {
      install: {
        npm: `npm install hogmini-node`,
        pnpm: `pnpm add hogmini-node`,
        yarn: `yarn add hogmini-node`,
      },
      usage: `// Using basic fetch for client-side
import { useEffect, useState } from 'react';

function MyComponent() {
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    fetch(\`http://localhost:3001/sdk/rules\`, {
      headers: { 'Authorization': '${effectiveApiKey}' }
    })
      .then(res => res.json())
      .then(data => setFlags(data.flags));
  }, []);

  const isEnabled = flags.find(f => f.key === 'my-flag')?.isActive;

  return isEnabled ? <NewFeature /> : <OldFeature />;
}`,
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">SDK & API Keys</h1>
        <p className="text-muted-foreground text-sm">
          Connect your application to HogMini using our API and SDKs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 overflow-hidden rounded-sm! pt-0!">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Environment API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    readOnly
                    type={showKey ? "text" : "password"}
                    value={effectiveApiKey || ""}
                    className="pr-24 font-mono text-xs tracking-tight bg-muted/20"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hover:bg-background"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hover:bg-background"
                      onClick={() => copyToClipboard(effectiveApiKey, "key")}
                    >
                      {copiedKey ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                    </Button>
                  </div>
                </div>

              </div>
            </div>
            <p className="text-xs text-muted-foreground"> Use this key to authenticate your SDK or API requests.</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 overflow-hidden pt-0 rounded-sm!">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Project ID</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={project.id || ""}
                  className="font-mono text-xs tracking-tight bg-muted/20"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => copyToClipboard(project.id, "id")}
                >
                  {copiedId ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground"> Identifiers for your project in our system.</p>
            </div>

          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-1.5 px-1">
          <div className="flex items-center gap-2">

            <h2 className="text-lg font-bold">Setup SDK</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Integrate HogMini into your stack in minutes. Pick your platform to get started.
          </p>
        </div>

        <div className="px-1 space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-0.5">Choose your platform</label>
          <Select value={selectedSdk} onValueChange={setSelectedSdk}>
            <SelectTrigger className="w-full max-w-[280px] bg-background border-border/60 h-10 text-sm">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Select platform" />
              </div>
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="nextServer" className="text-sm">Next.js (Server) / Node.js</SelectItem>
              <SelectItem value="reactClient" className="text-sm">React / Client</SelectItem>
              <SelectItem value="fetch" className="text-sm">Standard JS (Fetch)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">1. Install</span>
            </div>

            {typeof snippets[selectedSdk].install === "string" ? (
              <div className="relative group rounded-sm overflow-hidden border border-zinc-800 shadow-xl">
                <SyntaxHighlighter
                  language="bash"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "16px",
                    fontSize: "13px",
                    backgroundColor: "#09090b",
                  }}
                >
                  {snippets[selectedSdk].install as string}
                </SyntaxHighlighter>
              </div>
            ) : (
              <Tabs defaultValue="npm" className="w-full">
                <TabsList className="h-8 p-1 bg-muted/50 gap-0 rounded-sm!">
                  <TabsTrigger
                    value="npm"
                    className="h-6 text-[11px] px-3 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm!"
                  >
                    npm
                  </TabsTrigger>
                  <TabsTrigger
                    value="pnpm"
                    className="h-6 text-[11px] px-3 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm!"
                  >
                    pnpm
                  </TabsTrigger>
                  <TabsTrigger
                    value="yarn"
                    className="h-6 text-[11px] px-3 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm!"
                  >
                    yarn
                  </TabsTrigger>
                </TabsList>
                {(
                  Object.entries(snippets[selectedSdk].install as any) as [string, string][]
                ).map(([pm, command]) => (
                  <TabsContent key={pm} value={pm} className="m-0 focus-visible:ring-0">
                    <div className="relative group rounded-md overflow-hidden border border-zinc-800 shadow-xl">
                      <SyntaxHighlighter
                        language="bash"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: "16px",
                          fontSize: "13px",
                          backgroundColor: "#09090b",
                        }}
                      >
                        {command}
                      </SyntaxHighlighter>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 size-8 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-white hover:bg-[#09090b]"
                        onClick={() => {
                          navigator.clipboard.writeText(command);
                          toast.success(`${pm} command copied`);
                        }}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">2. Usage</span>
            </div>
            <div className="relative group rounded-md overflow-hidden border border-zinc-800 shadow-xl">
              <SyntaxHighlighter
                language="javascript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "20px",
                  fontSize: "13px",
                  backgroundColor: "#09090b",
                  minHeight: "160px",
                }}
              >
                {snippets[selectedSdk].usage}
              </SyntaxHighlighter>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-3 top-3 h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                onClick={() => {
                  navigator.clipboard.writeText(snippets[selectedSdk].usage);
                  toast.success("Usage snippet copied");
                }}
              >
                <Copy className="size-3.5 mr-2" />
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
