# AFTER MOTION

**An evidence led creator investigation workspace.**

AFTERMOTION helps researchers document the events behind a creator's changing cultural relevance. It is deliberately different from a leaderboard or a creator-picking engine: the core workflow is to build a case file, establish a dated timeline, attach public evidence, record alternative explanations, and make a confidence-qualified assessment.

## Current MVP

- Create and search creator case files
- Record dated timeline events
- Attach public source links to a case
- Write analyst notes
- Record a manual verdict and confidence level
- Save changes in the current browser using `localStorage`

## Important limitations

- The included Sample Creator case is illustrative placeholder data, not a real creator or verified finding.
- No private Motion data, Motion Score API, or social-platform API is accessed.
- A timeline association does not prove that an event caused a change in attention.
- Data is stored locally in the browser. It is not yet synchronized across devices or users.
- This is an independent community project and is not affiliated with or endorsed by Motion.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build check

```bash
npm run build
```

## Deploy

Import this repository into Vercel. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.

## Next development priorities

1. Add structured evidence quality and claim-to-source links.
2. Add exportable case reports.
3. Add sample, clearly sourced case studies.
4. Consider shared persistence only after a secure backend is selected.
