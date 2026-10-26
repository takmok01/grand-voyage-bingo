import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ship } from "lucide-react";

export type Effect = { kind: "reach" | "bingo"; id: number } | null;

const REACH_MS = 2200;
const BINGO_MS = 5000;
const CONFETTI_COLORS = ["#f6d77a", "#d5b168", "#f7f0df", "#5fa8d3", "#e9ce91"];

function ReachBanner({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, REACH_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-2 border-[#f6d77a]"
        />
        <div className="relative rounded-full border-2 border-[#f6d77a] bg-[#08264b]/95 px-8 py-3 text-center shadow-[0_0_40px_rgba(246,215,122,.5)]">
          <p className="font-serif text-3xl font-semibold tracking-[.2em] text-[#f6d77a]">REACH!</p>
          <p className="text-xs text-blue-100/90">あと 1 マスでビンゴ</p>
        </div>
      </div>
    </motion.div>
  );
}

type Piece = { id: number; x: number; delay: number; duration: number; rotate: number; color: string; size: number };

function makeConfetti(): Piece[] {
  return Array.from({ length: 90 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 1.8,
    rotate: Math.random() * 720 - 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 8,
  }));
}

function BingoBurst({ onDone }: { onDone: () => void }) {
  const [pieces] = useState(makeConfetti);

  useEffect(() => {
    const timer = window.setTimeout(onDone, BINGO_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDone}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-hidden bg-[#041326]/85 backdrop-blur-sm"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -40, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          className="absolute top-0 block"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 0.4, backgroundColor: p.color }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="relative px-6 text-center"
      >
        <Ship className="mx-auto mb-3 size-10 text-[#f6d77a]" />
        <p className="font-serif text-7xl font-semibold text-[#f6d77a] drop-shadow-[0_0_30px_rgba(246,215,122,.6)] sm:text-8xl">
          BINGO!
        </p>
        <p className="mt-3 font-serif text-xl tracking-[.3em] text-[#f7f0df]">BON VOYAGE</p>
        <p className="mt-6 text-xs text-blue-100/80">タップして閉じる</p>
      </motion.div>
    </motion.div>
  );
}

export function EffectOverlay({ effect, onClose }: { effect: Effect; onClose: () => void }) {
  return (
    <AnimatePresence>
      {effect?.kind === "reach" && <ReachBanner key={effect.id} onDone={onClose} />}
      {effect?.kind === "bingo" && <BingoBurst key={effect.id} onDone={onClose} />}
    </AnimatePresence>
  );
}
