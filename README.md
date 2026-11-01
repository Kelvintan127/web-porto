# Kelvin Tan — Portfolio v2

Personal portfolio built with Next.js App Router, React, TypeScript, Tailwind CSS 4, and React Three Fiber. Static project content lives in typed files under `src/content`; no database and no external contact service needed.

## Run locally

```bash
npm ci
npm run dev
npm run lint    # tsc --noEmit
npm test        # vitest
npm run build
npm start
```

The 3D hero imports dynamically in the browser only, caps device pixel ratio, honours `prefers-reduced-motion`, and falls back to a static CSS graphic when WebGL is unavailable.

## Content and assets

- `src/content/profile.ts` — verified profile copy and public links
- `src/content/projects.ts` — project descriptions, technologies, links, images
- `src/content/career.ts` — experience and skill categories
- `public/assets/Kelvin Tan CV.pdf` — public CV

Review factual claims and project links before publishing changes. The current ERP employer, exact start date, ERP product, and role specifics remain unspecified pending verification.

## Deployment

Run the checks above, then deploy a preview from `feat/portfolio-v2`. Production stays untouched until explicit approval. Rollback: redeploy the previous production build. No environment variables required.
