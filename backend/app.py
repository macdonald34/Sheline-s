import os
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

def create_app():
    app = Flask(__name__, static_folder=str(BASE_DIR / "static"), static_url_path="/")
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f"sqlite:///{BASE_DIR / 'data.db'}")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app)

    # import models and api to register DB and blueprints
    from models import db, init_db
    from api import api_bp
    from schemas import ma

    db.init_app(app)
    ma.init_app(app)
    app.register_blueprint(api_bp)

    # Ensure DB tables exist at startup
    init_db(app)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        # Serve frontend static files (built `dist` copied into backend/static)
        if path != "" and (BASE_DIR / 'static' / path).exists():
            return send_from_directory(app.static_folder, path)
        index_file = BASE_DIR / 'static' / 'index.html'
        if index_file.exists():
            return send_from_directory(app.static_folder, 'index.html')
        return ("Frontend not built. Run frontend build and copy into backend/static", 501)

    # `init_db` already called at startup; no before_first_request decorator used

    # JSON error handlers
    from flask import jsonify

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': 'bad request', 'message': getattr(e, 'description', str(e))}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'internal server error'}), 500

    return app


app = create_app()


if __name__ == '__main__':
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=debug)