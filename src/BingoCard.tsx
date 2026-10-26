import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Anchor, Compass, RefreshCw, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_INDEX, createCard, isCardState, lineStatuses, type CardState } from "@/bingo/logic";
import { EffectOverlay, type Effect } from "@/bingo/effects";

const STORAGE_KEY = "grand-voyage-bingo-card-v1";
const COLUMN_LETTERS = ["B", "I", "N", "G", "O"];
const CLOSED_CELLS = 24;

function loadCard(): CardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isCardState(parsed)) return parsed;
    }
  } catch {
    // 壊れた保存データは無視して新しいカードを作る
  }
  return createCard();
}

export default function BingoCard() {
  const [card, setCard] = useState<CardState>(loadCard);
  const [effect, setEffect] = useState<Effect>(null);
  // 直前のリーチ数・ビンゴ数。初回表示ではエフェクトを出さないための基準値
  const prevCounts = useRef<{ complete: number; reach: number } | null>(null);

  const statuses = useMemo(() => lineStatuses(card.opened), [card.opened]);
  const completeCount = statuses.filter((s) => s.complete).length;
  const reachCount = statuses.filter((s) => !s.complete && s.reachCell !== null).length;
  const reachCells = new Set<number>();
  statuses.forEach((s) => {
    if (!s.complete && s.reachCell !== null) reachCells.add(s.reachCell);
  });
  const openedCount = card.opened.filter((v, i) => v && i !== FREE_INDEX).length;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
    } catch {
      // 保存できない環境（プライベートモードなど）でも表示は続ける
    }
  }, [card]);

  useEffect(() => {
    const prev = prevCounts.current;
    prevCounts.current = { complete: completeCount, reach: reachCount };
    if (!prev) return;
    if (completeCount > prev.complete) {
      setEffect({ kind: "bingo", id: Date.now() });
    } else if (reachCount > prev.reach) {
      setEffect({ kind: "reach", id: Date.now() });
    }
  }, [completeCount, reachCount]);

  const clearEffect = useCallback(() => setEffect(null), []);

  const toggle = (index: number) => {
    if (index === FREE_INDEX) return;
    setCard((prev) => {
      const opened = [...prev.opened];
      opened[index] = !opened[index];
      return { ...prev, opened };
    });
  };

  const newCard = () => {
    if (!window.confirm("カードを作り直しますか？開けた番号はリセットされます。")) return;
    prevCounts.current = { complete: 0, reach: 0 };
    setEffect(null);
    setCard(createCard());
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#061a33] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(49,114,169,.3),transparent_45%),linear-gradient(180deg,#0d3767_0%,#08264b_55%,#041326_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 opacity-40 bg-[linear-gradient(175deg,transparent_0_30%,#0b5480_31_43%,#082f52_44_57%,#061e38_58%)]" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center px-4 py-8">
        <header className="text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.28em] text-[#d9b76a]">
            <Compass className="size-4" /> Year End Party 2026
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-none">Grand Voyage</h1>
          <p className="mt-2 font-serif text-xl tracking-[.4em] text-[#d9b76a]">BINGO</p>
          <div className="mx-auto mt-4 h-px w-24 bg-[#d9b76a]" />
          <p className="mt-3 text-[11px] uppercase tracking-[.2em] text-blue-100/80">
            Same crew. A brighter tomorrow.
          </p>
        </header>

        <p className="mt-6 text-center text-sm text-blue-100/85">
          スクリーンに表示された番号を探して、カードをタップしてください
        </p>

        <div className="mt-5 w-full rounded-[28px] border-[3px] border-[#c99a45] bg-[#0b2a4a] p-4 shadow-[0_0_45px_rgba(218,177,94,.25)]">
          <div className="mb-2 grid grid-cols-5 gap-2">
            {COLUMN_LETTERS.map((letter) => (
              <div key={letter} className="text-center font-serif text-lg tracking-[.2em] text-[#d9b76a]">
                {letter}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {card.numbers.map((n, i) => {
              const isFree = i === FREE_INDEX;
              const opened = card.opened[i];
              const isReachCell = reachCells.has(i) && !opened;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  whileTap={{ scale: 0.92 }}
                  aria-pressed={opened}
                  aria-label={isFree ? "FREE" : `${n}`}
                  className={`relative grid aspect-square place-items-center rounded-lg border-2 font-serif text-xl font-semibold transition-colors ${
                    isFree
                      ? "border-[#c99a45] bg-[#08264b] text-[#d9b76a]"
                      : opened
                        ? "border-[#f0d89a] bg-[#d5b168] text-[#061a33]"
                        : "border-[#c99a45]/50 bg-[#f7f0df] text-[#08264b]"
                  }`}
                >
                  {isFree ? (
                    <span className="flex flex-col items-center leading-none">
                      <Anchor className="size-6" />
                      <span className="mt-1 text-[9px] tracking-widest">FREE</span>
                    </span>
                  ) : (
                    n
                  )}
                  {opened && !isFree && (
                    <motion.span
                      initial={{ scale: 1.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="pointer-events-none absolute inset-1 rounded-full border-2 border-[#061a33]/60"
                    />
                  )}
                  {isReachCell && (
                    <motion.span
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="pointer-events-none absolute -inset-1 rounded-lg ring-4 ring-[#f6d77a]"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex w-full items-center justify-between text-sm">
          <span>
            開いた数 <b className="text-[#d5b168]">{openedCount}</b>/{CLOSED_CELLS}
          </span>
          <span>
            リーチ <b className="text-[#f6d77a]">{reachCount}</b> ・ ビンゴ{" "}
            <b className="text-[#f6d77a]">{completeCount}</b>
          </span>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4 pt-8">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[.25em] text-blue-100/60">
            <Ship className="size-4" /> Boarding pass to a brighter tomorrow
          </p>
          <Button
            variant="outline"
            onClick={newCard}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="mr-2 size-4" />
            新しいカードを作る
          </Button>
        </div>
      </main>

      <EffectOverlay effect={effect} onClose={clearEffect} />
    </div>
  );
}
