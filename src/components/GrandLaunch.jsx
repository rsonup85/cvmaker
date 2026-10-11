import React, { useEffect, useState } from "react";
import "./GrandLaunch.css";

const STEPS = [
  { kicker: "WELCOME TO", title: "CVMaker", sub: "Your Career. Your Future. Your Professional Identity." },
  { kicker: "CREATE • DESIGN • IMPRESS", title: "Build Your Future", sub: "Craft a professional resume that represents you." },
  { kicker: "READY WHEN YOU ARE", title: "Let's Build Your Future →", sub: "Your professional resume starts here." },
];

export function GrandLaunch({ enabled, onComplete }) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const timers = [setTimeout(() => setStep(1), 1500), setTimeout(() => setStep(2), 3000), setTimeout(() => setLeaving(true), 4300), setTimeout(() => onComplete?.(), 5000)];
    return () => timers.forEach(clearTimeout);
  }, [enabled]);
  if (!enabled) return null;
  const s = STEPS[step];
  const finish = () => { setLeaving(true); setTimeout(() => onComplete?.(), 650); };
  return <div className={`grand-launch ${leaving ? "grand-launch--leaving" : ""}`} role="dialog" aria-label="CVMaker Grand Launch">
    <div className="grand-launch__aurora" /><div className="grand-launch__grid" />
    <div className="grand-launch__particles" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{left:`${(i*17)%100}%`,top:`${(i*29)%100}%`}} />)}</div>
    <div className="grand-launch__documents" aria-hidden="true"><span/><span/><span/><span/></div>
    <div className="grand-launch__content">
      <div className="grand-launch__mark">CV<span>•</span></div>
      <div className="grand-launch__kicker" key={`k-${step}`}>{s.kicker}</div>
      <h1 key={`t-${step}`} className="grand-launch__title">{s.title}</h1>
      <p key={`s-${step}`} className="grand-launch__sub">{s.sub}</p>
      <div className="grand-launch__line"><span/></div>
      <div className="grand-launch__brand">CVMAKER <b>AI</b></div>
    </div>
    <button className="grand-launch__skip" onClick={finish}>Skip</button>
  </div>;
}
