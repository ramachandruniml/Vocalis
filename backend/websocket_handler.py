import tempfile
from fastapi import WebSocket, WebSocketDisconnect
from firebase_admin_setup import verify_firebase_token
from analysis.speech_analyzer import extract_features, score_confidence
from llm_feedback import get_llm_feedback
from auth import ensure_user_from_token

model = None

async def interview_socket(websocket: WebSocket, token: str):
    try:
        decoded = verify_firebase_token(token)
    except Exception:
        await websocket.close(code=1008)
        return

    await websocket.accept()

    user = await ensure_user_from_token(decoded)
    if not user:
        await websocket.close(code=1008)
        return

    audio_buffer = bytearray()
    duration_seconds = 0.0
    session_segments = []
    CHUNK_THRESHOLD = 80_000

    try:
        while True:
            chunk = await websocket.receive_bytes()
            audio_buffer.extend(chunk)
            duration_seconds += 1.0

            if len(audio_buffer) >= CHUNK_THRESHOLD:
                transcript = await transcribe(bytes(audio_buffer))
                features = extract_features(transcript, duration_seconds)
                confidence = score_confidence(features)
                feedback = await get_llm_feedback(transcript, features)

                segment = {
                    "transcript": transcript,
                    "features": features,
                    "confidence_score": confidence,
                    "feedback": feedback,
                }
                session_segments.append(segment)
                await websocket.send_json(segment)
                audio_buffer.clear()
                duration_seconds = 0.0

    except WebSocketDisconnect:
        if session_segments:
            avg_confidence = sum(s["confidence_score"] for s in session_segments) / len(session_segments)
            avg_wpm = sum(s["features"]["wpm"] for s in session_segments) / len(session_segments)
            avg_filler = sum(s["features"]["filler_rate"] for s in session_segments) / len(session_segments)
            total_words = sum(s["features"]["word_count"] for s in session_segments)

            session = await db.session.create(data={
                "userId": user.id,
                "avgConfidence": avg_confidence,
                "segmentCount": len(session_segments),
                "totalWords": total_words,
                "avgWpm": avg_wpm,
                "avgFillerRate": avg_filler,
            })

            for seg in session_segments:
                await db.segment.create(data={
                    "sessionId": session.id,
                    "transcript": seg["transcript"],
                    "confidence": seg["confidence_score"],
                    "wpm": seg["features"]["wpm"],
                    "fillerRate": seg["features"]["filler_rate"],
                    "fillerWords": seg["features"]["filler_words"],
                    "uniqueWordRatio": seg["features"]["unique_word_ratio"],
                    "feedback": seg["feedback"],
                })

async def transcribe(audio_bytes: bytes) -> str:
    global model
    if model is None:
        try:
            import whisper
            model = whisper.load_model("base")
        except Exception as e:
            print(f"Warning: whisper model unavailable: {e}")
            return ""

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=True) as f:
        f.write(audio_bytes)
        f.flush()
        result = model.transcribe(f.name)
    return result["text"].strip()
