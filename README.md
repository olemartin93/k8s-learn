# K8S learn

An offline-first Progressive Web App for learning Kubernetes a few minutes every day.

**Open it:** https://olemartin93.github.io/k8s-learn/

## Add it to your home screen

- **iPhone (Safari):** open the link → Share → *Add to Home Screen*.
- **Android (Chrome):** open the link → ⋮ menu → *Install app* / *Add to Home screen*.

Once you've opened it, it works fully offline. Your progress stays on your device (you can export or import a backup from the Progress tab).

## What's inside

| Feature | Learning technique |
| --- | --- |
| **Today**: daily plan with a TL;DR, flashcards and a 5-question quiz, plus a streak | Small daily habit |
| **Learn**: short TL;DR lessons with key points, a "Try it" command and an "Explain it back" prompt | Elaboration / self-explanation |
| **Quiz**: per-topic or mixed rounds with instant feedback and explanations; missed questions come back | Retrieval practice, interleaving |
| **Cards**: Leitner spaced-repetition flashcards (1 → 2 → 4 → 8 → 16 → 32 days) | Spaced repetition, active recall |
| **Progress**: streaks, activity heatmap and per-topic progress | Feedback |

Topics have colour-coded tags: Basics, Architecture, Workloads, Networking, Storage, Config, Security, Scheduling, kubectl, Ecosystem, **Docker Desktop**, **Rancher** and **History**.

### Sources

Every lesson, question and flashcard links to an official primary source: kubernetes.io, CNCF, Docker docs, SUSE/Rancher docs (Rancher, K3s, RKE2, Fleet, Rancher Desktop), Google Research, Helm and etcd. A test (`src/data/data.test.ts`) fails if any content links outside that allow-list.

## Development

```bash
npm ci
npm run dev         # local dev server
npm run lint        # ESLint
npm run typecheck   # strict TypeScript
npm test            # unit + component tests (Vitest + Testing Library)
npm run build       # production build with service worker
npm run test:e2e    # Playwright: installability, offline mode, mobile layout
npm run icons       # regenerate app icons from SVG
```

Stack: React 19, strict TypeScript, Tailwind CSS 4, Vite, and vite-plugin-pwa (Workbox).

## Deployment

On every push to `main`, GitHub Actions lints, type-checks, runs all tests, builds, and publishes `dist/` to the `gh-pages` branch, which GitHub Pages serves.

---

Kubernetes is a registered trademark of The Linux Foundation. Docker and Rancher are trademarks of their respective owners. This project isn't affiliated with any of them.
