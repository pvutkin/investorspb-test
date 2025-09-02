from dataclasses import dataclass
from typing import Optional, List

@dataclass
class User:
    id: int
    telegram_id: int
    username: str
    user_type: str  # 'startup' или 'investor'
    is_verified: bool = False
    created_at: Optional[str] = None

@dataclass
class Startup:
    id: int
    name: str
    description: str
    stage: str
    industry: str
    funding_requested: Optional[float] = None
    founded_year: Optional[int] = None
    website: Optional[str] = None
    created_by: Optional[int] = None

@dataclass
class Investor:
    id: int
    name: str
    investor_type: str  # 'individual', 'fund', 'corporate'
    preferred_industries: Optional[str] = None
    preferred_stages: Optional[str] = None
    min_investment_amount: Optional[float] = None
    max_investment_amount: Optional[float] = None
    created_by: Optional[int] = None

@dataclass
class Message:
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: str
    is_read: bool = False