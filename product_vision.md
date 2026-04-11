# Product Vision: Goal-Oriented Feature Management

## The Philosophy
Most feature flag platforms are built for enterprise scale, leading to complex UIs that overwhelm solo developers and small teams. **HogMini** aims to provide production-grade power with the simplicity of a dedicated tool for every specific use case.

Instead of generic "flags" that require complex configuration, HogMini uses **Goal-Oriented Presets**. Users choose their intent first, and the UI adapts to hide irrelevant complexity.

---

## The Four Core Presets

### 1. 🔴 Kill Switches (The Safety Net)
**Goal**: Instantly enable or disable a feature without a redeploy.
- **UI Experience**: A simple, prominent Toggle.
- **Best For**: Emergency stops, temporary features, maintenance modes.
- **Rules**: Global On/Off logic only.

### 2. 📈 Phased Rollouts (The Confidence Booster)
**Goal**: Gradually release a feature to a percentage of users to monitor performance.
- **UI Experience**: A percentage slider (0% → 100%) or predefined steps (5%, 25%, 50%, 100%).
- **Best For**: Risky migrations, infrastructure changes, new product launches.
- **Rules**: Deterministic hashing based on user ID to ensure a consistent experience.

### 3. ✨ Beta Programs (The Feedback Loop)
**Goal**: Hand-pick specific users or organizations for early access.
- **UI Experience**: A searchable list of "Included Users" or "Included Domains."
- **Best For**: VIP early access, internal testing, B2B customer-specific features.
- **Rules**: Explicit list matching (Whitelisting).

### 4. ⚙️ Remote Config (The Controller)
**Goal**: Change app behavior or content dynamically via JSON/Metadata.
- **UI Experience**: A structured JSON editor with validation.
- **Best For**: Changing UI colors, updating timeout values, setting marketing banners.
- **Rules**: Returns a payload instead of a boolean.

---

## User Experience Flow

### The "Create" Moment
Users are greeted with a "Gallery of Intent" rather than a blank form:
1. **Choose Goal**: "What are you trying to do?" (Select icons for Kill Switch, Rollout, etc.)
2. **Configure**: Supply the Key and the specific setting for that goal (e.g., the 10% slider).
3. **Deploy**: Feature is live.

### The Escape Hatch (Advanced Mode)
Simplicity shouldn't mean a "ceiling" on growth. Every preset can be promoted to **Advanced Mode** if the needs change. 
- *Example*: A Phased Rollout that needs to be limited to "logged-in users only" can be switched to Advanced Mode to add targeting rules without losing its history or breaking its SDK key.

---

## Technical Architecture
Under the hood, all presets use the **same data model** (`FeatureFlag`). 
- **Presets** are purely a **UI abstraction**.
- The `rules` JSON in the database stores the configuration (e.g., `{"rollout": 10}`).
- The **Adaptive UI** reads the flag's configuration and chooses the matching "Preset View" automatically.
