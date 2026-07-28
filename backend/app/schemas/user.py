from datetime import datetime

from pydantic import Field

from app.schemas.base import CamelModel


class UserOut(CamelModel):
    id: str
    email: str
    name: str
    plan: str
    role: str
    email_verified: bool
    purchased_courses: list[str] = Field(default_factory=list)
    completed_lessons: list[str] = Field(default_factory=list)
    last_activity: dict[str, str] = Field(default_factory=dict)
    created_at: datetime
