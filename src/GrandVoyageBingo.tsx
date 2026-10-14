import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Ship, RotateCcw, Play, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX = 75;
const ROLL_TICKS = 18;
const ROLL_INTERVAL_MS = 85;

export default function GrandVoyageBingo() {
  const [called, setCalled] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const timerRef = useRef<number | null>(null);

  const remaining = useMemo(
    () => Array.from({ length: MAX }, (_, i) => i + 1).filter((n) => !called.includes(n)),
    [called]
  );

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // アンマウント時にタイマーを止める
  useEffect(() => clearTimer, []);

  const pickRandom = (pool: number[]) => pool[Math.floor(Math.random() * pool.length)];

  const draw = () => {
    if (rolling || remaining.length === 0) return;

    // 当選番号を先に決めてから、演出用の数字をランダムに回す
    const winner = pickRandom(remaining);
    const pool = remaining;
    setRolling(true);

    let ticks = 0;
    timerRef.current = window.setInterval(() => {
      ticks += 1;
      if (ticks >= ROLL_TICKS) {
        clearTimer();
        setCurrent(winner);
        setCalled((prev) => [...prev, winner]);
        setRolling(false);
        return;
      }
      setCurrent(pickRandom(pool));
    }, ROLL_INTERVAL_MS);
  };

  const reset = () => {
    clearTimer();
    setCalled([]);
    setCurrent(null);
    setRolling(false);
  };

  const fullscreen = () => document.documentElement.requestFullscreen?.();

  return (
    <div className="min-h-screen overflow-hidden bg-[#061a33] text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_42%,rgba(49,114,169,.28),transparent_28%),linear-gradient(180deg,#0d3767_0%,#08264b_55%,#041326_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 opacity-50 bg-[linear-gradient(175deg,transparent_0_30%,#0b5480_31_43%,#082f52_44_57%,#061e38_58%)]" />

      <main className="relative z-10 min-h-screen p-6 lg:p-10 grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 text-[#d9b76a] uppercase tracking-[.28em] text-xs">
              <Compass className="size-5" /> Year End Party 2026
            </div>
            <h1 className="mt-5 text-4xl lg:text-5xl font-serif font-semibold leading-none">Grand<br/>Voyage</h1>
            <div className="mt-5 h-px w-32 bg-[#d9b76a]" />
            <p className="mt-5 text-sm tracking-[.18em] text-blue-100 uppercase leading-7">Same crew.<br/>A brighter tomorrow.</p>
          </div>

          <div className="hidden lg:block rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <Ship className="size-9 text-[#d9b76a] mb-3" />
            <p className="font-serif text-xl">Next Voyage 2027</p>
            <p className="mt-2 text-xs text-blue-100/75 leading-5">Explore · Connect · Celebrate</p>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center">
          <div className="uppercase tracking-[.35em] text-xs text-blue-100/70 mb-4">Bingo Number</div>
          <motion.div
            animate={{ rotate: rolling ? 360 : 0 }}
            transition={{ duration: rolling ? 1.5 : .4, ease: "easeInOut" }}
            className="relative size-[280px] sm:size-[350px] lg:size-[410px] rounded-full border-[12px] border-[#c99a45] shadow-[0_0_45px_rgba(218,177,94,.28)] bg-[#f7f0df] flex items-center justify-center"
          >
            <div className="absolute inset-4 rounded-full border border-[#b98c45]/50" />
            <div className="absolute w-[86%] h-px bg-[#bb9b65]/30" />
            <div className="absolute h-[86%] w-px bg-[#bb9b65]/30" />
            <AnimatePresence mode="wait">
              <motion.div key={current ?? "empty"} initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.15 }} className="relative text-[#08264b] text-8xl lg:text-[9rem] leading-none font-serif font-semibold">
                {current ?? "?"}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <Button onClick={draw} disabled={rolling || remaining.length === 0} className="mt-7 rounded-full bg-[#d5b168] hover:bg-[#e7c77d] text-[#061a33] px-10 py-6 text-lg font-bold shadow-xl">
            <Play className="mr-2 size-5 fill-current" /> {rolling ? "航海中…" : remaining.length === 0 ? "抽選終了" : "次の番号を抽選"}
          </Button>

          <div className="mt-7 w-full max-w-xl rounded-2xl border border-white/15 bg-white/[.08] p-4 backdrop-blur-sm">
            <div className="text-center text-[10px] uppercase tracking-[.3em] text-blue-100/65 mb-3">Recent Numbers</div>
            <div className="flex justify-center gap-3 flex-wrap min-h-12">
              {called.slice(-5).reverse().map((n, i) => (
                <div key={n} className={`size-11 rounded-full grid place-items-center border ${i===0 ? "bg-[#d5b168] border-[#e9ce91] text-[#061a33]" : "bg-white/10 border-white/20"} font-semibold`}>{n}</div>
              ))}
              {called.length === 0 && <span className="text-sm text-blue-100/40 py-3">抽選を開始してください</span>}
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-3 flex flex-col">
          <div className="rounded-2xl border border-white/15 bg-white/[.07] p-5 backdrop-blur-sm flex-1 max-h-[72vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[.26em] text-blue-100/60">Called Numbers</div>
                <div className="font-serif text-2xl mt-1">航海記録</div>
              </div>
              <div className="text-[#d5b168] font-semibold">{called.length}/{MAX}</div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: MAX }, (_, i) => i + 1).map((n) => {
                const hit = called.includes(n);
                return <div key={n} className={`aspect-square rounded-lg grid place-items-center text-sm border ${hit ? "bg-[#d5b168] border-[#e9ce91] text-[#061a33] font-bold" : "bg-black/10 border-white/10 text-white/35"}`}>{n}</div>;
              })}
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={reset} className="bg-transparent border-white/20 text-white hover:bg-white/10"><RotateCcw className="size-4 mr-2"/>リセット</Button>
            <Button variant="outline" onClick={fullscreen} className="bg-transparent border-white/20 text-white hover:bg-white/10"><Maximize2 className="size-4 mr-2"/>全画面</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
