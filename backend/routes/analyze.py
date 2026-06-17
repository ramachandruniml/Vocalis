from fastapi import APIRouter, Depends, UploadFile, File, Form
from auth import get_current_user
from analysis.speech_analyzer import extract_features, score_confidence
from llm_feedback import get_llm_feedback, transcribe_with_groq

router = APIRouter()


@router.post("/analyze")
async def analyze_answer(
    audio: UploadFile = File(...),
    question: str = Form(""),
    duration: float = Form(5.0),
    current_user=Depends(get_current_user),
):
    audio_bytes = await audio.read()

    # Use Groq Whisper for transcription — no local install, no Windows file issues
    transcript = await transcribe_with_groq(audio_bytes, audio.filename or "recording.webm")

    features = extract_features(transcript, max(duration, 1.0))
    confidence = score_confidence(features)
    feedback = await get_llm_feedback(transcript, features, question)

    return {
        "transcript": transcript,
        "features": features,
        "confidence_score": confidence,
        "feedback": feedback,
    }
