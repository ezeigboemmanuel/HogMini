import crypto from "crypto";

export interface FeatureFlag {
  id: string;
  key: string;
  isActive: boolean;
  rules: TargetingRule[];
}

export interface TargetingRule {
  type: "percentage";
  value: number;
}

export interface EvaluationContext {
  userId: string;
  [key: string]: any;
}

export interface HogMiniOptions {
  pollingInterval?: number; // in milliseconds
  bootstrapData?: FeatureFlag[];
}

export class HogMini {
  private serverUrl: string;
  private apiKey: string;
  private flags: FeatureFlag[];
  private lastEtag: string | null = null;
  private pollingInterval: number | null;
  private timer: NodeJS.Timeout | null = null;

  constructor(serverUrl: string, apiKey: string, options: HogMiniOptions = {}) {
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;
    this.flags = options.bootstrapData || [];
    this.pollingInterval = options.pollingInterval || null;
  }

  async init() {
    await this.fetchFlags();
    
    if (this.pollingInterval) {
      this.startPolling();
    }
  }

  private startPolling() {
    if (this.timer) return;
    
    const poll = async () => {
      // Jitter: +/- 10% of the interval
      const jitter = (Math.random() - 0.5) * (this.pollingInterval! * 0.2);
      const nextInterval = this.pollingInterval! + jitter;
      
      this.timer = setTimeout(async () => {
        await this.fetchFlags();
        this.timer = null;
        poll();
      }, nextInterval);
    };
    
    poll();
  }

  async shutdown() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private async fetchFlags() {
    try {
      const headers: Record<string, string> = {
        Authorization: this.apiKey,
      };
      
      if (this.lastEtag) {
        headers["If-None-Match"] = this.lastEtag;
      }

      const response = await fetch(`${this.serverUrl}/sdk/rules`, { headers });

      if (response.status === 304) {
        // Bandwidth optimization: server says nothing changed
        return;
      }

      if (response.status === 401) {
        throw new Error("Invalid API Key");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Capture ETag for next poll
      const etag = response.headers.get("etag");
      if (etag) {
        this.lastEtag = etag;
      }

      const data = await response.json();
      this.flags = data.flags;
    } catch (e) {
      // Silent failure in polling to avoid crashing consumer apps
      console.error("❌ HogMini: Failed to load flags", e);
    }
  }

  get(
    key: string,
    context: EvaluationContext,
    defaultValue: boolean = false,
  ): boolean {
    const flag = this.flags.find((f) => f.key === key);

    if (!flag || !flag.isActive) return defaultValue;

    const rules = flag.rules || [];

    if (rules.length === 0) {
      return true;
    }

    for (const rule of rules) {
      if (rule.type === "percentage") {
        if (this.isInRollout(context.userId, rule.value)) {
          return true;
        }
      }
    }

    return false;
  }

  private isInRollout(userId: string, percentage: number): boolean {
    if (!userId) return false;
    const hash = crypto.createHash("md5").update(userId).digest("hex");
    const hashNum = parseInt(hash.substring(0, 4), 16);
    const value = (hashNum % 100) + 1;
    return value <= percentage;
  }
}