from app.config.environment import env
from app.main import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(env("PORT", "5000")), debug=env("FLASK_DEBUG") == "1")
