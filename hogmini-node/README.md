# HogMini Node.js SDK

Official Node.js SDK for [HogMini](https://github.com/ezeigboemmanuel/HogMini). A high-performance, developer-first feature flag engine.

## Features

- **Local Evaluation**: Zero latency flag checks after initialization.
- **Background Polling**: Stay in sync with dashboard changes automatically.
- **Traffic Protection**: Built-in Jitter to prevent thundering herd spikes on your API.
- **Bandwidth Efficient**: Full ETag (304 Not Modified) support.
- **Offline Support**: Bootstrap with local data for instant startup.
- **TypeScript First**: Strongly typed interfaces for flags and targeting rules.

## Installation

```bash
npm install hogmini-node
```

## Quick Start

```javascript
const { HogMini } = require('hogmini-node');

async function main() {
  const hog = new HogMini("https://api.hogmini.com", "your-env-api-key", {
    pollingInterval: 30000 // Poll every 30 seconds
  });

  await hog.init();

  const isEnabled = hog.get("new-onboarding-flow", { userId: "user_123" });

  if (isEnabled) {
    // Show the new experience
  }
}
```

## Advanced Usage

### Offline / Bootstrap Mode
You can provide initial data to avoid waiting for the first network request:

```javascript
const hog = new HogMini("https://api.hogmini.com", "your-key", {
  bootstrapData: [
    {
      id: "1",
      key: "always-on",
      isActive: true,
      rules: []
    }
  ]
});
```

### Shutdown
Always call `shutdown()` when your app closes to clear any background polling timers:

```javascript
process.on('SIGTERM', async () => {
  await hog.shutdown();
  process.exit(0);
});
```

## License

MIT
