import crypto from "crypto";

export class HogMini {
  private serverUrl: string;
  private apiKey: string;
  private flags: any[];

  constructor(serverUrl: string, apiKey: string) {
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;
    this.flags = [];
  }

  async init() {
    try {
      const response = await fetch(`${this.serverUrl}/sdk/rules`, {
        headers: {
          Authorization: this.apiKey,
        },
      });

      if (response.status === 401) {
        throw new Error("Invalid API Key");
      }

      const data = await response.json();
      this.flags = data.flags;
      console.log("✅ SDK Initialized.");
    } catch (e) {
      console.error("❌ Failed to load flags", e);
    }
  }

  get(
    key: string,
    context: { userId: string },
    defaultValue: boolean = false,
  ): boolean {
    const flag = this.flags.find((f) => f.key === key);

    if (!flag || !flag.isActive) return false;

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
    const hash = crypto.createHash("md5").update(userId).digest("hex");

    const hashNum = parseInt(hash.substring(0, 4), 16);

    const value = (hashNum % 100) + 1;

    return value <= percentage;
  }
}