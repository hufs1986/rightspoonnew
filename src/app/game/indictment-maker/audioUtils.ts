let audioCtx: AudioContext | null = null;

export function initAudio() {
    if (typeof window !== "undefined" && !audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

export function playSfx(type: "click" | "hit" | "defend" | "alert" | "win" | "lose") {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    switch (type) {
        case "click":
            osc.type = "sine";
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
            
        case "defend": // 경쾌한 타격음 (촥!)
            osc.type = "triangle";
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;
            
        case "hit": // 둔탁한 피격음 (쿵!)
            osc.type = "square";
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
            
        case "alert": // 사이렌
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.2);
            osc.frequency.linearRampToValueAtTime(400, now + 0.4);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;
            
        case "win": // 승리 팡파레 느낌
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554, now + 0.1);
            osc.frequency.setValueAtTime(659, now + 0.2);
            osc.frequency.setValueAtTime(880, now + 0.3);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
            osc.start(now);
            osc.stop(now + 0.8);
            break;

        case "lose": // 패배 (뚜우우웅...)
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 1);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.start(now);
            osc.stop(now + 1);
            break;
    }
}
