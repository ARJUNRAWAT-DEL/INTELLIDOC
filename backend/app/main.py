from fastapi import FastAPI, Depends, File, UploadFile, HTTPException, Query, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
import time
from datetime import datetime
from typing import List, Optional
import os
import json
import urllib.parse
import requests
import time
import smtplib
from email.message import EmailMessage
import hashlib
import secrets
from datetime import timedelta

# Relative imports for proper module structure
from . import db, crud, schemas
from .config import settings
from .logger import logger
from .validators import validate_file
from .background_tasks import process_document_async, generate_task_id, get_task_status, cleanup_old_tasks

# Dual Answer System: Local Models + GROQ via MCP
USE_DUAL_ANSWERS = getattr(settings, 'use_dual_answers', True)
USE_GROQ = getattr(settings, 'use_groq', True)

# Import both systems
from . import ai_utils  # Your existing working models
from . import model_manager_simple  # simplified model manager module (instantiate at startup)
model_manager = None  # will be created on startup to avoid heavy import-time work
from .cache_manager import cache_manager
from .dual_answer_system import generate_dual_answers

# GROQ MCP client for second opinion
groq_client = None
if USE_GROQ:
    try:
        from groq import Groq
        import os
        groq_api_key = getattr(settings, 'groq_api_key', None) or os.getenv("GROQ_API_KEY")
        if groq_api_key:
            groq_client = Groq(api_key=groq_api_key)
            logger.info("GROQ client initialized for dual answers")
        else:
            logger.warning("GROQ_API_KEY not found - running local models only")
    except ImportError:
        logger.warning("GROQ package not installed - running local models only")

# Use your existing ai_utils as primary system
active_ai_utils = ai_utils
logger.info("Using local models as primary + GROQ for dual answers" if groq_client else "Using local models only")

# Initialize FastAPI app
app = FastAPI(
    title="AI Document Search Tool",
    description="AI-powered document search with semantic understanding",
    version="1.0.0"
)

# CORS middleware (accept str or list in settings.allowed_origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        settings.allowed_origins
        if isinstance(settings.allowed_origins, list)
        else [settings.allowed_origins]
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    """Database dependency"""
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.log_level == "DEBUG" else "An error occurred"
        }
    )

# Startup event
@app.on_event("startup")
def startup_event():
    try:
        # Create tables if they don't exist
        from .database_init import create_tables
        create_tables()

        # Test database connection
        insp = inspect(db.engine)
        tables = insp.get_table_names()
        logger.info(f"Connected to DB. Found tables: {tables}")

        # Initialize your existing local models (primary system)
        logger.info("Initializing your local AI models...")
        # Instantiate simplified model manager here to avoid heavy work at import time (helps reload on Windows)
        global model_manager
        if model_manager is None:
            try:
                model_manager = model_manager_simple.SimplifiedModelManager()
            except Exception as e:
                logger.error(f"Failed to initialize SimplifiedModelManager: {e}")
                model_manager = None

        model_info = model_manager.get_model_info() if model_manager else {"device": "unknown"}
        logger.info(f"Local models initialized on device: {model_info.get('device')}")
        
        # Test GROQ connection if enabled
        global groq_client
        if groq_client and USE_GROQ:
            try:
                # Test GROQ with a simple call
                test_response = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": "Hello"}],
                    max_tokens=10
                )
                logger.info("GROQ connection verified - dual answers enabled")
            except Exception as e:
                logger.warning(f"GROQ test failed, disabling: {e}")
                groq_client = None

    except Exception as e:
        logger.error(f"Startup failed: {e}")
        # Don't crash the server; just log the error
        logger.warning("Server starting with limited functionality")

# Shutdown event
@app.on_event("shutdown")
def shutdown_event():
    logger.info("Shutting down...")
    cleanup_old_tasks(max_age_hours=1)  # Clean up recent tasks on shutdown
    logger.info("Local models and GROQ client shutdown complete")

# Health check endpoint
@app.get("/health", response_model=schemas.HealthCheck)
def health_check(db: Session = Depends(get_db)):
    try:
        # Test DB connection
        db.execute(text("SELECT 1"))
        db_status = "connected"

        # Get model info from your local models
        model_info = model_manager.get_model_info()
        model_info["groq_enabled"] = groq_client is not None
        model_info["dual_answers"] = USE_DUAL_ANSWERS and groq_client is not None

        return schemas.HealthCheck(
            status="healthy",
            database=db_status,
            models=model_info,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return schemas.HealthCheck(
            status="unhealthy",
            database="disconnected",
            models={},
            timestamp=datetime.utcnow()
        )

# -------------------- OAuth (server-managed) --------------------
@app.get("/auth/config")
def auth_config():
    """
    Return which OAuth providers are configured on the server.
    Frontend can use this to decide whether to open a real provider popup or use the dev fallback.
    """
    google_id = getattr(settings, 'google_client_id', None) or os.getenv('GOOGLE_CLIENT_ID')
    google_secret = getattr(settings, 'google_client_secret', None) or os.getenv('GOOGLE_CLIENT_SECRET')
    github_id = getattr(settings, 'github_client_id', None) or os.getenv('GITHUB_CLIENT_ID')
    github_secret = getattr(settings, 'github_client_secret', None) or os.getenv('GITHUB_CLIENT_SECRET')

    return {
        "google": bool(google_id and google_secret),
        "github": bool(github_id and github_secret)
    }


@app.get("/auth/diag")
def auth_diag():
    """
    Diagnostic endpoint (safe): returns which candidate .env files exist on disk
    and booleans indicating whether the running process currently sees the
    OAuth env vars. Does NOT return secret values.
    """
    try:
        base = os.path.dirname(os.path.abspath(__file__))  # backend/app
        candidates = {
            "app_env": os.path.abspath(os.path.join(base, '.env')),
            "backend_env": os.path.abspath(os.path.join(base, '..', '.env')),
            "repo_env": os.path.abspath(os.path.join(base, '..', '..', '.env')),
        }
        exists = {k: os.path.exists(v) for k, v in candidates.items()}
        # Which vars the process sees (booleans only)
        google_id = getattr(settings, 'google_client_id', None) or os.getenv('GOOGLE_CLIENT_ID')
        google_secret = getattr(settings, 'google_client_secret', None) or os.getenv('GOOGLE_CLIENT_SECRET')
        github_id = getattr(settings, 'github_client_id', None) or os.getenv('GITHUB_CLIENT_ID')
        github_secret = getattr(settings, 'github_client_secret', None) or os.getenv('GITHUB_CLIENT_SECRET')

        return {
            "env_candidates": candidates,
            "files_exist": exists,
            "google_seen": bool(google_id and google_secret),
            "github_seen": bool(github_id and github_secret),
        }
    except Exception as e:
        logger.warning(f"auth_diag error: {e}")
        return {"error": "diagnostic failed"}


@app.get("/auth/callback")
def auth_callback(request: Request, code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
    """
    Generic callback endpoint used by provider to return to the server. The server will attempt
    to exchange the code for a token and then redirect back to the original frontend `redirect_uri`
    (stored in state). If provider credentials are not configured, this endpoint will show a helpful
    message and allow a simulated redirect.
    """
    # Diagnostic: log raw incoming URL and query params to help debug provider responses
    try:
        logger.info(f"auth_callback raw url={request.url}")
        logger.info(f"auth_callback query_params={dict(request.query_params)}")
    except Exception:
        pass

    try:
        state_obj = json.loads(urllib.parse.unquote_plus(state)) if state else {}
        redirect_uri = state_obj.get('redirect_uri') if isinstance(state_obj, dict) else None
    except Exception as e:
        logger.warning(f"auth_callback: failed to parse state: {e}")
        redirect_uri = None

    # If no code provided, return error
    if error and redirect_uri:
        return RedirectResponse(f"{redirect_uri}?error={urllib.parse.quote_plus(error)}")

    if not code:
        # No code: likely a misconfiguration; show helpful message
        return JSONResponse({"detail": "No code provided by provider. Check provider configuration."}, status_code=400)

    # Try to determine provider from request.referer or state - best-effort; user can improve by carrying provider in state
    # For simplicity, attempt both exchanges; whichever succeeds first will be used.
    google_id = getattr(settings, 'google_client_id', None) or os.getenv('GOOGLE_CLIENT_ID')
    google_secret = getattr(settings, 'google_client_secret', None) or os.getenv('GOOGLE_CLIENT_SECRET')
    github_id = getattr(settings, 'github_client_id', None) or os.getenv('GITHUB_CLIENT_ID')
    github_secret = getattr(settings, 'github_client_secret', None) or os.getenv('GITHUB_CLIENT_SECRET')

    try:
        logger.info(f"auth_callback invoked; has_code={bool(code)} google_configured={bool(google_id and google_secret)} github_configured={bool(github_id and github_secret)} state={state}")
    except Exception:
        pass

    # Attempt Google token exchange
    if google_id and google_secret:
        try:
            token_resp = requests.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': google_id,
                    'client_secret': google_secret,
                    'redirect_uri': (getattr(settings, 'public_base_url', None) or os.getenv('PUBLIC_BASE_URL') or 'http://localhost:8000') + '/auth/callback',
                    'grant_type': 'authorization_code'
                },
                timeout=10
            )
            token_resp.raise_for_status()
            token_json = token_resp.json()
            id_token = token_json.get('id_token')
            access_token = token_json.get('access_token')
            # Get userinfo
            userinfo_resp = requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers={'Authorization': f'Bearer {access_token}'}, timeout=10)
            userinfo_resp.raise_for_status()
            user = userinfo_resp.json()
            if redirect_uri:
                params = {"token": id_token or access_token, "user": json.dumps({"email": user.get('email'), "name": user.get('name')})}
                return RedirectResponse(f"{redirect_uri}?{urllib.parse.urlencode(params)}")
            return JSONResponse({"token": id_token or access_token, "user": user})
        except Exception as e:
            logger.warning(f"Google token exchange failed: {e}")

    # Attempt GitHub token exchange
    if github_id and github_secret:
        try:
            token_resp = requests.post(
                'https://github.com/login/oauth/access_token',
                headers={'Accept': 'application/json'},
                data={
                    'client_id': github_id,
                    'client_secret': github_secret,
                    'code': code,
                    'redirect_uri': (getattr(settings, 'public_base_url', None) or os.getenv('PUBLIC_BASE_URL') or 'http://localhost:8000') + '/auth/callback'
                },
                timeout=10
            )
            token_resp.raise_for_status()
            token_json = token_resp.json()
            access_token = token_json.get('access_token')
            # Fetch user
            userinfo_resp = requests.get('https://api.github.com/user', headers={'Authorization': f'token {access_token}', 'Accept': 'application/json'}, timeout=10)
            userinfo_resp.raise_for_status()
            user = userinfo_resp.json()
            # Get primary email if possible
            email = None
            try:
                emails_resp = requests.get('https://api.github.com/user/emails', headers={'Authorization': f'token {access_token}', 'Accept': 'application/json'}, timeout=10)
                emails_resp.raise_for_status()
                emails = emails_resp.json()
                primary = next((e for e in emails if e.get('primary')), None)
                email = primary.get('email') if primary else (emails[0].get('email') if emails else None)
            except Exception:
                email = user.get('email')

            if redirect_uri:
                params = {"token": access_token, "user": json.dumps({"email": email, "name": user.get('name') or user.get('login')})}
                return RedirectResponse(f"{redirect_uri}?{urllib.parse.urlencode(params)}")
            return JSONResponse({"token": access_token, "user": {"email": email, "name": user.get('name') or user.get('login')}})
        except Exception as e:
            logger.warning(f"GitHub token exchange failed: {e}")


# -------------------- Email helper --------------------
def _send_reset_email(email_to: str, reset_link: str) -> bool:
    """Try to send the reset link via SMTP if configured in settings. Returns True if sent."""
    try:
        host = getattr(settings, 'smtp_host', None) or os.getenv('SMTP_HOST')
        port = getattr(settings, 'smtp_port', None) or os.getenv('SMTP_PORT')
        user = getattr(settings, 'smtp_user', None) or os.getenv('SMTP_USER')
        pwd = getattr(settings, 'smtp_pass', None) or os.getenv('SMTP_PASS')
        sender = getattr(settings, 'smtp_from', None) or os.getenv('SMTP_FROM') or 'noreply@example.com'

        if not host or not port:
            return False

        msg = EmailMessage()
        msg['Subject'] = 'Reset your IntelliDoc password'
        msg['From'] = sender
        msg['To'] = email_to
        msg.set_content(f"Click the link to reset your password: {reset_link}\n\nIf you didn't request this, ignore this message.")

        port_int = int(port)
        if port_int == 587:
            s = smtplib.SMTP(host, port_int, timeout=10)
            s.starttls()
            if user and pwd:
                s.login(user, pwd)
            s.send_message(msg)
            s.quit()
        else:
            s = smtplib.SMTP(host, port_int, timeout=10)
            if user and pwd:
                s.login(user, pwd)
            s.send_message(msg)
            s.quit()
        return True
    except Exception as e:
        logger.warning(f"Failed to send reset email: {e}")
        return False


def _send_demo_email(email_to: str, name: Optional[str] = None, company: Optional[str] = None) -> bool:
    """Try to send a simple confirmation email for demo requests if SMTP is configured."""
    try:
        host = getattr(settings, 'smtp_host', None) or os.getenv('SMTP_HOST')
        port = getattr(settings, 'smtp_port', None) or os.getenv('SMTP_PORT')
        user = getattr(settings, 'smtp_user', None) or os.getenv('SMTP_USER')
        pwd = getattr(settings, 'smtp_pass', None) or os.getenv('SMTP_PASS')
        sender = getattr(settings, 'smtp_from', None) or os.getenv('SMTP_FROM') or 'noreply@example.com'

        if not host or not port:
            return False

        msg = EmailMessage()
        msg['Subject'] = 'Thanks for requesting a demo'
        msg['From'] = sender
        msg['To'] = email_to
        body = f"Hi {name or ''},\n\nThanks for requesting a demo. We'll be in touch soon to schedule a time.\n\nCompany: {company or 'N/A'}\n\nIf you didn't request this, please ignore this message."
        msg.set_content(body)

        port_int = int(port)
        if port_int == 587:
            s = smtplib.SMTP(host, port_int, timeout=10)
            s.starttls()
            if user and pwd:
                s.login(user, pwd)
            s.send_message(msg)
            s.quit()
        else:
            s = smtplib.SMTP(host, port_int, timeout=10)
            if user and pwd:
                s.login(user, pwd)
            s.send_message(msg)
            s.quit()
        return True
    except Exception as e:
        logger.warning(f"Failed to send demo email: {e}")
        return False


@app.post("/book-demo")
def book_demo(payload: schemas.DemoRequestIn, db: Session = Depends(get_db)):
    """Accept a Book Demo request and persist it. Returns a simple acknowledgement.

    Frontend should POST { name, email, company, message }
    """
    try:
        if not payload.email or '@' not in payload.email:
            raise HTTPException(status_code=400, detail='Invalid email')

        rec = crud.create_demo_request(db, payload.name or '', payload.email, payload.company, payload.message)

        sent = False
        try:
            sent = _send_demo_email(payload.email, payload.name, payload.company)
        except Exception as e:
            logger.warning(f"Error sending demo email: {e}")

        resp = {"ok": True, "message": "Demo request received.", "id": rec.id}
        if not sent:
            resp["note"] = "Confirmation email not sent (SMTP not configured)."
        return JSONResponse(resp)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"book_demo failed: {e}")
        raise HTTPException(status_code=500, detail='Failed to create demo request')


@app.get("/onboarding", response_model=Optional[schemas.OnboardingOut])
def get_onboarding(email: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve onboarding state for a user by email."""
    try:
        if not email:
            raise HTTPException(status_code=400, detail="Missing email param")
        rec = crud.get_onboarding_by_email(db, email)
        if not rec:
            return None
        return schemas.OnboardingOut(
            id=rec.id,
            user_email=rec.user_email,
            persona=rec.persona,
            sample_query=rec.sample_query,
            upload_filename=rec.upload_filename,
            upload_task_id=rec.upload_task_id,
            completed=bool(rec.completed),
            meta=rec.meta or {},
            created_at=rec.created_at,
            updated_at=getattr(rec, 'updated_at', None)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_onboarding failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve onboarding")


@app.post("/onboarding", response_model=schemas.OnboardingOut)
def save_onboarding(payload: schemas.OnboardingIn, db: Session = Depends(get_db)):
    """Create or update onboarding state for a user."""
    try:
        if not payload.user_email or '@' not in payload.user_email:
            raise HTTPException(status_code=400, detail='Invalid user_email')
        rec = crud.create_or_update_onboarding(
            db,
            email=payload.user_email,
            persona=payload.persona,
            sample_query=payload.sample_query,
            upload_filename=payload.upload_filename,
            upload_task_id=payload.upload_task_id,
            completed=bool(payload.completed),
            meta=payload.meta or {}
        )
        return schemas.OnboardingOut(
            id=rec.id,
            user_email=rec.user_email,
            persona=rec.persona,
            sample_query=rec.sample_query,
            upload_filename=rec.upload_filename,
            upload_task_id=rec.upload_task_id,
            completed=bool(rec.completed),
            meta=rec.meta or {},
            created_at=rec.created_at,
            updated_at=getattr(rec, 'updated_at', None)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"save_onboarding failed: {e}")
        raise HTTPException(status_code=500, detail='Failed to save onboarding')


@app.post('/auth/forgot')
def auth_forgot(request: Request, payload: dict, db: Session = Depends(get_db)):
    """Request a password reset. Payload: {"email": "user@example.com"}

    If SMTP is configured the server will attempt to send the email. For local/dev the reset link
    is returned in the JSON response to ease testing.
    """
    try:
        email = (payload or {}).get('email')
        if not email or '@' not in email:
            raise HTTPException(status_code=400, detail='Invalid email')

        # Create a single-use token stored in DB
        token, rec = crud.create_password_reset_token(db, email, expires_seconds=3600)

        # Build frontend reset URL. Prefer explicit frontend_base_url setting, then request Origin header,
        # then PUBLIC_BASE_URL (legacy), then request host (backend). This ensures the link points to the frontend
        # dev server (e.g. http://localhost:5173) when available.
        frontend_base = (
            getattr(settings, 'frontend_base_url', None)
            or os.getenv('FRONTEND_BASE_URL')
            or request.headers.get('origin')
            or (getattr(settings, 'public_base_url', None) or os.getenv('PUBLIC_BASE_URL'))
            or f"{request.url.scheme}://{request.url.hostname}:{request.url.port}"
        )
        reset_link = f"{frontend_base.rstrip('/')}/reset-password?token={urllib.parse.quote_plus(token)}"

        sent = False
        # Try sending email if SMTP configured
        try:
            sent = _send_reset_email(email, reset_link)
        except Exception as e:
            logger.warning(f"Error sending reset email: {e}")

        resp = {"ok": True, "message": "If that email exists, a password reset link was generated."}
        # In dev/local or if email not sent, return the link for convenience
        if not sent:
            resp['reset_link'] = reset_link
        return JSONResponse(resp)
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"auth_forgot failed: {e}")
        raise HTTPException(status_code=500, detail='Failed to create reset token')


@app.post('/auth/reset')
def auth_reset(payload: dict, db: Session = Depends(get_db)):
    """Perform password reset. Payload: {"token": "...", "password": "newpass"}

    This verifies the single-use token stored in DB, updates (or creates) the user record with
    a new password hash, and marks the token used to prevent re-use.
    """
    try:
        token = (payload or {}).get('token')
        new_password = (payload or {}).get('password')
        if not token or not new_password:
            raise HTTPException(status_code=400, detail='Missing token or password')

        rec = crud.get_password_reset_record(db, token)
        if not rec:
            raise HTTPException(status_code=400, detail='Invalid or expired token')
        # Check used or expired
        if rec.used:
            raise HTTPException(status_code=400, detail='Token already used')
        if rec.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail='Token expired')

        email = rec.email

        # Hash new password (PBKDF2)
        salt = secrets.token_hex(16)
        dk = hashlib.pbkdf2_hmac('sha256', new_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        new_hash = dk.hex()

        # Update (or create) user
        user = crud.get_user_by_email(db, email)
        if user:
            ok = crud.update_user_password(db, email, new_hash, salt)
            if not ok:
                raise HTTPException(status_code=500, detail='Failed to update password')
        else:
            # Create user record with this password (dev-friendly). In production you may prefer to reject.
            crud.create_user(db, email, new_hash, salt)

        # Mark token used
        crud.mark_reset_token_used(db, rec)

        return JSONResponse({"ok": True, "message": "Password reset successful.", "email": email})
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"auth_reset failed: {e}")
        raise HTTPException(status_code=500, detail='Failed to reset password')


@app.get("/auth/{provider}")
def auth_start(provider: str, redirect_uri: Optional[str] = None):
    """
    Start OAuth flow for provider ('google' or 'github').
    If provider client id/secret are not configured, immediately redirect back to `redirect_uri`
    with a simulated dev token and user so frontend flows can be tested locally.
    """
    provider = provider.lower()
    if provider not in ("google", "github"):
        raise HTTPException(status_code=400, detail="Unsupported provider")

    # Read provider config from environment (or settings module)
    google_id = getattr(settings, 'google_client_id', None) or os.getenv('GOOGLE_CLIENT_ID')
    google_secret = getattr(settings, 'google_client_secret', None) or os.getenv('GOOGLE_CLIENT_SECRET')
    github_id = getattr(settings, 'github_client_id', None) or os.getenv('GITHUB_CLIENT_ID')
    github_secret = getattr(settings, 'github_client_secret', None) or os.getenv('GITHUB_CLIENT_SECRET')

    # Diagnostic logging to help debug popup auto-close / dev-fallback behavior
    try:
        logger.info(f"auth_start called for provider={provider} redirect_uri={redirect_uri} google_configured={bool(google_id and google_secret)} github_configured={bool(github_id and github_secret)}")
    except Exception:
        pass

    # If provider not configured, simulate and redirect back to frontend with dev token
    if provider == 'google' and not (google_id and google_secret):
        if not redirect_uri:
            return JSONResponse({"error": "Google OAuth not configured on server"}, status_code=400)
        simulated_user = {"email": "dev+google@example.com", "name": "Dev Google User"}
        params = {"token": f"dev-token-{os.urandom(4).hex()}", "user": json.dumps(simulated_user)}
        return RedirectResponse(f"{redirect_uri}?{urllib.parse.urlencode(params)}")

    if provider == 'github' and not (github_id and github_secret):
        if not redirect_uri:
            return JSONResponse({"error": "GitHub OAuth not configured on server"}, status_code=400)
        simulated_user = {"email": "dev+github@example.com", "name": "Dev GitHub User"}
        params = {"token": f"dev-token-{os.urandom(4).hex()}", "user": json.dumps(simulated_user)}
        return RedirectResponse(f"{redirect_uri}?{urllib.parse.urlencode(params)}")

    # Build real provider authorization URL that returns to our /auth/callback
    backend_callback = (getattr(settings, 'public_base_url', None) or os.getenv('PUBLIC_BASE_URL') or 'http://localhost:8000') + "/auth/callback"
    state = urllib.parse.quote_plus(json.dumps({"redirect_uri": redirect_uri or "/"}))

    if provider == 'google':
        scope = urllib.parse.quote_plus('openid email profile')
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?client_id={google_id}"
            f"&response_type=code&scope={scope}&redirect_uri={urllib.parse.quote_plus(backend_callback)}&state={state}&access_type=offline&prompt=consent"
        )
        return RedirectResponse(auth_url)




    # github
    if provider == 'github':
        scope = urllib.parse.quote_plus('read:user user:email')
        auth_url = (
            f"https://github.com/login/oauth/authorize?client_id={github_id}"
            f"&scope={scope}&redirect_uri={urllib.parse.quote_plus(backend_callback)}&state={state}"
        )
        return RedirectResponse(auth_url)






@app.get("/auth/me")
def auth_me(request: Request, token: Optional[str] = None):
    """
    Return basic user profile for the provided Authorization Bearer token.
    - For dev tokens (prefix 'dev-token') returns a simple dev user.
    - For JWT id_tokens (3-part token) returns decoded payload email/name (no signature verification).
    - For other tokens this endpoint returns 501 Not Implemented and a helpful message.
    """
    # Priority: explicit query param (token), Authorization header, x-access-token header
    try:
        logger.info(f"auth_me called: path={request.url.path} method={request.method} query={dict(request.query_params)}")
        if token:
            logger.info('auth_me: token provided via query param')
        else:
            auth = request.headers.get('authorization') or request.headers.get('Authorization')
            if auth:
                parts = auth.split()
                if len(parts) == 2:
                    token = parts[1]
                    logger.info('auth_me: token provided via Authorization header')
            if not token:
                xt = request.headers.get('x-access-token')
                if xt:
                    token = xt
                    logger.info('auth_me: token provided via x-access-token header')
    except Exception as e:
        logger.warning(f'auth_me token detection error: {e}')

    if not token:
        raise HTTPException(status_code=401, detail='Missing token (Authorization header, x-access-token header, or token query param)')
    try:
        # Early return for local dev tokens to avoid further parsing issues
        if isinstance(token, str) and (token.startswith('dev-token') or token.startswith('dev-oauth')):
            logger.info('auth_me: returning dev user for token')
            return JSONResponse({"email": "dev@local", "name": "Dev User"}, status_code=200)

        # Try parsing as JWT (id_token)
        if isinstance(token, str) and token.count('.') == 2:
            payload = token.split('.')[1]
            # base64 decode with padding
            import base64
            rem = len(payload) % 4
            if rem > 0:
                payload += '=' * (4 - rem)
            decoded = base64.urlsafe_b64decode(payload.encode('utf-8'))
            obj = json.loads(decoded.decode('utf-8'))
            return JSONResponse({"email": obj.get('email'), "name": obj.get('name') or obj.get('preferred_username')}, status_code=200)

        # Not supported token type - ask user to use frontend-callback user param
        return JSONResponse({"detail": "Token type not supported for /auth/me on this server. Provide user info in the frontend redirect (user param)."}, status_code=501)
    except Exception as e:
        logger.warning(f"auth_me parsing failed: {e}")
        # Return 400 so frontend can fallback to using user param; include minimal message
        raise HTTPException(status_code=400, detail="Failed to parse token")


@app.post('/auth/register')
def auth_register(payload: dict, db: Session = Depends(get_db)):
    """
    Register a new user with email, password, and optional name.
    Stores a salted PBKDF2 password hash. Returns a simple token + user on success.
    """
    try:
        email = (payload or {}).get('email')
        password = (payload or {}).get('password')
        name = (payload or {}).get('name')
        if not email or '@' not in email or not password:
            raise HTTPException(status_code=400, detail='Missing or invalid email/password')

        # Check existing
        existing = crud.get_user_by_email(db, email)
        if existing:
            return JSONResponse({'detail': 'User already exists'}, status_code=400)

        # Hash password
        salt = secrets.token_hex(16)
        dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        pwd_hash = dk.hex()

        user = crud.create_user(db, email=email, password_hash=pwd_hash, password_salt=salt, name=name)

        token = f"dev-token-{secrets.token_hex(8)}"
        return JSONResponse({"token": token, "user": {"email": user.email, "name": user.name}}, status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"auth_register failed: {e}")
        raise HTTPException(status_code=500, detail='Registration failed')


@app.post('/auth/login')
def auth_login(payload: dict, db: Session = Depends(get_db)):
    """
    Login with email + password. Verifies PBKDF2 hash and returns a token + user on success.
    """
    try:
        email = (payload or {}).get('email')
        password = (payload or {}).get('password')
        if not email or not password:
            raise HTTPException(status_code=400, detail='Missing email or password')

        user = crud.get_user_by_email(db, email)
        if not user:
            return JSONResponse({'detail': 'Invalid credentials'}, status_code=400)

        # If no password stored (e.g., OAuth created), reject for now
        if not user.password_hash or not user.password_salt:
            return JSONResponse({'detail': 'Account has no password set'}, status_code=400)

        dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), user.password_salt.encode('utf-8'), 100000)
        if dk.hex() != (user.password_hash or ''):
            return JSONResponse({'detail': 'Invalid credentials'}, status_code=400)

        token = f"dev-token-{secrets.token_hex(8)}"
        return JSONResponse({"token": token, "user": {"email": user.email, "name": user.name}}, status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"auth_login failed: {e}")
        raise HTTPException(status_code=500, detail='Login failed')
# Metrics endpoint
@app.get("/metrics", response_model=schemas.Metrics)
def get_metrics(db: Session = Depends(get_db)):
    try:
        doc_count = crud.count_documents(db)
        chunk_count = crud.count_chunks(db)
        total_size = crud.get_total_file_size(db)
        
        # Get model info from your local models
        model_info = model_manager.get_model_info()
        model_info["groq_enabled"] = groq_client is not None

        return schemas.Metrics(
            documents_count=doc_count,
            chunks_count=chunk_count,
            avg_chunks_per_doc=chunk_count / max(doc_count, 1),
            total_file_size=total_size,
            model_info=model_info
        )
    except Exception as e:
        logger.error(f"Metrics collection failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to collect metrics")

# Document upload with async processing
@app.post("/upload", response_model=schemas.UploadResponse)
async def upload_file(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    try:
        # Log incoming request for debug (helps diagnose uploads that stall)
        try:
            cl = request.headers.get('content-length')
            logger.info(f"Upload request from {request.client} headers Content-Length={cl}")
        except Exception:
            pass

        # Validate file
        validate_file(file)

        # Generate task ID
        task_id = generate_task_id()

        # Read file content (wrap in try/except to capture read errors)
        try:
            file_content = await file.read()
        except Exception as e:
            logger.error(f"Failed to read uploaded file {file.filename}: {e}")
            raise

        # Start background processing (do NOT pass request-scoped DB)
        background_tasks.add_task(
            process_document_async,
            file_content,
            file.filename,
            task_id
        )

        logger.info(f"Upload started for {file.filename} with task ID: {task_id}")

        return schemas.UploadResponse(
            task_id=task_id,
            status="processing",
            message=f"Upload started for {file.filename}"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed for {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Get upload task status
@app.get("/upload/status/{task_id}", response_model=schemas.TaskStatus)
def get_upload_status(task_id: str):
    status = get_task_status(task_id)
    if status["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Task not found")

    return schemas.TaskStatus(
        task_id=task_id,
        status=status["status"],
        progress=status.get("progress", 0),
        message=status.get("message", ""),
        result=status.get("result")
    )

# Enhanced search endpoint
@app.get("/search", response_model=schemas.AnswerOut)
def search_documents(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, le=50, description="Number of results"),
    offset: int = Query(0, ge=0, description="Results offset"),
    doc_id: Optional[int] = Query(None, description="Search within specific document"),
    db: Session = Depends(get_db)
):
    start_time = time.time()

    try:
        if not q.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        logger.info(f"Search query: '{q}' (limit={limit}, offset={offset}, doc_id={doc_id})")

        # Generate query embedding - always fresh for accuracy
        query_emb = active_ai_utils.generate_embedding(q)

        # Search chunks with maximum retrieval for accuracy
        results = crud.search_chunks(
            db,
            query_emb,
            top_k=25,  # Increased from 15 for maximum context selection
            offset=offset,
            doc_id=doc_id
        )

        if not results:
            return schemas.AnswerOut(
                query=q,
                answer="I could not find relevant information for your query.",
                sources=[],
                processing_time=time.time() - start_time
            )

        # Re-rank results using your existing local models
        reranked = active_ai_utils.rerank_candidates(q, results)

        # Extract contexts for answer generation
        context_count = min(8, len(reranked))
        contexts = [r.get("text", "") for r in reranked[:context_count]]
        
        # Generate dual answers: Local Models + GROQ
        dual_answer_info = None
        if USE_DUAL_ANSWERS and groq_client:
            dual_result = generate_dual_answers(groq_client, q, contexts)
            answer = dual_result['answer']
            
            # Create dual answer info for response
            dual_answer_info = schemas.DualAnswerInfo(
                local_answer=dual_result['local_answer'],
                groq_answer=dual_result['groq_answer'],
                selected_source=dual_result['source'],
                selection_reason=dual_result['selection_reason'],
                dual_answers_enabled=True
            )
            
            # Log the dual answer process for debugging
            logger.info(f"Dual answers - Local: {dual_result['local_answer'][:50]}... | GROQ: {dual_result['groq_answer'][:50]}... | Selected: {dual_result['source']} ({dual_result['selection_reason']})")
        else:
            # Fallback to local only (your existing system)
            # Convert contexts from list of dicts to list of strings for synthesize_answer
            context_strings = [r.get("text", "") for r in reranked[:context_count]]
            context_dicts = [{"text": ctx} for ctx in context_strings]
            answer = (active_ai_utils.synthesize_answer(q, context_dicts) or "").strip()
            
            # Create dual answer info indicating local-only mode
            dual_answer_info = schemas.DualAnswerInfo(
                local_answer=answer,
                groq_answer="GROQ not available",
                selected_source="local",
                selection_reason="GROQ not configured or available",
                dual_answers_enabled=False
            )
            
            logger.info("Using local models only")

        # Ensure we always have a valid answer
        if not answer or answer.strip() == "":
            answer = "I found relevant information but could not generate a clear answer. Please check the source documents."

        # Prepare sources with more details - use same context count as answer synthesis
        sources = [
            schemas.Source(
                doc_id=r.get("doc_id"),
                doc_title=r.get("doc_title", f"Document {r.get('doc_id')}")
            )
            for r in reranked[:context_count]
            if r.get("doc_id") is not None
        ]

        processing_time = time.time() - start_time

        return schemas.AnswerOut(
            query=q,
            answer=answer,
            sources=sources,
            processing_time=processing_time,
            dual_answers=dual_answer_info
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search failed for query '{q}': {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# Document management endpoints
@app.get("/documents", response_model=List[schemas.DocumentSummary])
def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    db: Session = Depends(get_db)
):
    try:
        documents = crud.get_documents_summary(db, skip=skip, limit=limit)
        return [schemas.DocumentSummary(**doc) for doc in documents]
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve documents")

@app.get("/documents/{doc_id}", response_model=schemas.Document)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    try:
        doc = crud.get_document(db, doc_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document {doc_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve document")

@app.delete("/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    try:
        success = crud.delete_document(db, doc_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"message": f"Document {doc_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document {doc_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete document")

# Model management endpoints
@app.get("/models/info")
def get_model_info():
    try:
        # Get info from your local models
        model_info = model_manager.get_model_info()
        cache_stats = cache_manager.get_cache_stats()
        
        # Add GROQ status
        model_info["groq_enabled"] = groq_client is not None
        model_info["dual_answers_enabled"] = USE_DUAL_ANSWERS and groq_client is not None
        
        return {
            **model_info, 
            "cache_stats": cache_stats,
            "architecture": "Local Models + GROQ Dual Answers" if groq_client else "Local Models Only"
        }
    except Exception as e:
        logger.error(f"Failed to get model info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get model information")

@app.post("/models/clear-cache")
def clear_model_cache():
    try:
        # Clear your local model caches
        model_manager.clear_cache()
        cache_manager.clear_cache()
        return {
            "message": "Local model and embedding caches cleared successfully",
            "note": "GROQ has no local cache to clear"
        }
    except Exception as e:
        logger.error(f"Failed to clear model cache: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear model cache")

# Administrative endpoints
@app.post("/admin/cleanup-tasks")
def cleanup_tasks(max_age_hours: int = Query(24, ge=1, le=168)):  # 1-168 hours (1 week)
    try:
        cleanup_old_tasks(max_age_hours)
        return {"message": f"Cleaned up tasks older than {max_age_hours} hours"}
    except Exception as e:
        logger.error(f"Failed to cleanup tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to cleanup tasks")

# Note: run with `uvicorn app.main:app --reload`
