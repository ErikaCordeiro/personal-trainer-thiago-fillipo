import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


HEX_COLOR = re.compile(r"^#[0-9A-Fa-f]{6}$")


class BrandingUpdate(BaseModel):
    display_name: str = Field(min_length=2, max_length=160)
    logo_url: str | None = Field(default=None, max_length=500)
    profile_image_url: str | None = Field(default=None, max_length=500)
    primary_color: str = "#050505"
    secondary_color: str = "#C0C0C0"
    icon_url: str | None = Field(default=None, max_length=500)
    login_subtitle: str | None = Field(default=None, max_length=180)

    @field_validator("primary_color", "secondary_color")
    @classmethod
    def valid_color(cls, value: str) -> str:
        if not HEX_COLOR.match(value):
            raise ValueError("Use uma cor hexadecimal no formato #RRGGBB")
        return value.upper()


class BrandingRead(BrandingUpdate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID | None = None
    personal_id: uuid.UUID
    is_fallback: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None
