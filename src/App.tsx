import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { micSupported } from "./audio/micState";
import { startPreload } from "./hooks/usePreload";
import CountdownGate, { UNLOCK_DATE } from "./components/CountdownGate";
import Backdrop from "./components/Backdrop";
import CursorGlow from "./components/CursorGlow";
import ProgressBar from "./components/ProgressBar";
import TapHearts from "./components/TapHearts";
import NoCopy from "./components/NoCopy";
import IntroGate from "./components/IntroGate";
import Loader from "./components/Loader";
import Hero from "./components/Hero";
import StickyPhrases from "./components/StickyPhrases";
import Eighteen from "./components/Eighteen";
import Moments from "./components/Moments";
import Gallery from "./components/Gallery";
import Marquee from "./components/Marquee";
import MusicToggle from "./components/MusicToggle";
import Wishes from "./components/Wishes";
import LoveNotes from "./components/LoveNotes";
import Reasons from "./components/Reasons";
import Finale from "./components/Finale";
import GreetingCard from "./components/GreetingCard";
import Footer from "./components/Footer";

type Stage = "gate" | "loader" | "main";

export default function App() {
  // Locked until midnight — the countdown gate owns the screen.
  const [locked] = useState(() => Date.now() < UNLOCK_DATE.getTime());

  const [stage, setStage] = useState<Stage>(micSupported() ? "gate" : "loader");

  useEffect(() => {
    startPreload();
  }, []);

  if (locked) {
    return (
      <div className="relative min-h-screen bg-ink font-sans text-stone-100">
        <NoCopy />
        <CountdownGate onUnlock={() => setTimeout(() => window.location.reload(), 400)} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-ink font-sans text-stone-100">
      <NoCopy />

      {stage === "main" && (
        <>
          <Backdrop />
          <CursorGlow />
          <ProgressBar />
          <TapHearts />
        </>
      )}

      <AnimatePresence mode="wait">
        {stage === "gate" && (
          <IntroGate key="gate" onFinish={() => setStage("loader")} />
        )}
        {stage === "loader" && (
          <Loader key="loader" onDone={() => setStage("main")} />
        )}
      </AnimatePresence>

      {stage === "main" && (
        <main className="relative z-10">
          <Hero ready />
          <StickyPhrases />
          <Eighteen />
          <Moments />
          <Gallery />
          <Marquee />
          <Wishes />
          <LoveNotes />
          <Reasons />
          <Finale />
          <GreetingCard />
          <Footer />
        </main>
      )}

      <MusicToggle active={stage === "main"} />
    </div>
  );
}
