import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

FILLER_WORDS = {
    "um", "uh", "like", "you know", "basically",
    "literally", "actually", "so", "right", "okay"
}


def extract_features(transcript: str, duration_seconds: float) -> dict:
    words = transcript.lower().split()
    word_count = len(words)
    if word_count == 0:
        return {
            "wpm": 0, "filler_rate": 0, "filler_words": [],
            "unique_word_ratio": 0, "avg_word_length": 0, "word_count": 0
        }

    filler_matches = [w for w in words if w in FILLER_WORDS]
    filler_rate = len(filler_matches) / word_count
    wpm = (word_count / max(duration_seconds, 1)) * 60
    avg_word_length = float(np.mean([len(w) for w in words]))
    unique_ratio = len(set(words)) / word_count

    return {
        "wpm": round(wpm, 1),
        "filler_rate": round(filler_rate, 3),
        "filler_words": filler_matches,
        "unique_word_ratio": round(unique_ratio, 3),
        "avg_word_length": round(avg_word_length, 2),
        "word_count": word_count,
    }


def build_confidence_pipeline() -> Pipeline:
    return Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression()),
    ])


def score_confidence(features: dict) -> float:
    """
    Heuristic confidence score 0-100.
    Replace with a trained sklearn model loaded via joblib in production.
    """
    wpm = features["wpm"]
    filler_rate = features["filler_rate"]
    unique_ratio = features["unique_word_ratio"]

    wpm_score = 100 - abs(wpm - 140) * 0.5      # ideal ~140 wpm
    filler_score = max(0, 100 - filler_rate * 500)
    vocab_score = unique_ratio * 100

    final = (wpm_score * 0.4 + filler_score * 0.4 + vocab_score * 0.2)
    return round(max(0, min(100, final)), 1)