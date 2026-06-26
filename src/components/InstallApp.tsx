"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallApp() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    if (standalone) setInstalled(true);

    const ua = nav.userAgent || "";
    setIsIos(/iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua));

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  if (installed) {
    return (
      <div className="hero-status hero-install is-installed">
        <span>✓ App lista</span>
        <p>instalada y funciona sin señal</p>
      </div>
    );
  }

  // Android / Chrome de escritorio: tenemos el prompt nativo.
  if (deferred) {
    return (
      <button
        type="button"
        className="hero-status hero-install is-action"
        onClick={install}
      >
        <span>Instalar app ⤓</span>
        <p>acceso directo, funciona sin señal</p>
      </button>
    );
  }

  // iOS no expone prompt: damos el paso manual.
  if (isIos) {
    return (
      <button
        type="button"
        className="hero-status hero-install is-action"
        onClick={() => setShowHint((value) => !value)}
        aria-expanded={showHint}
      >
        <span>Instalar app ⤓</span>
        <p>
          {showHint
            ? "Toca Compartir y luego “Agregar a inicio”."
            : "guárdala en tu pantalla de inicio"}
        </p>
      </button>
    );
  }

  // Aún no instalable en esta sesión (o ya descartada): informativo.
  return (
    <div className="hero-status hero-install">
      <span>App</span>
      <p>instalable y funciona sin señal</p>
    </div>
  );
}
