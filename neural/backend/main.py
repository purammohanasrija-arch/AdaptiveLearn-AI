import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set UTF-8 encoding for standard output on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

os.environ["LOKY_MAX_CPU_COUNT"] = "4"

# Add current folder to sys.path so imports work seamlessly
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from database import engine, Base, ensure_schema_migrations
from seed import seed_database
from seed_courses import seed_courses_system
from routes.auth_routes import router as auth_router
from routes.student_routes import router as student_router
from routes.lesson_routes import router as lesson_router
from routes.quiz_routes import router as quiz_router
from routes.progress_routes import router as progress_router
from routes.teacher_routes import router as teacher_router
from routes.ai_routes import router as ai_router
from routes.learner_routes import router as learner_router
from routes.tutor_routes import router as tutor_router
from routes.accessibility_routes import router as accessibility_router
from routes.innovation_routes import router as innovation_router
from routes.course_routes import router as course_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is created and seeded
    Base.metadata.create_all(bind=engine)
    ensure_schema_migrations()
    seed_database()
    seed_courses_system()
    print("[SERVER START] AdaptiveLearn AI Python Engine running on port 5000")
    yield
    print("[SERVER STOP] AdaptiveLearn AI Python Engine shutting down")

app = FastAPI(
    title="AdaptiveLearn AI – Personalized Inclusive Learning Platform",
    description="Python + FastAPI backend powered by scikit-learn, NumPy, Pandas, Bayesian Knowledge Tracing, and NLP Readability Simplification for Hackathon Challenge HI-03.",
    version="2.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend Vite application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(student_router, prefix="/api")
app.include_router(lesson_router, prefix="/api")
app.include_router(quiz_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(teacher_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(learner_router)
app.include_router(tutor_router)
app.include_router(accessibility_router)
app.include_router(innovation_router)
app.include_router(course_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "AdaptiveLearn AI – Personalized Learning for Everyone",
        "version": "2.0.0",
        "engine": "Python FastAPI + scikit-learn + NumPy + Pandas",
        "database": "SQLite + SQLAlchemy",
        "features": [
            "Bayesian Knowledge Tracing (BKT)",
            "Item Response Theory (IRT) Elo Calibration",
            "scikit-learn KMeans AI Learning DNA",
            "NLP Readability & Flesch-Kincaid Simplification",
            "Ebbinghaus Forgetting Curve Revision Scheduler",
            "AI Knowledge Gap Misconception Detector",
            "Teacher Intervention Alerts Engine",
            "Socratic AI Tutor (Aria)",
            "WCAG 2.2 AA Accessibility & Inclusive Learning Engine",
            "Verified Sign Language & Multimodal Content Transformer",
            "AI Learning Twin & Multidimensional Trajectory",
            "Predictive Learning Analytics (RandomForestRegressor)",
            "Dynamic Prerequisite Learning Path Engine",
            "AI Exam & Question Paper Generator & Evaluator",
            "Multilingual AI Learning (Hindi, Telugu, English)",
            "Gamified XP & Milestone Badge System",
            "Digital Learning Achievement Passport",
            "Complete AI-Powered Course & Lesson Management System",
        ],
    }

@app.get("/")
def root_info():
    return {
        "message": "Welcome to AdaptiveLearn AI Backend API",
        "documentation": "/docs",
        "health": "/api/health",
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
