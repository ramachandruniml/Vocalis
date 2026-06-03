import os
import tempfile
import whisper
from fastapi import WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from analysis.speech_analyzer import extract_features, score_confidence
from llm_feedback import get_llm_feedback

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"

model = whisper.load_model("base")


async def interview_socket(websocket: WebSocket, token: str):
    # Authenticate before accepting
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    audio_buffer = bytearray()
    duration_seconds = 0.0
    CHUNK_THRESHOLD = 80_000  # ~5 seconds of audio

    try:
        while True:
            chunk = await websocket.receive_bytes()
            audio_buffer.extend(chunk)
            duration_seconds += 1.0  # 1 chunk = ~1 second

            if len(audio_buffer) >= CHUNK_THRESHOLD:
                transcript = await transcribe(bytes(audio_buffer))
                features = extract_features(transcript, duration_seconds)
                confidence = score_confidence(features)
                feedback = await get_llm_feedback(transcript, features)

                await websocket.send_json({
                    "transcript": transcript,
                    "features": features,
                    "confidence_score": confidence,
                    "feedback": feedback,
                })

                audio_buffer.clear()
                duration_seconds = 0.0

    except WebSocketDisconnect:
        pass


async def transcribe(audio_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=True) as f:
        f.write(audio_bytes)
        f.flush()
        result = model.transcribe(f.name)
    return result["text"].strip()