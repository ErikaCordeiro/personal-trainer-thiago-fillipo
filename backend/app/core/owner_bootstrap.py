import unicodedata


_WRAPPING_QUOTES = {'"', "'", "“", "”", "‘", "’"}


def normalize_owner_email(value: str | None) -> str:
    """Normalize deployment copy/paste artifacts in the bootstrap email."""
    normalized = unicodedata.normalize("NFKC", value or "")
    normalized = "".join(
        char
        for char in normalized
        if not unicodedata.category(char).startswith("C")
        and not unicodedata.category(char).startswith("Z")
    )
    return normalized.strip().lower()


def normalize_owner_password(value: str | None) -> str:
    """Normalize invisible deployment artifacts without weakening passwords."""
    normalized = unicodedata.normalize("NFKC", value or "")
    normalized = "".join(
        char for char in normalized if not unicodedata.category(char).startswith("C")
    ).strip()
    if len(normalized) >= 2 and normalized[0] == normalized[-1] and normalized[0] in _WRAPPING_QUOTES:
        normalized = normalized[1:-1].strip()
    return normalized
