import os
import sys

os.environ["LOKY_MAX_CPU_COUNT"] = "4"
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from database import SessionLocal
from models import User, Lesson
from ai_engine import learning_dna_engine, bkt_engine, irt_engine, nlp_simplifier, ai_tutor, revision_scheduler

db = SessionLocal()
users = db.query(User).all()
print(f"Users in DB: {[u.id for u in users]}")

lessons = db.query(Lesson).all()
print(f"Lessons in DB: {[l.id for l in lessons]}")

student_a = db.query(User).filter(User.id == "user-student-a").first()
dna_a = learning_dna_engine.compute_dna(student_a.profile.to_dict())
print("Student A DNA:", dna_a["archetype"], dna_a["genomeHash"])

student_b = db.query(User).filter(User.id == "user-student-b").first()
dna_b = learning_dna_engine.compute_dna(student_b.profile.to_dict())
print("Student B DNA:", dna_b["archetype"], dna_b["genomeHash"])

# Test BKT
p_l = 0.5
p_l_after_correct = bkt_engine.update(p_l, True)
print("BKT update correct:", p_l, "->", p_l_after_correct)

# Test IRT
theta = 0.0
beta = irt_engine.difficulty_map["medium"]
new_theta = irt_engine.update_ability(theta, beta, 1.0)
rec = irt_engine.recommend_difficulty(new_theta)
print("IRT update:", theta, "->", new_theta, "Rec Tier:", rec["tier"], rec["level"])

# Test 5 experiences
five_exp = nlp_simplifier.generate_five_experiences("Computer Hardware", lessons[0].original_content.get("fullText", ""))
print("5 Experiences generated:", list(five_exp["experiences"].keys()))

# Test AI Tutor
tutor_res = ai_tutor.answer_query("Explain RAM simply", student_profile=student_a.profile.to_dict())
print("AI Tutor reply:", tutor_res["reply"][:80], "...")

db.close()
print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

