import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { micSupported } from "./audio/micState";
import { startPreload } from "./hooks/usePreload";
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
  const [stage, setStage] = useState<Stage>(micSupported() ? "gate" : "loader");

  // Warm every photo & font while she reads the microphone screen,
  // so the whole journey scrolls without a single hitch.
  useEffect(() => {
    startPreload();
  }, []);

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
