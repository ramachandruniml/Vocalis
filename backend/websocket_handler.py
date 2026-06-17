import os
import tempfile
from fastapi import WebSocket, WebSocketDisconnect
from firebase_admin_setup import verify_firebase_token
from analysis.speech_analyzer import extract_features, score_confidence
from llm_feedback import get_llm_feedback
from auth import ensure_user_from_token
from database import get_db

_whisper_model = None


async def interview_socket(websocket: WebSocket, token: str, question: str = ""):
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

    async def analyze_buffer() -> dict | None:
        """Process the accumulated audio and return a segment dict, or None on failure."""
        nonlocal audio_buffer, duration_seconds
        buf = bytes(audio_buffer)
        dur = max(duration_seconds, 1.0)
        audio_buffer.clear()
        duration_seconds = 0.0

        if len(buf) < 500:
            return None

        try:
            transcript = await transcribe(buf)
            features = extract_features(transcript, dur)
            confidence = score_confidence(features)
            feedback = await get_llm_feedback(transcript, features, question)
            return {
                "transcript": transcript,
                "features": features,
                "confidence_score": confidence,
                "feedback": feedback,
            }
        except Exception as e:
            print(f"Analysis error: {e}")
            return None

    try:
        while True:
            message = await websocket.receive()

            if message.get("type") == "websocket.disconnect":
                break

            # Frontend sends "STOP" when user clicks Stop recording
            if message.get("text") == "STOP":
                seg = await analyze_buffer()
                if seg:
                    session_segments.append(seg)
                    try:
                        await websocket.send_json(seg)
                    except Exception:
                        pass
                break

            # Accumulate incoming audio bytes — no auto-analysis mid-recording
            chunk = message.get("bytes")
            if chunk:
                audio_buffer.extend(chunk)
                duration_seconds += 1.0

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket handler error: {e}")
    finally:
        if session_segments:
            try:
                db = get_db()
                avg_confidence = sum(s["confidence_score"] for s in session_segments) / len(session_segments)
                avg_wpm       = sum(s["features"]["wpm"]         for s in session_segments) / len(session_segments)
                avg_filler    = sum(s["features"]["filler_rate"] for s in session_segments) / len(session_segments)
                total_words   = sum(s["features"]["word_count"]  for s in session_segments)

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
                        "sessionId":       session.id,
                        "transcript":      seg["transcript"],
                        "confidence":      seg["confidence_score"],
                        "wpm":             seg["features"]["wpm"],
                        "fillerRate":      seg["features"]["filler_rate"],
                        "fillerWords":     seg["features"]["filler_words"],
                        "uniqueWordRatio": seg["features"]["unique_word_ratio"],
                        "feedback":        seg["feedback"],
                    })
            except Exception as e:
                print(f"Error saving session: {e}")


async def transcribe(audio_bytes: bytes) -> str:
    global _whisper_model
    if _whisper_model is None:
        try:
            import whisper
            _whisper_model = whisper.load_model("base")
        except Exception as e:
            print(f"Whisper unavailable: {e}")
            return ""

    if _whisper_model is None:
        return ""

    # Windows-safe: write then CLOSE the file before whisper opens it by path.
    # NamedTemporaryFile(delete=True) keeps the handle open on Windows, causing
    # a PermissionError when whisper tries to re-open the same path.
    tmp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
            f.write(audio_bytes)
            tmp_path = f.name
        # File is now closed — whisper can open it on Windows
        result = _whisper_model.transcribe(tmp_path)
        return result["text"].strip()
    except Exception as e:
        print(f"Transcription failed: {e}")
        return ""
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
