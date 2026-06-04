import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
export default function Waveform({ analyserRef, active }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(0);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        const draw = () => {
            rafRef.current = requestAnimationFrame(draw);
            const analyser = analyserRef.current;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            if (!analyser || !active) {
                // idle flat line
                ctx.strokeStyle = "#222222";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, h / 2);
                ctx.lineTo(w, h / 2);
                ctx.stroke();
                return;
            }
            const buffer = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteTimeDomainData(buffer);
            ctx.strokeStyle = "#c8f564";
            ctx.lineWidth = 1.5;
            ctx.shadowColor = "#c8f564";
            ctx.shadowBlur = 6;
            ctx.beginPath();
            buffer.forEach((val, i) => {
                const x = (i / buffer.length) * w;
                const y = ((val - 128) / 128) * (h / 2) + h / 2;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;
        };
        draw();
        return () => cancelAnimationFrame(rafRef.current);
    }, [active, analyserRef]);
    return (_jsx("canvas", { ref: canvasRef, width: 800, height: 80, style: { width: "100%", height: "80px", display: "block" } }));
}
