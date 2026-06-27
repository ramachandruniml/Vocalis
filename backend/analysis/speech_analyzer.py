import re
import numpy as np

FILLER_WORDS = {
    # Vocal disfluencies (unambiguous)
    "um", "uh", "hmm", "er", "ah", "uhh", "umm",
    # Common single-word fillers
    "like", "literally", "basically",
    "okay", "yeah", "yep", "alright",
    "well", "right", "so",
}

# Multi-word filler phrases — matched before single-word pass
FILLER_PHRASES = [
    "you know",
    "i mean",
    "kind of",
    "sort of",
    "i guess",
    "you see",
]


def extract_features(transcript: str, duration_seconds: float) -> dict:
    text = transcript.lower()
    # Proper tokenization: strips punctuation so "um," and "um." both match "um"
    clean_words = re.findall(r"\b[a-z']+\b", text)
    word_count = len(clean_words)

    if word_count == 0:
        return {
            "wpm": 0, "filler_rate": 0, "filler_words": [],
            "unique_word_ratio": 0, "avg_word_length": 0, "word_count": 0,
        }

    # Detect multi-word phrases first
    filler_matches: list[str] = []
    for phrase in FILLER_PHRASES:
        pattern = r"\b" + re.escape(phrase) + r"\b"
        count = len(re.findall(pattern, text))
        filler_matches.extend([phrase] * count)

    # Detect single-word fillers
    for word in clean_words:
        if word in FILLER_WORDS:
            filler_matches.append(word)

    filler_rate = len(filler_matches) / word_count
    wpm = (word_count / max(duration_seconds, 1)) * 60
    avg_word_length = float(np.mean([len(w) for w in clean_words]))
    unique_ratio = len(set(clean_words)) / word_count

    return {
        "wpm": round(wpm, 1),
        "filler_rate": round(filler_rate, 3),
        "filler_words": filler_matches,
        "unique_word_ratio": round(unique_ratio, 3),
        "avg_word_length": round(avg_word_length, 2),
        "word_count": word_count,
    }


def score_confidence(features: dict) -> float:
    wpm = features.get("wpm", 0)
    filler_rate = features.get("filler_rate", 0)
    unique_ratio = features.get("unique_word_ratio", 0)
    word_count = features.get("word_count", 0)

    if word_count == 0:
        return 0.0

    # WPM score: smooth curve peaked at 130–160 WPM with a ±15 grace zone
    wpm_deviation = max(0, abs(wpm - 145) - 15)
    wpm_score = max(0.0, 100 - wpm_deviation * 0.8)

    # Filler score: exponential decay — penalizes fillers increasingly harshly
    # 0% → 100, 5% → 66, 10% → 43, 20% → 17
    filler_score = max(0.0, 100.0 * (1 - min(filler_rate, 1.0)) ** 8)

    # Vocabulary score: normalize expectation for answer length
    # Longer answers naturally have lower unique ratios — compensate for this
    expected_unique = max(0.30, 0.90 - (word_count * 0.001))
    vocab_score = min(100.0, (unique_ratio / expected_unique) * 75)

    final = wpm_score * 0.35 + filler_score * 0.45 + vocab_score * 0.20
    return round(max(0.0, min(100.0, final)), 1)
