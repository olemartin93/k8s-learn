/** Evidence-based study techniques the app is built around, shown one per day. */
export const learningTips: readonly { readonly title: string; readonly text: string }[] = [
  {
    title: 'Retrieval practice',
    text: 'Testing yourself beats re-reading. Try to answer before you look — even a wrong guess helps you remember the right answer.',
  },
  {
    title: 'Spaced repetition',
    text: 'Short reviews spread over days stick better than one long cram session. That is why flashcards come back on a schedule.',
  },
  {
    title: 'Interleaving',
    text: 'Mixing topics (networking, then storage, then history) feels harder, but it builds stronger, more flexible memory.',
  },
  {
    title: 'Explain it simply',
    text: 'After a TL;DR, explain it out loud in one or two sentences as if to a friend. Gaps in your explanation show what to revisit.',
  },
  {
    title: 'Learn by doing',
    text: 'Turn on Kubernetes in Docker Desktop or Rancher Desktop and try the example command from today’s lesson.',
  },
  {
    title: 'Small and daily',
    text: 'Five focused minutes every day beat an hour once a week. Protect your streak, not your session length.',
  },
  {
    title: 'Learn from mistakes',
    text: 'Read the explanation for every miss. Missed questions return in your daily quiz until you get them right.',
  },
];
