"use client";

export function AmbientBackground() {
  return (
    <>
      <div aria-hidden className="aurora-wrap" />
      <style>{`

        /* ── Fond de base noir ───────────────────────────────────────────── */
        .aurora-wrap {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: -1;
          background: #07070d;
          overflow: hidden;
        }

        /* ── Jets d'aurore (pseudo-elements + divs) ──────────────────────
           Chaque jet = un gradient long et fin qu'on fait tourner/dériver */

        /* Jet 1 — violet/accent */
        .aurora-wrap::before {
          content: "";
          position: absolute;
          width: 160%;
          height: 38%;
          top: -8%;
          left: -30%;
          background: conic-gradient(
            from 180deg at 50% 100%,
            transparent 20%,
            color-mix(in srgb, var(--accent) 55%, #0ff) 40%,
            color-mix(in srgb, var(--accent) 30%, transparent) 60%,
            transparent 80%
          );
          filter: blur(38px);
          opacity: 0.55;
          transform-origin: 50% 100%;
          animation: aurora-wave-1 14s ease-in-out infinite alternate;
        }

        /* Jet 2 — cyan/vert */
        .aurora-wrap::after {
          content: "";
          position: absolute;
          width: 140%;
          height: 32%;
          top: 2%;
          left: -20%;
          background: conic-gradient(
            from 170deg at 60% 100%,
            transparent 15%,
            rgba(0, 230, 180, 0.6) 38%,
            rgba(80, 255, 160, 0.35) 55%,
            transparent 75%
          );
          filter: blur(42px);
          opacity: 0.45;
          transform-origin: 60% 100%;
          animation: aurora-wave-2 18s ease-in-out infinite alternate;
        }

        /* Jet 3 — violet profond, bas de page */
        .aurora-j3 {
          position: absolute;
          width: 120%;
          height: 28%;
          top: 5%;
          left: 10%;
          background: conic-gradient(
            from 190deg at 40% 100%,
            transparent 20%,
            rgba(140, 60, 255, 0.5) 42%,
            rgba(60, 0, 180, 0.25) 58%,
            transparent 78%
          );
          filter: blur(50px);
          opacity: 0.5;
          transform-origin: 40% 100%;
          animation: aurora-wave-3 22s ease-in-out infinite alternate;
        }

        /* Jet 4 — cyan clair, droit */
        .aurora-j4 {
          position: absolute;
          width: 90%;
          height: 25%;
          top: -2%;
          right: -15%;
          background: conic-gradient(
            from 160deg at 30% 100%,
            transparent 25%,
            rgba(0, 200, 255, 0.45) 45%,
            rgba(0, 255, 200, 0.2) 60%,
            transparent 80%
          );
          filter: blur(44px);
          opacity: 0.4;
          transform-origin: 30% 100%;
          animation: aurora-wave-1 26s ease-in-out infinite alternate-reverse;
        }

        /* Jet 5 — vert émeraude, subtil */
        .aurora-j5 {
          position: absolute;
          width: 100%;
          height: 20%;
          top: 8%;
          left: 5%;
          background: linear-gradient(
            90deg,
            transparent 10%,
            rgba(0, 255, 140, 0.12) 35%,
            rgba(0, 200, 100, 0.2) 50%,
            rgba(0, 255, 140, 0.1) 65%,
            transparent 90%
          );
          filter: blur(30px);
          opacity: 0.6;
          animation: aurora-drift 20s ease-in-out infinite alternate;
        }

        /* ── Voile sombre par-dessus pour garder le fond noir dominant ── */
        .aurora-veil {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 100% 60% at 50% 0%,
            transparent 0%,
            rgba(7, 7, 13, 0.55) 60%,
            rgba(7, 7, 13, 0.85) 100%
          );
        }

        /* ── Keyframes ───────────────────────────────────────────────────── */

        @keyframes aurora-wave-1 {
          0%   { transform: rotate(-4deg) scaleX(1)    translateY(0);    opacity: 0.55; }
          25%  { transform: rotate(-1deg) scaleX(1.06) translateY(-1vh); opacity: 0.65; }
          50%  { transform: rotate( 3deg) scaleX(0.97) translateY(1vh);  opacity: 0.50; }
          75%  { transform: rotate( 1deg) scaleX(1.03) translateY(-2vh); opacity: 0.60; }
          100% { transform: rotate(-5deg) scaleX(1.08) translateY(0.5vh);opacity: 0.55; }
        }

        @keyframes aurora-wave-2 {
          0%   { transform: rotate( 3deg) scaleX(1)    translateY(0);    opacity: 0.45; }
          30%  { transform: rotate(-2deg) scaleX(1.05) translateY(1.5vh);opacity: 0.55; }
          60%  { transform: rotate( 5deg) scaleX(0.95) translateY(-1vh); opacity: 0.40; }
          100% { transform: rotate(-1deg) scaleX(1.1)  translateY(2vh);  opacity: 0.50; }
        }

        @keyframes aurora-wave-3 {
          0%   { transform: rotate(-6deg) scaleX(1)    translateY(0);    opacity: 0.50; }
          40%  { transform: rotate( 2deg) scaleX(1.08) translateY(-2vh); opacity: 0.60; }
          80%  { transform: rotate(-3deg) scaleX(0.93) translateY(1vh);  opacity: 0.45; }
          100% { transform: rotate( 4deg) scaleX(1.05) translateY(-1vh); opacity: 0.55; }
        }

        @keyframes aurora-drift {
          0%   { transform: translateX(-4%) scaleY(1);   opacity: 0.6; }
          50%  { transform: translateX( 4%) scaleY(1.3); opacity: 0.4; }
          100% { transform: translateX(-2%) scaleY(0.9); opacity: 0.65; }
        }

        /* ── Réduit si prefers-reduced-motion ────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .aurora-wrap::before,
          .aurora-wrap::after,
          .aurora-j3,
          .aurora-j4,
          .aurora-j5 {
            animation: none !important;
          }
        }

        /* ── Mode clair : aurore très atténuée ───────────────────────── */
        :root:not(.dark) .aurora-wrap { background: #fafaf9; }
        :root:not(.dark) .aurora-wrap::before { opacity: 0.12; }
        :root:not(.dark) .aurora-wrap::after  { opacity: 0.10; }
        :root:not(.dark) .aurora-j3  { opacity: 0.08; }
        :root:not(.dark) .aurora-j4  { opacity: 0.08; }
        :root:not(.dark) .aurora-j5  { opacity: 0.10; }
        :root:not(.dark) .aurora-veil { opacity: 0; }
      `}</style>

      <div aria-hidden className="aurora-wrap">
        <div className="aurora-j3" />
        <div className="aurora-j4" />
        <div className="aurora-j5" />
        <div className="aurora-veil" />
      </div>
    </>
  );
}
