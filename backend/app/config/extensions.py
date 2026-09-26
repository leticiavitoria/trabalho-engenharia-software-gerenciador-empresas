from flask import Flask
from flask_cors import CORS

from app.config.settings import Settings


def init_extensions(app: Flask, settings: Settings) -> None:
    CORS(app, resources={r"/api/*": {"origins": settings.cors_origins}})
