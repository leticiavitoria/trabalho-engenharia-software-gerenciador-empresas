import atexit

from flask import Blueprint, Flask, jsonify

from app.config.extensions import init_extensions
from app.config.settings import Settings
from app.infrastructure.database import close_pool, get_connection, init_pool
from app.modules.companies.routes.routes import companies_bp
from app.modules.permissions.routes.routes import permissions_bp
from app.modules.users.routes.routes import users_bp
from app.shared.errors import register_error_handlers


def create_app(settings: Settings | None = None) -> Flask:
    settings = settings or Settings.from_env()

    app = Flask(__name__)
    app.json.ensure_ascii = False
    app.json.sort_keys = False

    init_extensions(app, settings)
    init_pool(app, settings.database_url)
    atexit.register(close_pool, app)
    register_error_handlers(app)

    @app.get("/")
    def root():
        return {"status": "ok"}

    api = Blueprint("api", __name__, url_prefix="/api")

    @api.get("/health")
    def health():
        with get_connection() as conn:
            conn.execute("SELECT 1")
        return jsonify({"status": "ok", "database": "ok"})

    api.register_blueprint(companies_bp)
    api.register_blueprint(users_bp)
    api.register_blueprint(permissions_bp)
    app.register_blueprint(api)

    return app
