# AdaptiveLearn AI – Personalized Inclusive Learning Platform
### Hackathon Challenge HI-03: Adaptive Learning for Students with Disabilities

[![WCAG 2.2 AA Aligned](https://img.shields.io/badge/WCAG-2.2%20AA%20Aligned-success?style=for-the-badge&logo=w3c)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Backend: Python + FastAPI](https://img.shields.io/badge/Backend-Python%203.12%20%2B%20FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![ML: scikit--learn + NumPy + Pandas](https://img.shields.io/badge/AI%2FML-scikit--learn%20%2B%20BKT%20%2B%20IRT-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)
[![Database: SQLite + SQLAlchemy](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![Frontend: React + Vite + Recharts](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Recharts-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

---

## 🌟 Executive Summary & Problem Statement

Students with disabilities learn at different speeds and require different learning formats. Traditional educational platforms force a rigid, one-size-fits-all curriculum that creates learning barriers for students with dyslexia, visual impairments, ADHD, hearing difficulties, or cognitive processing variations.

**AdaptiveLearn AI** is an innovative, production-grade, AI-powered inclusive educational platform that preserves the **same educational objective** while dynamically adapting:
1. **Content complexity and difficulty level.**
2. **Learning speed and pacing.**
3. **Content presentation format** (Simple English, Large-Text, Audio Narration, Visual Mindmap, Step-by-Step, or Video with Captions).
4. **Teaching analogies and scaffolding.**
5. **Dynamic assessment challenge** (using Bayesian Knowledge Tracing and Item Response Theory).

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (React 19 + Vite + Recharts)"]
        UI["Accessible SaaS Shell & Navigation"]
        TopNav["Persona Switcher (Aarav / Maya / Teacher)"]
        Drawers["Accessibility Control Center & Voice Assistant"]
        Views["13 Application Pages & Visual Mindmaps"]
    end

    subgraph Backend ["Python FastAPI Backend (REST APIs)"]
        API["FastAPI Routing Engine (/api)"]
        AuthRoute["/api/auth (Login / Register / Me)"]
        LessonRoute["/api/lessons (CRUD & /adapt)"]
        QuizRoute["/api/quizzes (Dynamic Submission & Calibration)"]
        ProgRoute["/api/progress (Mastery & Journey Timeline)"]
        TeacherRoute["/api/teacher (Cohort Analytics & Alerts)"]
        AIRoute["/api/ai (Chat, Gaps, Revision, DNA)"]
    end

    subgraph AIEngine ["Python AI / ML Intelligence Core"]
        BKT["Bayesian Knowledge Tracing (BKT Engine)"]
        IRT["Item Response Theory (1PL Rasch & Elo Dynamic Switcher)"]
        KMeans["scikit-learn KMeans Learner Clustering"]
        PCA["scikit-learn PCA 2D Genome Projection"]
        NLP["NLP Flesch-Kincaid Readability & 5 Experiences Transformer"]
        Ebbinghaus["Spaced Repetition (Ebbinghaus Forgetting Curve)"]
        GapDetector["Misconception & Knowledge Gap Detector"]
        AlertEngine["Teacher Intervention Alert Engine"]
        SocraticTutor["Socratic AI Tutor (Aria)"]
    end

    subgraph Storage ["Persistence Layer"]
        DB[("SQLite Database (adaptive_learn.db)")]
        ORM["SQLAlchemy ORM Models"]
    end

    UI --> API
    API --> AuthRoute & LessonRoute & QuizRoute & ProgRoute & TeacherRoute & AIRoute
    QuizRoute --> BKT & IRT
    AIRoute --> KMeans & PCA & NLP & Ebbinghaus & GapDetector & SocraticTutor
    TeacherRoute --> AlertEngine
    API --> ORM --> DB
```

---

## 🧠 Core AI / ML Models & Mathematical Foundations

### 1. Bayesian Knowledge Tracing (BKT)
Tracks the latent probability $P(L_t)$ that a student has mastered a concept at step $t$:
- **Prior Knowledge $P(L_0)$**: Initial probability (default $0.5$).
- **Transit Probability $P(T)$**: Probability of learning during an interaction ($0.2$).
- **Guess Probability $P(G)$**: Probability of guessing correctly ($0.2$).
- **Slip Probability $P(S)$**: Probability of an accidental slip ($0.1$).

$$\text{Correct Update: } P(L_t | \text{correct}) = \frac{P(L_t)(1 - P(S))}{P(L_t)(1 - P(S)) + (1 - P(L_t))P(G)}$$

$$\text{Incorrect Update: } P(L_t | \text{incorrect}) = \frac{P(L_t)P(S)}{P(L_t)P(S) + (1 - P(L_t))(1 - P(G))}$$

$$\text{Next Opportunity: } P(L_{t+1}) = P(L_t | \text{obs}) + (1 - P(L_t | \text{obs})) \cdot P(T)$$

### 2. Item Response Theory (IRT) & Elo Dynamic Difficulty Switcher
Calibrates student ability $\theta$ against question difficulty $\beta$:

$$P(\text{correct} \mid \theta, \beta) = \frac{1}{1 + e^{-1.7(\theta - \beta)}}$$

Updates ability in real-time:
$$\theta_{t+1} = \theta_t + K \cdot (\text{actual} - P(\text{expected}))$$

- **Tier 1 (Foundational Scaffolding)**: $\theta < -0.3$ $\rightarrow$ Easy questions, everyday kitchen analogies, rich audio read-aloud.
- **Tier 2 (Core Application)**: $-0.3 \le \theta \le 0.6$ $\rightarrow$ Moderate questions with interactive visual diagrams.
- **Tier 3 (Advanced Synthesis)**: $\theta > 0.6$ $\rightarrow$ Challenging multi-step questions requiring critical synthesis.

### 3. AI Learning DNA Clustering (scikit-learn)
Extracts a normalized 6D vector for each student:
$$\mathbf{x} = [f_{\text{visual}}, f_{\text{audio}}, f_{\text{reading\_speed}}, f_{\text{cognitive\_load}}, f_{\text{accuracy}}, f_{\text{pacing}}]$$

- `sklearn.cluster.KMeans(n_clusters=4)` classifies students into archetypes:
  1. **Auditory Scaffolded Learner** (e.g., Aarav Patel – Dyslexia/ADHD support)
  2. **High-Velocity Visual Explorer** (e.g., Maya Lin – Hearing accommodation, visual diagrams)
  3. **Screen-Reader Multi-Sensory Learner** (e.g., Carlos Mendez – Visual impairment)
  4. **Reflective Step-by-Step Builder** (Analytical, systematic procedural learner)
- `sklearn.decomposition.PCA(n_components=2)` projects 6D telemetry onto a 2D genome coordinate map.

### 4. NLP Readability & Flesch-Kincaid Simplifier
Analyzes text complexity before and after automated adaptation:
$$\text{Flesch Reading Ease} = 206.835 - 1.015 \left(\frac{\text{words}}{\text{sentences}}\right) - 84.6 \left(\frac{\text{syllables}}{\text{words}}\right)$$
$$\text{Grade Level} = 0.39 \left(\frac{\text{words}}{\text{sentences}}\right) + 11.8 \left(\frac{\text{syllables}}{\text{words}}\right) - 15.59$$

### 5. Spaced Repetition (Ebbinghaus Forgetting Curve)
Predicts retention decay over elapsed days $t$ given memory stability $S$:
$$R(t) = e^{-\frac{t}{S}}$$
When retention dips below $75\%$, the system automatically queues a targeted 10-minute micro-review.

---

## 🚀 10 Advanced Unique Features

| # | Feature Name | Description | Where to Experience |
|---|--------------|-------------|---------------------|
| 1 | **AI Learning DNA** | Visual profile displaying archetype, genome hash, 2D PCA mapping, and 6-axis sensory radar. | `/progress` |
| 2 | **One Lesson – Five Experiences** | Transforms any lesson into 5 distinct formats: Simple English, Large-Text, Audio Narration, Visual Mindmap, and Step-by-Step Breakdown. | `/lessons/:id` & `/lab` |
| 3 | **Smart Difficulty Switcher** | Real-time question calibration based on IRT ability ($\theta$) and BKT mastery state. | `/quiz/:id` |
| 4 | **Focus Mode** | Distraction-free interface with reduced animations, ambient focus timer, and zen break modal. | TopNav `Zen Break` & `/accessibility` |
| 5 | **Voice Learning Mode** | Voice commands ("Read lesson", "Make simpler", "Next question") + Web Speech API speech-to-text. | `FloatingVoiceBar` & `VoiceVideoAssistant` |
| 6 | **AI Knowledge Gap Detector** | Scans quiz answer patterns with Pandas to pinpoint prerequisite misconceptions. | `/progress` |
| 7 | **Learning Journey Timeline** | Visual chronological timeline of milestones from Day 1 to present. | `/progress` |
| 8 | **Smart Revision Scheduler** | Spaced repetition scheduler based on Ebbinghaus forgetting curve. | `/progress` |
| 9 | **Accessible Visual Explainer** | Interactive SVG concept diagrams with audio description anchors. | `/lessons/:id` (Visual Tab) |
| 10 | **Teacher Intervention Alerts** | Surfaces automated alerts when students struggle or experience cognitive overload. | `/teacher` |

---

## 🎬 Demo-Ready Hackathon Scenario (Step-by-Step)

Judges can test the complete demonstration in under 3 minutes:

### STEP 1: Two Contrasting Student Profiles
- **Learner A (Aarav Patel)**: Reading difficulty (Dyslexia) & ADHD. Prefers plain English, large font, audio narration, and relaxed pacing.
- **Learner B (Maya Lin)**: Hearing impairment. Prefers rich visual mindmaps, flowcharts, technical depth, and rapid pacing.

### STEP 2: Unified Curriculum Objective
Both students learn **Lesson 1: Introduction to Computers & Hardware Architecture** (`/lessons/lesson-1`).

### STEP 3: Automated Personalization
- Use the **1-Click Persona Switcher** in the top navigation bar or the **Adaptive Lab** (`/lab`):
  - Switch to **Aarav**: The lesson adapts to the **Chef & Kitchen Analogy** 👨‍🍳 with large text, spoken audio narration, and foundational Tier 1 quiz questions.
  - Switch to **Maya**: The lesson adapts to **Visual Flowcharts & On-Die Cache Diagrams** 🔬 with technical depth and Tier 3 challenge questions.

### STEP 4: Adaptive Assessment & Real-Time Calibration
- Both complete their quizzes (`/quiz/lesson-1`).
- The Python AI engine evaluates answers, updates BKT mastery probability, and recalculates ability $\theta$ via Item Response Theory.

### STEP 5: Teacher Dashboard & Intervention Alerts
- Navigate to `/teacher`:
  - View side-by-side student progress.
  - Inspect **Teacher Intervention Alerts** with suggested remedial actions.
  - Click **Download Progress Report** to export the structured student progress report.

---

## 📱 All 13 Application Pages

1. **Landing Page (`/`)**: Platform overview, sensory inclusion pathway selector, voice reader.
2. **Student Authentication (`/auth`)**: Secure login and registration.
3. **Learner Onboarding (`/onboarding`)**: Sensory preference survey and baseline assessment.
4. **Student Dashboard (`/dashboard`)**: Welcome banner, active streak, mastery card, recommended lesson.
5. **Lesson Library (`/lessons`)**: Filterable catalog of inclusive lessons.
6. **Adaptive Lesson Player (`/lessons/:id`)**: Multi-format viewer with 1-click Aarav/Maya switcher.
7. **Adaptive Lab (`/lab`)**: Side-by-side comparison studio demonstrating HI-03 scenario.
8. **AI Tutor (`/tutor`)**: Socratic AI assistant with everyday analogies and voice interaction.
9. **Adaptive Quiz (`/quiz/:id`)**: Live quiz interface with instant chimes, hints, and IRT difficulty switcher.
10. **Progress & Mastery (`/progress`)**: AI Learning DNA, 6-axis radar, knowledge gaps, and revision schedule.
11. **Accessibility Control Center (`/accessibility`)**: High contrast, dyslexic font, reading ruler, and speech rate.
12. **Teacher Analytics Portal (`/teacher`)**: Cohort metrics, student roster, and intervention alerts.
13. **Student Deep-Dive Analytics (`/teacher/student/:id`)**: Detailed individual student performance report.

---

## 🛠️ Technology Stack & Libraries

| Layer | Technologies Used |
|-------|-------------------|
| **Frontend** | React 19, Vite, Recharts, Lucide-react, Canvas-confetti, Responsive CSS3 |
| **Backend** | Python 3.12, FastAPI, Uvicorn, RESTful architecture |
| **AI / ML** | scikit-learn (KMeans, PCA), NumPy, Pandas, Bayesian Knowledge Tracing, 1PL Rasch IRT |
| **Database** | SQLite, SQLAlchemy ORM |
| **Accessibility** | Web Speech API (Synthesis & Recognition), WCAG 2.2 AA Contrast, OpenDyslexic |

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Python 3.10+ (Python 3.12 verified)
- Node.js 18+ (Node 24 verified)

### Method 1: One-Click Launch (Windows)
Double-click `start_all.bat`:
```cmd
start_all.bat
```
*This automatically launches the Python FastAPI backend on `http://localhost:5000` and the React frontend on `http://localhost:5173`.*

### Method 2: Manual Terminal Execution

#### 1. Backend (Python FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*API running at `http://localhost:5000` | Interactive docs at `http://localhost:5000/docs`*

#### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend running at `http://localhost:5173`*

#### 3. Automated Verification Test Suite
Run the comprehensive AI engine and Phase 3 test suites:
```bash
# 1. Core AI Engine Unit Tests (BKT, IRT, KMeans, Readability)
python backend/test_simple.py

# 2. Phase 3 Adaptive Learning Engine Tests (7 Unit Tests)
python backend/tests/test_adaptive_engine.py

# 3. Phase 3 End-to-End Learner Journey Tests (6 Integration Tests)
python backend/tests/test_full_journey_phase3.py

# 4. Phase 4 AI Tutor Scenarios A-F Tests (7 Tests)
python backend/tests/test_tutor_engine.py

# 5. Phase 4 Multimodal AI Tutor REST API Tests (8 Tests)
python backend/tests/test_tutor_api_endpoints.py

# 6. Phase 5 Advanced AI Accessibility & Inclusive Learning Tests (All 6 Endpoints & Scenarios A-E)
python backend/tests/test_accessibility_system.py

# 7. Phase 6 AI Teacher Dashboard & Learning Analytics Tests (All 11 Endpoints & Steps 1-7 Scenario)
python backend/tests/test_teacher_system.py
```

---

## 👩‍🏫 Phase 6: AI-Powered Teacher Dashboard & Learning Analytics System

The Python FastAPI backend and React frontend provide a complete, real-time analytics suite empowering teachers to monitor, diagnose, and personalize instruction for diverse learners.

### 1. Teacher Authentication & Access Control
- **Teacher Profile:** Dedicated access for instructor `Dr. Elena Sharma` (`user-teacher-1`, Inclusive Education Specialist).
- **Role-Based Access Control:** Distinct `student` and `teacher` authorization scopes.
- **Persistent Classroom Scope:** Teachers manage their designated cohort (`Inclusive STEM Cohort 2026`).

### 2. Teacher Overview Dashboard & Real-Time KPIs
All values are computed dynamically from SQLite database records:
- **Total Enrolled Students:** Real count of registered cohort members (6 students).
- **Active Learners:** Active engagement tracking across lessons and assessments.
- **Cohort Average Performance:** Mean mastery percentage ($65.2\%$).
- **Cohort Average Quiz Accuracy:** Mean evaluation accuracy ($72.7\%$).
- **Students Requiring Support:** Count of learners in foundational tiers or with active intervention alerts.
- **Learning Improvement Trend:** Calculated linear regression slope across evaluations ($+8.5\%$).
- **Pending Assessments:** Active assignment tracker.

### 3. Student Management (Search, Filter, Sort, Enroll)
- **Search:** Instant real-time filtering across student names and emails.
- **Status Filter:**
  - `Progressing Well (80%+)`: High concept mastery and steady retention.
  - `Showing Improvement (+Slope)`: Positive upward evaluation momentum.
  - `Needs Revision (60–79%)`: Moderate mastery with specific decaying topics.
  - `Requires Support (<60%)`: High misconception density or accuracy below $60\%$.
- **Format Filter:** Filters by preferred accommodation (Simple English, Visual Mindmaps, Audio Narration, Step-by-Step).
- **Sorting:** By Mastery (desc/asc), Quiz Accuracy, Total Study Time, or Name.
- **Class Enrollment:** `POST /api/teacher/students` allows enrolling new learners with custom accommodation baselines.

### 4. AI Learning Difficulty Detection Engine
- Analyzes quiz accuracy, repeated incorrect choices, lesson completion rate, study time, and knowledge gap severity.
- Assigns non-medical operational categories (`progressing_well`, `showing_improvement`, `needs_revision`, `requires_support`) with concrete evidence and suggested pacing.
- **Ethical Non-Diagnosis Guarantee:** Never classifies medical disabilities or makes assumptions about student abilities.

### 5. Interactive Knowledge Gap Heatmap
- **Matrix View:** Students $\times$ Topics matrix with color-coded mastery:
  - 🟢 **Emerald (Mastered $\ge 80\%$):** Autonomous concept confidence.
  - 🟡 **Amber (Review Needed $60–79\%$):** Targeted revision recommended.
  - 🔴 **Rose (Struggling $<60\%$):** Active intervention required.
- **Subject Filtering:** Toggle between All Subjects, Computer Science, Mathematics, Programming, and Environmental Science.
- **Cohort Topic Indicators:** Automatically surfaces the **Strongest Topic** and the **Topic Requiring Reinforcement** (e.g. Fractions & Denominators).

### 6. AI Teaching Recommendation Engine & Insights
- **Evidence-Based Insights:** Directly references measured statistics from the database (e.g. "Misconception Pattern: 2 students share denominator normalization confusion").
- **Prioritized Recommendations:** Actionable teacher interventions with priority levels (`urgent`, `high`, `medium`), suggested formats, and pedagogical rationales.

### 7. Class Performance Analytics
- **Subject-Wise Comparisons:** Mastery and quiz accuracy across all curriculum subjects.
- **Score Distribution Histogram:** Foundational ($<60\%$), Proficient ($60–79\%$), and Mastery ($80–100\%$) bands.
- **Weekly Pacing Trends:** Tracks cohort accuracy trajectory across weeks.
- **Format Utilization:** Visualizes accommodation usage distribution across the class.

### 8. Student Progress Timeline
- Chronological learning journey for individual students:
  - Onboarding & baseline establishment.
  - Lesson completion milestones.
  - Quiz attempts with score badges, time spent, and difficulty level.
  - Knowledge gap detection events.
  - Teacher feedback notes history.

### 9. Teacher-Student Communication
- Direct teacher feedback messenger with categories (`guidance`, `praise`, `revision_reminder`, `accommodation`) and priorities (`normal`, `urgent`, `low`).
- Persisted in the SQLite database (`teacher_feedbacks` table) and appended to the student's `LearningProgress.notes` for complete multi-channel visibility.

### 10. PDF Performance Report Generator
- **Class Cohort Report:** Executive summary, student roster, subject mastery matrix, and cohort action items.
- **Individual Student Report:** Student bio, accommodations active, performance summary, strengths, growth areas, topic mastery records, knowledge gaps, and teacher guidance notes.
- **Clean Print Stylesheet:** Clean `@media print` layout ready for instant physical printing or PDF export.

### 11. Phase 6 FastAPI REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/teacher/dashboard` | Real-time classroom overview, KPI metrics, student cards, alerts, and recent activity. |
| `GET` | `/api/teacher/students` | Filtered, searched, and sorted list of all enrolled students. |
| `GET` | `/api/teacher/students/{student_id}` | Individual student deep dive: metrics, difficulty evaluation, timeline, gaps, feedback. |
| `GET` | `/api/teacher/class-analytics` | Subject comparisons, score distribution histograms, and weekly engagement pacing. |
| `GET` | `/api/teacher/knowledge-heatmap` | Students $\times$ topics performance matrix with color-coded mastery. |
| `GET` | `/api/teacher/insights` | AI Analytics Assistant: evidence-based insights and prioritized recommendations. |
| `POST` | `/api/teacher/feedback` | Send persistent teacher guidance note to student. |
| `GET` | `/api/teacher/reports/{student_id}` | Generate structured downloadable/printable performance report (class or student). |
| `POST` | `/api/teacher/students` | Enroll a new student into the teacher's class. |
| `POST` | `/api/teacher/assignments` | Dispatch new inclusive learning assignment to students. |
| `POST` | `/api/teacher/alerts/{id}/resolve` | Mark student intervention alert as resolved. |

---

## ♿ Phase 5: Advanced AI-Powered Accessibility & Inclusive Learning System

AdaptiveLearn AI features a comprehensive, WCAG 2.2 AA compliant multimodal accessibility system designed to eliminate educational barriers across sensory, cognitive, reading, and motor dimensions.

### 1. Personalized Accessibility Profile & Ethical Onboarding
- **Voluntary Self-Determination:** Students choose their accommodation preferences across 8 areas: Visual, Hearing, Reading, Dyslexia, Cognitive, Motor, Voice, and General.
- **Strict Privacy Standard:** The platform **never automatically diagnoses or classifies a disability** based on quiz performance or response time. Preferences remain user-controlled.
- **Cloud Persistence:** Saved across SQLite `LearnerProfile.accessibility_preferences` and browser `localStorage`.

### 2. Visual Accessibility Mode
- **Dynamic Text Scaling:** Standard (16px), Medium (18px), Large (20px), X-Large (23px).
- **High Contrast Palettes:**
  - *Warm Ivory (`#FFF9F5`):* Brand default with rose coral accents.
  - *High Contrast Light (WCAG AAA):* Crisp black text on white with bold 2px borders.
  - *Black & Gold (WCAG AAA 14:1 Ratio):* Deep black background with luminous `#FACC15` text.
  - *Sepia Cream:* Warm espresso text on non-glare parchment background.
- **Screen Reader Compatibility:** Full semantic HTML landmarks, ARIA labels, and polite live region announcers.
- **Descriptive Visual Support:** Complete structured alt text and tactile descriptions for all diagrams.

### 3. Dyslexia-Friendly Reading Mode
- **OpenDyslexic / Lexend Font:** Heavy baselines and distinct letter shapes prevent character rotation (`b`/`d`/`p`/`q`).
- **Flexible Spacing:** Configurable letter spacing (+1.5px, +3px), word spacing (+3px, +6px), and line height (1.6, 1.85, 2.2).
- **Interactive Reading Ruler:** Floating tinted overlay (Amber, Cyan, or Rose) tracking cursor/focus to anchor line-by-line reading.
- **Bionic Reading Fixation Anchors:** Bolds leading characters of each word to guide rapid visual parsing.
- **Synchronized Speech Highlighting:** Highlights active spoken words in real time during audio read-aloud.

### 4. Hearing Accessibility Mode & Visual Bell
- **Visual Bell Alerting System:** Automatically flashes an on-screen amber notification banner and badge whenever audio cues trigger, ensuring deaf and hard-of-hearing students never miss auditory feedback.
- **Complete Media Transcripts:** Verbatim text transcripts provided for all audio lessons and video content.
- **Customizable Captions:** Adjustable caption font size (Medium 18px, Large 22px, X-Large 26px) with high-contrast text backing.
- **Text-Based AI Tutor:** Full access to all teaching personalities, hints, and explanations without requiring speech or audio hardware.

### 5. Cognitive-Friendly Learning & Focus Mode
- **One Concept at a Time:** Deconstructs complex lessons into sequential micro-cards to avoid cognitive overload.
- **Distraction-Free Focus Mode:** Hides peripheral navigation, sidebars, and background ornamentation.
- **Guided Zen Break:** 2-minute 4-7-8 breathing relaxation overlay to reset mental fatigue.
- **Extended Assessment Time:** Built-in quiz time multipliers ($1.0\times$ Standard, $1.5\times$ Extra Time, $2.0\times$ Double Time).
- **NLP Readability Simplifier:** Replaces dense jargon with plain language and measures Flesch-Kincaid Grade Level and Reading Ease gains.

### 6. Motor & Physical Accessibility Mode
- **Keyboard-First Navigation:** 100% accessible via `Tab`, `Shift+Tab`, `Space`, `Enter`, `Esc`, and arrow keys.
- **WCAG 2.5.5 Touch Targets:** All interactive controls enforce a minimum $44\times 44\text{px}$ clickable area.
- **Prominent Focus Indicators:** 4px high-contrast solid focus rings with outer glow halos.
- **Zero Mandatory Drag-and-Drop:** All interactions provide single-click or keyboard selection alternatives.

### 7. AI Content Accessibility Transformer (5 Accessible Formats)
The Python engine takes any educational text and generates 5 distinct WCAG-aligned representations:
- **Output A (Simple Reading):** Grade 4–6 Flesch-Kincaid vocabulary with clear key terminology definitions.
- **Output B (Step-by-Step Breakdown):** Sequentially numbered instruction cards with explicit checkpoint actions.
- **Output C (Audio Script):** Paced for $0.9\times$ relaxed speech rate with natural pause markers and pronunciation guides.
- **Output D (Visual Diagram):** Clean SVG flowcharts with tactile verbal descriptions and screen-reader alt text.
- **Output E (Cognitive Micro-Cards):** Isolated bite-sized concept cards with self-check questions and pause reminders.

### 8. Verified Sign Language Learning Support
- **Alphabet Finger Spelling (A–Z):** Complete 26-letter interactive cards with handshape anatomy and movement notes.
- **Count Signs (1–10):** Number sign library with directional orientations.
- **Core Educational Vocabulary (10 Signs):** STEM and classroom signs (*Hello*, *Thank You*, *Help*, *Learn*, *Computer*, *Science*, *Math*, *Loop*, *Leaf*, *Question*).
- **Ethics & Accuracy Notice:** Verified against American Sign Language (ASL) educational standards; does not make unverified claims of automated translation.

### 9. Phase 5 FastAPI REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/accessibility/profile` | Save student's voluntary accessibility selections (needs, text size, contrast, spacing, audio speed, cognitive mode, motor mode). |
| `GET` | `/api/accessibility/profile` | Retrieve active accessibility profile with comprehensive defaults. |
| `PUT` | `/api/accessibility/preferences` | Granular update of specific accessibility settings without resetting profile. |
| `POST` | `/api/accessibility/transform-content` | AI Content Transformer converting lesson text into Outputs A through E. |
| `POST` | `/api/accessibility/simplify` | Algorithmic NLP readability engine calculating Flesch-Kincaid grade level and reading ease improvements. |
| `GET` | `/api/accessibility/resources` | Returns curated, verified ASL alphabet, numbers 1–10, educational vocabulary signs, and assistive guides. |

---

## ⚡ Phase 4: Multimodal AI Tutor & Learning Assistant REST API Endpoints

The Python FastAPI backend exposes 8 dedicated REST endpoints for the Intelligent AI Tutor:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tutor/chat` | Multi-turn conversational AI tutor with 5 teaching personalities (`simple`, `visual`, `step_by_step`, `practice`, `revision`) and Socratic hint dialogue. |
| `POST` | `/api/tutor/explain` | Generates tailored explanations (`simple`, `detailed`, `step_by_step`, `analogy`, `hints`). |
| `POST` | `/api/tutor/summarize` | Returns high-yield executive summaries, memory anchors, and mnemonics. |
| `POST` | `/api/tutor/transform` | Transforms one lesson into 10 distinct accessible formats (Simple, Detailed, Audio, Visual, Steps, Summary, Flashcards, Quiz, Real-World, Revision). |
| `POST` | `/api/tutor/flashcards` | Generates interactive flashcards with front/back, mnemonic hints, and difficulty ratings (`easy`, `medium`, `hard`). |
| `POST` | `/api/tutor/visualize` | Generates Mermaid flowchart syntax, comparison matrices, and formatted mathematical LaTeX formulas. |
| `POST` | `/api/tutor/voice` | Classifies voice command transcripts ("read lesson", "simplify", "quiz me", "summarize") and returns phonetic TTS speech payloads. |
| `POST` | `/api/tutor/document-upload` | AI Doubt Solver: extracts text from uploaded PDF/text notes via `PyPDF2` and provides grounded contextual Q&A. |

---

## ⚡ Phase 3: Adaptive Learning Engine REST API Endpoints

The Python FastAPI backend exposes 8 dedicated REST endpoints for the Adaptive Learning Engine:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/learner/profile` | Update learner profile with voluntarily selected accommodations. Never infers disability from performance. |
| `POST` | `/api/learner/analyze` | Generates individual learner intelligence: pacing, knowledge tier, improvement slope (via `LinearRegression`), weak/strong topics, and pedagogical strategy. |
| `POST` | `/api/quiz/submit` | Evaluates student quiz answers, adjusts difficulty tier (Beginner/Intermediate/Advanced) using rolling accuracy rules, and updates BKT mastery state. |
| `GET` | `/api/learner/progress` | Fetches overall mastery score, topic-wise performance aggregates, and sequential learning improvement graph. |
| `GET` | `/api/learner/recommendations` | Dynamically recommends personalized learning actions (prerequisite remediation, challenge exercises, revision, next core lesson). |
| `POST` | `/api/content/adapt` | Multi-format content transformation engine generating 8 distinct formats (Simple English, Detailed, Summary, Step-by-Step, Key Points, Real-World Examples, Flashcards, Practice Questions). |
| `GET` | `/api/learner/knowledge-gaps` | Detects topic-wise knowledge gaps (<60% mastery) and provides concept dependency graph prerequisite mappings. |
| `GET` | `/api/learner/revision-plan` | Smart revision scheduler using Ebbinghaus Spaced Repetition ($R(t) = e^{-t/S}$) calculating retention decay and queues. |

---

## 🏆 Hackathon Credits & Acknowledgments
- **Hackathon Challenge**: HI-03: Adaptive Learning for Students with Disabilities
- **AI Engine**: Python FastAPI, scikit-learn, NumPy, Pandas, Bayesian Knowledge Tracing, Item Response Theory
- **Design System**: Warm rose coral `#E83B64`, warm ivory page background, accessible contrast tokens exceeding WCAG 2.2 AA standards.

---

## 🚀 PHASE 7: ADVANCED AI INNOVATION SYSTEM

### 1. Architectural Highlights
- **AI Digital Learning Twin (`/twin`)**: Real-time multi-dimensional student avatar mapping knowledge mastery, learning velocity (1.25x baseline), spaced retention index (84.5%), cognitive load tolerance (20-min sprints), and chronological evolution stages (Initial Baseline &rarr; Calibration &rarr; Live &rarr; 30-Day Projected Horizon).
- **Predictive Learning Analytics (scikit-learn ML)**: `RandomForestRegressor` and `GradientBoostingRegressor` models estimating 7-day, 14-day, and 30-day mastery trajectories with 89.2% confidence and 4-factor explainability weights.
- **Dynamic Smart Learning Path**: Prerequisite directed acyclic graph (DAG) curriculum engine dynamically unlocking downstream modules upon mastery.
- **AI Exam & Practice Paper Generator (`/exams`)**: Multimodal assessment builder generating MCQs, True/False, Fill-in-the-blanks, Short-Answer, and Real-World Application questions with instant rubric evaluation and celebration rewards.
- **Multilingual AI Learning Engine**: English, Hindi (हिंदी), and Telugu (తెలుగు) translation preserving core scientific nomenclature (CPU, RAM, ALU, Photosynthesis, Chlorophyll, Python).
- **Gamified XP & Milestone System**: 5 learner levels, streaks, daily challenges, and privacy-respecting opt-in leaderboards.
- **Curated Resource Recommender & Bookmarks**: PhET interactive simulations, CrashCourse videos, and printable OpenDyslexic worksheets.
- **Consent-Protected Parent Dashboard (`/parent`)**: Positive home partnership portal with study metrics, celebrations, teacher notes, and home conversation starters.
- **Learning Achievement Passport (`/passport`)**: Verified digital credential portfolio with cryptographic verification seals, accredited certificates, and printable HTML/PDF export.

### 2. Phase 7 FastAPI REST Endpoints
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/learning-twin/analyze` | `POST` | Recalculates dynamic multi-dimensional learning twin metrics |
| `/api/learning-twin/profile` | `GET` | Fetches student digital learning twin profile and evolution timeline |
| `/api/predictions/learning-progress` | `POST` | Scikit-learn ML regression forecasting future mastery trajectories |
| `/api/learning-path` | `GET` | Retrieves dynamic prerequisite curriculum DAG and next recommended lesson |
| `/api/learning-path/update` | `POST` | Evaluates node completion and unlocks downstream dependent modules |
| `/api/exams/generate` | `POST` | Synthesizes tailored exam papers across 5 distinct question formats |
| `/api/exams/submit` | `POST` | Evaluates exam answers with instant rubric grading and XP awards |
| `/api/translate` | `POST` | Translates content to Hindi/Telugu while preserving scientific terms |
| `/api/gamification/profile` | `GET` | Retrieves XP, levels, badges, daily challenge, and leaderboard |
| `/api/gamification/award` | `POST` | Awards XP and unlocks milestone achievements with celebration payload |
| `/api/resources/recommendations` | `GET` | Recommends verified external simulations, videos, and worksheets |
| `/api/resources/bookmark` | `POST` | Persists or removes offline bookmarks |
| `/api/parent/dashboard` | `GET` | Retrieves consent-approved supportive family overview |
| `/api/achievement-passport` | `GET` | Generates official accredited achievement passport portfolio |

### 3. Verification & Test Suite
Run the Phase 7 comprehensive test suite:
```bash
python neural/backend/tests/test_innovation_system.py
```
- **10/10 Comprehensive Tests Passing (100% Success)**.
- **10-Step Demonstration Workflow Verified End-to-End**.
- **Frontend Vite build passing in 1.25s with 0 errors**.

---

## 🔒 PHASE 9: COMPLETE SECURE AUTHENTICATION & USER ACCOUNT MANAGEMENT

### 1. Security Architecture & Cryptographic Standards
- **Password Protection**: Salted `bcrypt` hashing with 12 rounds. Enforces strict complexity: $\ge 8$ characters, uppercase, lowercase, numbers, and special symbols.
- **JWT & Session Security**: Short-lived access tokens (30 minutes) using standard `HS256` signatures, paired with secure 30-day refresh tokens with rotation and SHA-256 token hashing.
- **Two-Factor Authentication (2FA / TOTP)**: RFC 6238 time-based one-time password standard via `pyotp` compatible with Google Authenticator, Microsoft Authenticator, and Authy. Generates 8 one-time cryptographic backup recovery codes.
- **Email Verification & OTP**: 32-byte cryptographic URL tokens (24-hour expiration) and 6-digit cryptographic OTPs (5-minute expiration, 5 max attempts). All tokens and OTPs are stored in the database exclusively as SHA-256 hashes.
- **Social OAuth 2.0**: Official Google OAuth and Facebook Login integration with state validation, profile retrieval, and automatic account linking.
- **Brute Force Protection & Account Lockout**: Automatic 15-minute account lockout after 5 consecutive failed login attempts, accompanied by automated suspicious login alert emails.
- **Role-Based Access Control (RBAC)**: Fine-grained authorization enforcing `student`, `teacher`, and `admin` roles on sensitive API endpoints (`require_role(["teacher", "admin"])`).
- **Session Tracking & Remote Revocation**: Device fingerprinting (IP address, User Agent, device type, location, last active timestamp) with instant single-session or all-session revocation.
- **Email Notification Service**: Pluggable SMTP delivery with built-in development `LOCAL OUTBOX` logging. Generates 10 responsive, accessible HTML email templates.

### 2. Modern Frontend UI & Account Security Dashboard
- **Modern Auth Experience (`/auth`)**: Premium responsive redesign featuring a tab switcher (Sign In, Register, Email OTP, Demo Personas), official Google & Facebook buttons, password visibility toggle, real-time password strength meter, confirm password match indicator, and role selector cards (Student 🎓 vs Teacher 👩‍🏫).
- **Account Security Dashboard (`/security`)**: Dedicated portal for inspecting account credentials, toggling 2FA with QR manual key setup, changing passwords with real-time complexity validation, inspecting active device sessions with remote termination, and viewing immutable security audit logs.

### 3. Phase 9 Authentication & Security REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user with bcrypt hash, password validation, and verification email |
| `POST` | `/api/auth/login` | Authenticate user, verify credentials, enforce lockout, issue JWT + refresh token |
| `POST` | `/api/auth/refresh-token` | Rotate refresh token and issue new 30-minute JWT access token |
| `POST` | `/api/auth/logout` | Invalidate active session and revoke current refresh token |
| `GET` | `/api/auth/google` | Generates official Google OAuth2 authorization URL |
| `GET` | `/api/auth/google/callback` | Exchanges Google authorization code, links profile, and logs in user |
| `GET` | `/api/auth/facebook` | Generates official Facebook Login authorization URL |
| `GET` | `/api/auth/facebook/callback` | Exchanges Facebook code, links profile, and logs in user |
| `GET` | `/api/auth/verify-email` | Verifies account using 24-hour cryptographic token hash |
| `POST` | `/api/auth/resend-verification` | Resends verification email with rate-limiting protection |
| `POST` | `/api/auth/send-otp` | Generates cryptographically secure 6-digit email OTP (5-minute expiry) |
| `POST` | `/api/auth/verify-otp` | Verifies 6-digit OTP, checks attempt counter, and signs in user |
| `POST` | `/api/auth/forgot-password` | Initiates password reset flow with account enumeration protection |
| `POST` | `/api/auth/reset-password` | Resets password with complexity enforcement and terminates previous sessions |
| `POST` | `/api/auth/change-password` | Changes password for authenticated user, validating current password |
| `POST` | `/api/auth/2fa/enable` | Generates TOTP secret key and 8 backup recovery codes |
| `POST` | `/api/auth/2fa/verify` | Confirms TOTP token to activate 2FA on the user account |
| `POST` | `/api/auth/2fa/disable` | Deactivates 2FA after verifying user password or backup code |
| `GET` | `/api/auth/sessions` | Lists all active user sessions with IP, device, browser, and activity timestamps |
| `POST` | `/api/auth/sessions/revoke` | Revokes a specific active session or all other sessions |
| `GET` | `/api/auth/security-logs` | Retrieves chronological security audit trail (logins, 2FA, password changes) |

### 4. Automated Security Test Suite
Run the 15-scenario automated authentication and security test suite:
```bash
python neural/backend/tests/test_secure_auth.py
```
- **15/15 Authentication & Security Scenarios Passing (100% Success)**:
  1. User registration with bcrypt hash ($12\text{ rounds}$) & welcome email.
  2. Rejection of weak passwords across all 5 complexity criteria.
  3. Rejection of duplicate email registration (HTTP 400).
  4. Email verification flow via SHA-256 token hash.
  5. Rejection of expired verification tokens.
  6. Login with correct credentials & JWT + refresh token issuance.
  7. Account lockout after 5 consecutive failed login attempts (HTTP 423 Locked).
  8 & 9. Google & Facebook OAuth initiation URL generation.
  10. Cryptographically secure 6-digit email OTP generation.
  11. OTP verification, expiry handling, and attempt limits.
  12. Password recovery flow with account enumeration protection.
  13. Two-Factor Authentication (TOTP pyotp + backup codes) setup, challenge, and disable.
  14. Session management and remote session revocation.
  15. Role-Based Access Control (RBAC) enforcement on restricted endpoints.



---

## Phase 10: Complete AI-Powered Course and Lesson Management System

Phase 10 transforms AdaptiveLearn AI into a comprehensive, multi-disciplinary educational platform featuring a structured hierarchical curriculum, multi-modal AI lesson adaptation, interactive assessments, progress tracking, faculty authoring tools, and verifiable certificate issuance.

### 1. Seven Major Course Categories
1. **Programming & Computer Science**: Python, Java, C++, JavaScript, Data Structures & Algorithms, Object-Oriented Programming, Web Development, React, Node.js, DBMS, SQL, Operating Systems, Computer Networks, AI, Machine Learning, Deep Learning, Generative AI, Cybersecurity, Cloud Computing, Git.
2. **Mathematics**: Basic Mathematics, Algebra, Geometry, Trigonometry, Calculus, Probability, Statistics, Discrete Mathematics, Linear Algebra, Numerical Methods.
3. **Science & Engineering**: Physics, Chemistry, Biology, Environmental Science, Electronics, Engineering Physics.
4. **Languages & Communication**: English Grammar, Spoken English, Vocabulary Building, Communication Skills, Technical Writing, Hindi, Telugu, Public Speaking.
5. **Professional & Career Skills**: Aptitude Preparation, Logical Reasoning, Quantitative Aptitude, Interview Preparation, Resume Building, Group Discussion, Problem Solving, Time Management.
6. **Business & Digital Skills**: Entrepreneurship, Digital Marketing, Financial Literacy, Data Analytics, Excel, Power BI, Project Management, Business Communication.
7. **Competitive Exam Preparation**: GATE Computer Science, GATE Data Science & AI, Placement Preparation, Coding Interview Preparation, University Examination Preparation.

### 2. Five Comprehensive Demonstation Curricula
* **Course 1: Python Programming: From Novice to Software Architect** (7 Modules, 32 Lessons, 7 Quizzes, Final Exam)
* **Course 2: Java Programming & Enterprise Software Engineering** (5 Modules, 20 Lessons, Quizzes, Final Exam)
* **Course 3: Modern Full-Stack Web Development with React & Node.js** (6 Modules, 18 Lessons, Quizzes, Final Exam)
* **Course 4: Database Management Systems & SQL Mastery** (6 Modules, 18 Lessons, Quizzes, Final Exam)
* **Course 5: Data Structures & Algorithms: From Foundations to Advanced** (7 Modules, 21 Lessons, Quizzes, Final Exam)

### 3. Eight Multi-Modal AI Lesson Adaptations
Every lesson dynamically morphs across 8 accessible learning formats:
1. **Simple English**: Elementary vocabulary and short sentence structure for lower reading levels and non-native speakers.
2. **Detailed Explanation**: Comprehensive theoretical deep-dives with architectural breakdowns.
3. **Step-by-Step Guide**: Sequential numbered procedures for systematic learners.
4. **Visual Diagram**: Interactive Mermaid syntax flowcharts and architecture diagrams.
5. **Audio Narration**: Spoken narration script with Web Speech synthesis and playback controls.
6. **Example-Based**: Practical analogies and industry case studies.
7. **Revision Notes**: Bulleted memory cards and key takeaway summaries.
8. **Interactive Practice**: Hands-on coding exercises and active recall challenges.

### 4. Interactive 3-Column Lesson Player Studio (`/courses/:courseId/learn/:lessonId`)
* **Left Navigation**: Collapsible syllabus hierarchy showing course modules, lesson checklist, completed status, and direct quiz links.
* **Center Studio**: Comprehensive learning view with 8 AI format switcher tabs, code syntax highlighting, Mermaid rendering, and navigation triggers.
* **Right Assistant**: Collapsible studio panel housing Socratic AI Tutor (Aria), real-time personal note-taking, lesson bookmarks, and post-lesson assessments.

### 5. Automated Assessment & Certification Engine
* **Interactive Quizzes**: Multiple choice, true/false, fill-in-the-blank, and coding evaluation with instant feedback, hints, and explanations.
* **Mastery Thresholds**: 70% passing requirement with automatic recalculation of course progress.
* **Verified Certificates**: Automatic issuance of unique tamper-proof certificate identifiers (e.g. `ALAI-CERT-PYTHON-EB1329`) on passing final exams.

### 6. Phase 10 REST API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/courses/categories` | Lists all 7 major course categories with icon and course counts |
| `GET` | `/api/courses` | Searchable, multi-filterable course catalog with difficulty and sorting |
| `GET` | `/api/courses/{course_id}` | Detailed course syllabus, instructor bio, and enrollment metadata |
| `GET` | `/api/courses/{course_id}/modules` | Hierarchical modules, lessons, and assessment structure |
| `POST` | `/api/courses/{course_id}/enroll` | Enrolls student into a course and initializes progress tracking |
| `GET` | `/api/student/my-courses` | Lists all active and completed student enrollments |
| `GET` | `/api/student/course-progress/{course_id}` | Real-time course progress percentage, completed count, and time spent |
| `GET` | `/api/lessons/{lesson_id}` | Full lesson content with all 8 AI adaptation representations |
| `POST` | `/api/lessons/{lesson_id}/complete` | Marks lesson as completed, recalculates course percentage, and awards XP |
| `POST` | `/api/lessons/{lesson_id}/bookmark` | Toggles lesson bookmark for rapid revision |
| `GET/POST`| `/api/lessons/{lesson_id}/notes` | Saves and retrieves student's personal notes for the lesson |
| `POST` | `/api/assessments/{assessment_id}/submit` | Evaluates assessment attempts, computes score, and generates certificates |
| `GET` | `/api/courses/{course_id}/certificate` | Retrieves official issued completion certificate |
| `GET` | `/api/courses/recommendations` | AI-driven course recommendations with pedagogical explainability |
| `POST` | `/api/teacher/courses` | Faculty endpoint to create new courses |
| `PUT` | `/api/teacher/courses/{course_id}` | Faculty endpoint to update course metadata |
| `POST` | `/api/teacher/courses/{course_id}/modules` | Faculty endpoint to create structured modules |
| `POST` | `/api/teacher/modules/{module_id}/lessons` | Faculty endpoint to author lessons with AI format content |
| `PUT` | `/api/teacher/lessons/{lesson_id}` | Faculty endpoint to update lesson content |
| `DELETE` | `/api/teacher/lessons/{lesson_id}` | Faculty endpoint to delete lesson |
| `POST` | `/api/teacher/lessons/{lesson_id}/resources` | Faculty endpoint to upload lesson resources (PDFs, slides) |

### 7. Phase 10 Automated Test Suite
Run the 12-scenario course and lesson management test suite:
```bash
python neural/backend/tests/test_course_system.py
```
- **12/12 Scenarios Passing (100% Success)**:
  1. Course categories query & major category validation.
  2. Course discovery, multi-dimensional filtering, and search.
  3. Course syllabus hierarchy and learning outcomes.
  4. Module sequential structure & indicators.
  5. Student enrollment workflow.
  6. 8 multi-modal AI lesson adaptation formats.
  7. Lesson completion & course progress recalculation.
  8. Lesson bookmarks & personal student notes persistence.
  9. Module assessment submission and grading.
  10. Final exam completion & verified certificate issuance.
  11. AI course recommendation generation with pedagogical explainability.
  12. Teacher course management, lesson authoring, and resource uploading.
