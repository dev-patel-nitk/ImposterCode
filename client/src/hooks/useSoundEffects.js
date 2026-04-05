import { useCallback, useRef } from "react";

const useSoundEffects = () => {
  const audioCtxRef = useRef(null);

  const getCtx = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playSynthesizedSound = useCallback((type) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "BWONG") {
        // Among Us Meeting Sound (Low intense frequency sweep)
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.8);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        
        osc.start(now);
        osc.stop(now + 1.5);
      } 
      else if (type === "BEEP") {
        // Countdown Beep
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.2);
      }
      else if (type === "VICTORY") {
        // Ascension scale
        osc.type = "sine";
        
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.15); // C#
        osc.frequency.setValueAtTime(659.25, now + 0.3);  // E
        osc.frequency.setValueAtTime(880, now + 0.45);    // A (Octave)
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now + 0.45);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

        osc.start(now);
        osc.stop(now + 1.5);
      }
      else if (type === "DEFEAT") {
        // Descending dissonant synth
        osc.type = "sawtooth";
        
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 1.5);
        
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        
        osc.start(now);
        osc.stop(now + 1.5);
      }
      else if (type === "REVEAL") {
        // Quick "Whoosh"
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.log("Audio play prevented:", e);
    }
  }, []);

  return { playSound: playSynthesizedSound };
};

export default useSoundEffects;
