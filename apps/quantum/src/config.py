"""
Configuration management using Pydantic Settings.

All sensitive values are loaded from environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    model_config = SettingsConfigDict(
        # Load from local .env first, then fall back to root .env
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Service configuration
    port: int = 18742
    debug: bool = False

    # IonQ configuration
    ionq_api_key: str = ""
    ionq_use_simulator: bool = True  # Default to simulator for development

    # Quantum circuit defaults
    default_trait_qubits: int = 5
    default_shots: int = 100


settings = Settings()
