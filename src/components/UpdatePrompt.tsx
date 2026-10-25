import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/** Shows a small banner when a new version is available or the app is ready offline. */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Check for updates every hour while the app is open.
      if (registration) {
        setInterval(() => {
          void registration.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  // The "ready offline" note is informational, so hide it automatically.
  useEffect(() => {
    if (!offlineReady || needRefresh) return undefined;
    const t = setTimeout(() => setOfflineReady(false), 4000);
    return () => clearTimeout(t);
  }, [offlineReady, needRefresh, setOfflineReady]);

  if (!offlineReady && !needRefresh) return null;

  const close = (): void => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div
      role="alert"
      className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
    >
      <p className="flex-1">{needRefresh ? 'A new version is available.' : 'Ready to work offline ✈️'}</p>
      <div className="flex shrink-0 gap-1">
        {needRefresh && (
          <button
            type="button"
            onClick={() => void updateServiceWorker(true)}
            className="rounded-lg bg-brand-500 px-3 py-1.5 font-semibold text-white"
          >
            Update
          </button>
        )}
        <button type="button" onClick={close} aria-label="Close" className="rounded-lg px-2 py-1.5 font-semibold">
          ✕
        </button>
      </div>
    </div>
  );
}
