import os
from flask import Flask
from flask_login import LoginManager
from .models import db, User
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from application import workers
from application import tasks
from flask_caching import Cache

app = None
celery = None
cache = Cache(config={'CACHE_TYPE': 'RedisCache', 'CACHE_REDIS_HOST': 'localhost', 'CACHE_REDIS_PORT': 6379, 'CACHE_DEFAULT_TIMEOUT': 10})


def create_app():
    current_dir = os.path.abspath(os.path.dirname(__file__))
    global app
    app = Flask(__name__, static_folder="static", static_url_path="/static")
    bcrypt = Bcrypt(app)
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "login"
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///" + os.path.join(current_dir, "IITM_AppDev2_Final.db")
    db.init_app(app)
    app.app_context().push()
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SECRET_KEY"] = "abcdefghijklmnopqrstuvwxyz"
    # app.config["CACHE_TYPE"] = "RedisCache"
    # app.config["CACHE_REDIS_HOST"] = "localhost"
    # app.config["CACHE_REDIS_PORT"] = 6379

    # CELERY_BROKER_URL = "redis://localhost:6379/0"
    # CELERY_RESULT_BACKEND = "redis://localhost:6379/0"

    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND = os.getenv("CELERY_BROKER_URL")
    
    from .controllers import main
    app.register_blueprint(main)

    global celery
    celery = workers.celery
    celery.conf.update(
        broker_url = CELERY_BROKER_URL,
        result_backend = CELERY_RESULT_BACKEND,
        enable_utc  = False,
        timezone = "Asia/Calcutta"
    )
    celery.Task = workers.ContextTask
    app.app_context().push()

    global cache
    cache.init_app(app)
    app.app_context().push()
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    return app
