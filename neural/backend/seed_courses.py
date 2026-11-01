import os
import sys
import json
from datetime import datetime
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import (
    CourseCategory,
    Course,
    CourseModule,
    CourseLesson,
    LessonResource,
    CourseAssessment,
    CourseQuestion,
    CourseEnrollment,
    CourseLessonProgress,
    AssessmentAttempt,
    CourseCertificate,
    StudentLessonNote,
    LessonBookmark,
)

def seed_courses_system(db: Session = None):
    close_at_end = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_at_end = True

    try:
        # Check if categories already exist
        if db.query(CourseCategory).count() > 0:
            print("[SEED COURSES] Course categories already exist, skipping seed.")
            return

        print("[SEED COURSES] Initializing complete Course and Lesson Management System...")

        # -------------------------------------------------------------
        # 1. SEED COURSE CATEGORIES (7 Major Categories)
        # -------------------------------------------------------------
        categories_data = [
            {
                "id": "cat-cs",
                "name": "Programming & Computer Science",
                "description": "Master software engineering, algorithms, Python, Java, web technologies, and modern AI.",
                "thumbnail": "Code",
                "sequence_order": 1,
            },
            {
                "id": "cat-math",
                "name": "Mathematics",
                "description": "Foundational and advanced mathematics: calculus, linear algebra, discrete math, and statistics.",
                "thumbnail": "PieChart",
                "sequence_order": 2,
            },
            {
                "id": "cat-science",
                "name": "Science & Engineering",
                "description": "Physics, chemistry, biology, electronics, and engineering sciences with interactive simulations.",
                "thumbnail": "Atom",
                "sequence_order": 3,
            },
            {
                "id": "cat-lang",
                "name": "Languages & Communication",
                "description": "English grammar, spoken communication, public speaking, and regional languages.",
                "thumbnail": "MessageSquare",
                "sequence_order": 4,
            },
            {
                "id": "cat-career",
                "name": "Professional & Career Skills",
                "description": "Quantitative aptitude, logical reasoning, technical interviews, resume building, and leadership.",
                "thumbnail": "Briefcase",
                "sequence_order": 5,
            },
            {
                "id": "cat-business",
                "name": "Business & Digital Skills",
                "description": "Data analytics, Power BI, Excel, project management, financial literacy, and entrepreneurship.",
                "thumbnail": "TrendingUp",
                "sequence_order": 6,
            },
            {
                "id": "cat-exams",
                "name": "Competitive Exam Preparation",
                "description": "GATE Computer Science, Data Science & AI, university exam prep, and placement tests.",
                "thumbnail": "Award",
                "sequence_order": 7,
            },
        ]

        for cat in categories_data:
            db.add(CourseCategory(**cat))
        db.commit()
        print(f"[SEED COURSES] Seeded {len(categories_data)} categories.")

        # -------------------------------------------------------------
        # 2. COURSE 1: Python Programming
        # -------------------------------------------------------------
        c_python = Course(
            id="course-python",
            category_id="cat-cs",
            title="Python Programming: From Novice to Software Architect",
            description="Comprehensive mastery of Python 3: fundamentals, data structures, object-oriented design, functional programming, APIs, and real-world project development.",
            difficulty="Beginner",
            instructor_id="user-teacher-1",
            instructor_name="Dr. Elena Sharma",
            instructor_title="Principal AI Research Educator",
            thumbnail="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=80",
            icon="Terminal",
            color="#3B82F6",
            estimated_duration="24 hours",
            rating=4.9,
            rating_count=342,
            enrollment_count=1240,
            published=True,
            learning_outcomes=[
                "Write idiomatic, clean Python 3 code adhering to PEP 8 standards.",
                "Manipulate primitive and advanced data structures (lists, dicts, tuples, sets, generators).",
                "Implement Object-Oriented principles: inheritance, encapsulation, polymorphism, and magic methods.",
                "Handle files, exceptions, and asynchronous network API requests.",
                "Architect and deploy a real-world software project with automated testing.",
            ],
            prerequisites=["No prior coding experience required; basic computer literacy."],
        )
        db.add(c_python)
        db.flush()

        # Modules & Lessons for Python
        py_modules = [
            ("mod-py-1", "Module 1: Introduction to Python", "Core philosophy, environment setup, and writing your very first Python program.", 1, [
                ("cl-py-m1-l1", "What is Python & Its Ecosystem?", 15, 1, 
                 ["Understand Python history and philosophy", "Identify Python use-cases across AI, Web, and Automation"],
                 "Python is an interpreted, high-level, dynamically typed language created by Guido van Rossum in 1991. It emphasizes readability and developer productivity.",
                 "print('Hello, Inclusive World!')",
                 "graph TD; A[Python Code .py] --> B[CPython Bytecode .pyc]; B --> C[Python Virtual Machine PVM]; C --> D[CPU Execution];",
                 "Think of Python like English sentences: easy to read, with built-in tools for almost every task imaginable.",
                 "Python source files (.py) are translated by the interpreter into bytecode (.pyc), which runs smoothly inside the Python Virtual Machine (PVM) across Windows, Mac, and Linux.",
                 ["Step 1: Write code in a text file (.py)", "Step 2: Interpreter parses syntax", "Step 3: Compiles to bytecode", "Step 4: Virtual Machine executes instructions"],
                 "Automating spreadsheet reports, training machine learning models, or scripting web servers like Instagram and Spotify.",
                 "• Created in 1991\n• Readable indentation syntax\n• Huge standard library ('Batteries Included')\n• Dynamically typed"),

                ("cl-py-m1-l2", "Features of Python", 15, 2,
                 ["Examine Python design principles", "Understand dynamic typing vs static typing"],
                 "Python provides rapid prototyping, automatic memory management via garbage collection, and multi-paradigm programming (procedural, OOP, functional).",
                 "x = 10\nx = 'Now I am text'\nprint(type(x))",
                 "graph LR; OOP[Object-Oriented] --- Multi[Python Multi-Paradigm]; Procedural --- Multi; Functional --- Multi;",
                 "Python gives you freedom: you don't need to specify variable types in advance—Python figures it out as it runs.",
                 "Features include automatic memory management via reference counting, cross-platform portability, extensible C-APIs, and rich package indexes like PyPI.",
                 ["1. Open-source under PSF license", "2. Dynamic typing with duck typing semantics", "3. Automatic garbage collection", "4. Rich community libraries"],
                 "A data analyst writing 5 lines of Python to plot a graph instead of 50 lines in low-level languages.",
                 "• Easy to learn and read\n• Interpreted language\n• Dynamic typing\n• Portable across platforms"),

                ("cl-py-m1-l3", "Installing Python & IDE Setup", 20, 3,
                 ["Install Python 3 and verify PATH", "Set up VS Code or Jupyter"],
                 "Installing Python 3 on Windows, macOS, or Linux, configuring pip, and setting up an accessible development environment.",
                 "# Terminal check\npython --version\npip --version",
                 "flowchart TD; Download[Download python.org] --> CheckPath[Check 'Add Python to PATH']; CheckPath --> Install[Install Now]; Install --> Verify[Verify terminal command];",
                 "Installing Python is like plugging in an engine; your IDE (like VS Code) is the dashboard and steering wheel.",
                 "Ensure the checkbox 'Add Python to PATH' is ticked on Windows to ensure command-line access. Verify via 'python -V' and install virtual environments using 'venv'.",
                 ["Download installer from python.org", "Enable PATH checkbox", "Open terminal and run python --version", "Configure VS Code with Python extension"],
                 "Setting up your digital workshop before building your first application.",
                 "• Tick 'Add to PATH' on Windows\n• Use python3 or py command\n• pip is the package manager"),

                ("cl-py-m1-l4", "Writing Your First Python Program", 20, 4,
                 ["Use the print() function", "Accept user input with input()", "Comment code properly"],
                 "Learn the canonical 'Hello, World!' program, standard I/O functions, string formatting with f-strings, and code comments.",
                 "# Welcome program\nname = input('What is your name? ')\nprint(f'Hello, {name}! Welcome to AdaptiveLearn AI.')",
                 "graph LR; Input[User Type in Console] --> InputFunc[input Function]; InputFunc --> Variable[name Variable]; Variable --> PrintFunc[f-string Print Output];",
                 "The print function is Python speaking aloud; the input function is Python listening to your voice or keyboard.",
                 "The input() function always returns a string (str). To perform arithmetic, you must explicitly cast using int() or float(). Comments begin with a hash symbol (#).",
                 ["1. Prompt user for string", "2. Store value in memory identifier", "3. Format string with f'{var}'", "4. Output to stdout"],
                 "An automated registration greeting at a library or school check-in kiosk.",
                 "• print() writes to standard output\n• input() reads line as string\n• f'Hello {name}' is modern f-string syntax"),

                ("cl-py-m1-l5", "Variables and Data Types", 25, 5,
                 ["Differentiate int, float, str, and bool", "Understand variable assignment and type casting"],
                 "Explore fundamental scalar data types in Python: integers (int), floating-point numbers (float), strings (str), and booleans (bool).",
                 "age = 16          # int\ngpa = 3.95        # float\nstudent = True    # bool\nname = 'Aarav'    # str\n\nprint(f'{name} (age {age}) has GPA {gpa}')",
                 "classDiagram\nclass PythonTypes{\n  int : whole numbers\n  float : decimal numbers\n  str : text sequences\n  bool : True or False\n}",
                 "Variables are labeled storage boxes in your computer's memory. You put values inside and label the box with a name.",
                 "Python variables are references to objects stored in memory heap. Objects are strongly typed, meaning types do not convert silently without explicit casting.",
                 ["1. Choose descriptive variable name", "2. Assign with '=' operator", "3. Inspect type with type(variable)", "4. Convert types with int(), float(), str()"],
                 "Tracking a student's age, exam percentage, name, and enrollment status in a school database.",
                 "• Variables are dynamically typed references\n• int, float, str, bool are core primitives\n• Use type() to inspect types\n• Use int() / float() for casting"),
            ]),

            ("mod-py-2", "Module 2: Python Fundamentals", "Control flow, decision making, logical branching, and iterative loops.", 2, [
                ("cl-py-m2-l1", "Python Operators", 20, 1,
                 ["Master arithmetic, comparison, and logical operators", "Understand operator precedence"],
                 "Examine arithmetic (+, -, *, /, //, %, **), comparison (==, !=, >, <, >=, <=), and boolean logical operators (and, or, not).",
                 "x = 10\ny = 3\nprint(x // y)  # Floor division -> 3\nprint(x ** y)  # Exponentiation -> 1000\nprint(x > 5 and y < 5) # True",
                 "graph TD; Exp[** Exponent] --> MulDiv[*, /, //, %]; MulDiv --> AddSub[+, -]; AddSub --> Comp[Comparison ==, !=, <, >]; Comp --> Logical[and, or, not];",
                 "Operators are the math and logic tools: + adds, ** raises to powers, and 'and/or' combine questions.",
                 "Floor division (//) truncates to integer toward negative infinity. True division (/) always returns a float in Python 3. Logical operators short-circuit.",
                 ["Arithmetic: +, -, *, /, //, %, **", "Comparison: ==, !=, >, <, >=, <=", "Logical: and, or, not", "Membership: in, not in"],
                 "Calculating change in a cashier app or determining if a student has passed both math and science tests.",
                 "• / gives float, // gives truncated integer\n• ** computes power\n• 'and' requires both conditions; 'or' requires one\n• 'not' inverts boolean"),

                ("cl-py-m2-l2", "Conditional Statements (if-elif-else)", 25, 2,
                 ["Write multi-branch decision trees", "Utilize nested conditions cleanly"],
                 "Implement conditional branching in Python using if, elif, and else statements with correct indentation blocks.",
                 "score = 88\nif score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'\nelif score >= 70:\n    grade = 'C'\nelse:\n    grade = 'Need Practice'\nprint(f'Grade: {grade}')",
                 "flowchart TD; Start[Test Score] --> Cond1{Score >= 90?}; Cond1 -- Yes --> A[Grade A]; Cond1 -- No --> Cond2{Score >= 80?}; Cond2 -- Yes --> B[Grade B]; Cond2 -- No --> Else[Grade C or Support];",
                 "Conditions are like forks in a path: if it rains, bring an umbrella; otherwise, wear sunglasses.",
                 "Python uses indentation (4 spaces) to define code blocks instead of curly braces {}. The elif keyword represents 'else if'. Conditions execute sequentially until the first match.",
                 ["1. Evaluate 'if' condition", "2. If False, test subsequent 'elif' blocks", "3. If all False, execute 'else' fallback", "4. Maintain consistent 4-space indentation"],
                 "Determining whether to send a high-priority teacher alert when a student's accuracy drops below 60%.",
                 "• 4 spaces indentation required\n• Colon (:) terminates condition line\n• elif checks subsequent conditions\n• else handles all remaining cases"),

                ("cl-py-m2-l3", "Loops (for and while)", 25, 3,
                 ["Iterate with for loops over ranges", "Implement condition-driven while loops"],
                 "Construct loops to automate repetitive tasks: for loops for bounded iteration over sequences and while loops for open-ended conditions.",
                 "# For loop with range\nfor i in range(1, 6):\n    print(f'Step {i}')\n\n# While loop\ncount = 3\nwhile count > 0:\n    print(f'Countdown: {count}')\n    count -= 1",
                 "flowchart TD; Init[Initialize i=1] --> Check{i < 6?}; Check -- True --> Body[Execute Loop Body]; Body --> Incr[Increment i]; Incr --> Check; Check -- False --> Done[Loop Terminates];",
                 "A for loop is like flipping through pages of a book one by one. A while loop is like jogging until you feel tired.",
                 "The range(start, stop, step) function generates numbers up to but not including stop. While loops require an explicit termination condition to prevent infinite loops.",
                 ["1. Use 'for item in sequence' to iterate collections", "2. Use range(N) for counting loops", "3. Use while for state-dependent loops", "4. Ensure while condition eventually changes"],
                 "Calculating the average quiz score across 30 students in an inclusive classroom.",
                 "• for loops iterate over iterable objects\n• range(start, stop, step) generates sequences\n• while loops repeat until boolean condition is False"),

                ("cl-py-m2-l4", "Break, Continue, and Pass", 20, 4,
                 ["Alter loop execution with break and continue", "Use pass as an intentional placeholder"],
                 "Fine-tune loop control flow using break to exit early, continue to skip to the next iteration, and pass as a no-op syntactic placeholder.",
                 "for num in range(1, 10):\n    if num == 5:\n        continue  # skip 5\n    if num == 8:\n        break     # exit at 8\n    print(num)",
                 "graph TD; Next[Start Iteration] --> CheckCont{Skip item?}; CheckCont -- Yes --> Skip[continue: Jump to Next]; CheckCont -- No --> CheckBreak{Stop all?}; CheckBreak -- Yes --> Exit[break: Exit Loop]; CheckBreak -- No --> Exec[Execute Body];",
                 "break is the emergency stop button. continue is skipping a boring song on a playlist.",
                 "break exits the innermost enclosing loop immediately. continue skips the remainder of the current iteration. pass does nothing, allowing valid syntax in empty functions or classes.",
                 ["break: terminates loop immediately", "continue: skips remainder of current iteration", "pass: acts as empty statement placeholder"],
                 "Searching a list of 1000 student records for an ID and stopping immediately once found (break).",
                 "• break terminates loop completely\n• continue skips to next iteration\n• pass is a syntactic placeholder"),

                ("cl-py-m2-l5", "Formatted Console Input and Output", 20, 5,
                 ["Master formatted string literals (f-strings)", "Format floating points and alignments"],
                 "Deep-dive into string interpolation with f-strings, precision specifiers, column alignments, and console output formatting.",
                 "item = 'Calculus Guide'\nprice = 29.954\nqty = 3\nprint(f'{item:<20} | Qty: {qty:02d} | Cost: ${price * qty:7.2f}')",
                 "graph LR; Text[f'Text {var:format}'] --> Specifier[Format Specifier .2f]; Specifier --> Final[Output: $89.86];",
                 "f-strings are like fill-in-the-blank cards where Python plugs in exact values with pretty alignment.",
                 "Introduced in Python 3.6, f-strings evaluate expressions at runtime. Syntax {val:.2f} formats decimals; {val:>10} right-aligns with padding width 10.",
                 ["1. Prefix string with 'f'", "2. Enclose variables in {curly braces}", "3. Add colon followed by format specifier :.2f", "4. Supports expressions {2 * 4}"],
                 "Printing a clean tabular report of student accuracy percentages and Bayesian Knowledge Tracing mastery scores.",
                 "• Prefix string with 'f'\n• {value:.2f} rounds to 2 decimals\n• {value:>10} pads right with width 10"),
            ]),

            ("mod-py-3", "Module 3: Python Data Structures", "Lists, Tuples, Dictionaries, and Sets: storage, searching, and transformations.", 3, [
                ("cl-py-m3-l1", "Python Lists & Methods", 25, 1,
                 ["Create and index lists", "Use append, pop, sort, and slice operations"],
                 "Lists are mutable, ordered sequences in Python. Master indexing, negative indices, slicing [start:stop:step], and built-in methods.",
                 "subjects = ['Math', 'Physics', 'Biology']\nsubjects.append('Computer Science')\nsubjects[1] = 'Applied Physics'\nprint(subjects[:2])  # ['Math', 'Applied Physics']",
                 "graph LR; Idx0[0: Math] --- Idx1[1: Physics] --- Idx2[2: Biology];",
                 "A list is like an expandable notebook where you can add, change, or remove items in numbered order.",
                 "Lists in Python are dynamic arrays. Appending has amortized O(1) time complexity. Slicing creates a shallow copy. Negative indices count from the end (-1 is last).",
                 ["Create with square brackets []", "Index with 0-based integers", "Slice with [start:stop:step]", "Modify with append(), extend(), pop(), remove()"],
                 "Maintaining an ordered list of lesson modules for a student to study sequentially.",
                 "• Mutable and ordered\n• Zero-based indexing\n• append() adds to end; pop() removes\n• Slicing extracts sub-lists"),

                ("cl-py-m3-l2", "Tuples & Immutability", 20, 2,
                 ["Differentiate tuples from lists", "Unpack tuples idiomatically"],
                 "Tuples are immutable sequences defined with parentheses (). Learn packing, unpacking, tuple efficiency, and when to enforce immutability.",
                 "screen_dimensions = (1920, 1080)\nwidth, height = screen_dimensions  # Unpacking\nprint(f'{width} x {height}')",
                 "graph TD; Tuple[(1920, 1080)] --> Immut[Immutable: Cannot Change]; Tuple --> Unpack[Unpacks to width, height];",
                 "A tuple is like an engraved stone plaque: once written, its contents cannot be altered.",
                 "Because tuples are immutable, Python optimizes memory storage. Tuples with hashable elements can be used as dictionary keys, whereas lists cannot.",
                 ["1. Define with parentheses (a, b)", "2. Access with zero-based index [0]", "3. Cannot append or mutate (raises TypeError)", "4. Supports unpacking: x, y = coords"],
                 "Storing geographical coordinates (latitude, longitude) or RGB color codes (#E8, #3B, #64).",
                 "• Immutable ordered sequence\n• Memory efficient\n• Supports multiple assignment unpacking\n• Valid dictionary key if elements are hashable"),

                ("cl-py-m3-l3", "Dictionaries (Key-Value Mappings)", 25, 3,
                 ["Store and retrieve key-value pairs", "Use keys(), values(), and items()"],
                 "Dictionaries (dict) provide associative hash-map storage with O(1) average lookup time. Master insertion, get() with defaults, and dictionary iterations.",
                 "student = {\n    'name': 'Maya Lin',\n    'mastery': 88.5,\n    'accommodations': ['visual', 'captions']\n}\nprint(student.get('role', 'student'))",
                 "graph LR; Key[Key: 'name'] --> Hash[Hash Function] --> Value[Value: 'Maya Lin'];",
                 "A dictionary is like a real address book: you look up a person's name (key) to instantly find their phone number (value).",
                 "Python dictionaries use a hash table. Keys must be immutable and hashable (strings, numbers, tuples). Since Python 3.7, insertion order is guaranteed preserved.",
                 ["1. Create with curly braces {'key': val}", "2. Access via dict[key] or dict.get(key, default)", "3. Iterate via dict.items() for (key, value) pairs", "4. Keys must be hashable"],
                 "Storing learner profile attributes: accommodations, speech rate, dyslexia font setting, and baseline scores.",
                 "• Key-value mapping\n• O(1) lookup speed\n• Keys must be immutable\n• .get() provides safe fallback without KeyError"),

                ("cl-py-m3-l4", "Sets & Set Operations", 20, 4,
                 ["Remove duplicates with sets", "Compute union, intersection, and difference"],
                 "Sets are unordered collections of unique elements. Master mathematical set operations: union (|), intersection (&), difference (-), and symmetric difference (^).",
                 "skills_a = {'Python', 'SQL', 'Git'}\nskills_b = {'Git', 'React', 'Docker'}\ncommon = skills_a & skills_b      # {'Git'}\nall_skills = skills_a | skills_b  # {'Python', 'SQL', 'Git', 'React', 'Docker'}",
                 "graph TD; A[Set A: Python, SQL, Git] --- Shared[Intersection: Git] --- B[Set B: React, Docker, Git];",
                 "A set is like a badge collector's album: you can't have duplicate badges, and you can compare your collection with a friend's in one step.",
                 "Sets are implemented using hash tables without values. Membership test ('x in my_set') is O(1) time complexity compared to O(N) in lists.",
                 ["1. Create with {x, y} or set(iterable)", "2. Automatically deduplicates elements", "3. Union: set_a | set_b", "4. Intersection: set_a & set_b"],
                 "Finding common prerequisite concepts between two different STEM courses.",
                 "• Unordered unique elements\n• Fast O(1) membership check\n• Mathematical operations (&, |, -, ^)\n• Elements must be hashable"),

                ("cl-py-m3-l5", "List & Dictionary Comprehensions", 25, 5,
                 ["Write clean one-line comprehensions", "Filter collections with conditionals"],
                 "Write elegant, Pythonic code using list comprehensions [expr for x in iterable if cond] and dictionary comprehensions {k: v for k, v in data}.",
                 "numbers = [1, 2, 3, 4, 5, 6]\neven_squares = [x**2 for x in numbers if x % 2 == 0]  # [4, 16, 36]\n\ngrades = {'Aarav': 92, 'Maya': 88, 'Rohan': 54}\npassed = {name: score for name, score in grades.items() if score >= 60}",
                 "graph LR; Iter[for x in numbers] --> Filter[if x % 2 == 0] --> Map[x ** 2] --> Output[List Result];",
                 "Comprehensions are express lanes for making lists: instead of writing 4 lines with a loop, you state what you want in one clear sentence.",
                 "Comprehensions are compiled to optimized bytecode that runs faster than manual for-loop appends by avoiding repeated attribute lookup of append().",
                 ["1. Syntax: [expression for item in iterable]", "2. Add filter: [expr for item in iterable if condition]", "3. Dict syntax: {k_expr: v_expr for item in iterable}", "4. Avoid overly nested comprehensions for readability"],
                 "Filtering a list of all course lessons to find only the lessons that a student has completed.",
                 "• [x for x in list if condition]\n• Faster than manual loops\n• Dict and set comprehensions also supported\n• Preserves readability"),
            ]),

            ("mod-py-4", "Module 4: Functions & Modular Programming", "Defining reusable functions, parameter scoping, lambda functions, and decorators.", 4, [
                ("cl-py-m4-l1", "Defining Functions with def", 25, 1,
                 ["Define modular reusable functions", "Understand parameters, arguments, and docstrings"],
                 "Functions encapsulate logic into modular, testable components. Learn def syntax, parameters, return values, and Sphinx/PEP 257 docstrings.",
                 "def calculate_mastery(correct_answers: int, total_questions: int) -> float:\n    '''Calculate student mastery percentage.'''\n    if total_questions == 0:\n        return 0.0\n    return round((correct_answers / total_questions) * 100, 1)\n\nscore = calculate_mastery(18, 20)  # 90.0",
                 "graph LR; Input[Inputs: 18, 20] --> Func[Function: calculate_mastery] --> Output[Return: 90.0];",
                 "A function is like a recipe: give it ingredients (arguments), follow the steps, and receive a finished dish (return value).",
                 "Functions are first-class citizens in Python. They can be assigned to variables, passed as arguments, and returned from other functions. Docstrings describe behavior for help() inspection.",
                 ["1. Define using 'def name(parameters):'", "2. Write docstring '''description'''", "3. Execute body and return result with 'return'", "4. Default return is None if omitted"],
                 "Calculating Item Response Theory (IRT) difficulty adjustments whenever a quiz question is answered.",
                 "• def keyword defines functions\n• return sends back output\n• Type hints clarify expected types\n• Docstrings document behavior"),

                ("cl-py-m4-l2", "Arguments: Default, *args, and **kwargs", 25, 2,
                 ["Use default parameter values", "Accept arbitrary arguments with *args and **kwargs"],
                 "Master flexible function signatures using positional arguments, default keyword arguments, *args (variable positional tuple), and **kwargs (variable keyword dictionary).",
                 "def format_profile(name, role='student', *badges, **preferences):\n    print(f'{name} ({role}) - Badges: {badges}')\n    print(f'Preferences: {preferences}')\n\nformat_profile('Aarav', 'student', 'Speedy', 'Consistent', speech_rate=0.85, theme='dark')",
                 "graph TD; Args[Call: func(a, b, *badges, **prefs)] --> Pos[Positional a, b]; Args --> Star[*args -> tuple of extras]; Args --> DStar[**kwargs -> dict of named extras];",
                 "*args collects extra unlabelled items into a bag; **kwargs collects extra labelled options into a dictionary.",
                 "*args packs remaining positional arguments into a tuple. **kwargs packs remaining keyword arguments into a dictionary. Keyword-only arguments can follow *args.",
                 ["1. Default parameters: def f(x=10)", "2. Arbitrary positional: def f(*args) -> tuple", "3. Arbitrary keyword: def f(**kwargs) -> dict", "4. Unpacking callers: f(*my_list, **my_dict)"],
                 "Creating an AI accessibility transformer that accepts arbitrary styling configurations (contrast, font, line height).",
                 "• Default parameters provide fallbacks\n• *args collects extra positional arguments into tuple\n• **kwargs collects extra keyword arguments into dictionary"),

                ("cl-py-m4-l3", "Scope: Local, Enclosing, Global, Built-in (LEGB)", 20, 3,
                 ["Understand Python LEGB scope resolution", "Use global and nonlocal keywords appropriately"],
                 "Understand variable lookup resolution following the LEGB rule (Local, Enclosing, Global, Built-in) and avoid common variable shadowing bugs.",
                 "counter = 0  # Global\n\ndef increment():\n    global counter\n    counter += 1\n    print(f'Current count: {counter}')",
                 "graph TD; L[1. Local Scope] --> E[2. Enclosing Scope]; E --> G[3. Global Scope]; G --> B[4. Built-in Scope];",
                 "Python looks for variables in concentric circles: first in your room (Local), then your house (Enclosing), then your city (Global), then the world (Built-in).",
                 "LEGB defines the search order for name resolution. Modifying a global variable inside a local scope requires the 'global' keyword; enclosing variables require 'nonlocal'.",
                 ["1. Local: inside current function", "2. Enclosing: in outer parent function", "3. Global: at module top-level", "4. Built-in: Python built-in names (len, print)"],
                 "Managing game score state across nested callback helper functions.",
                 "• LEGB: Local -> Enclosing -> Global -> Built-in\n• global keyword allows modifying module-level variables\n• nonlocal allows modifying enclosing closure variables"),

                ("cl-py-m4-l4", "Lambda Functions & Higher-Order Functions", 25, 4,
                 ["Write anonymous lambda functions", "Use map(), filter(), and sorted() with key functions"],
                 "Lambda functions are concise, single-expression anonymous functions. Combine them with higher-order functions like map(), filter(), and sorted(key=...).",
                 "students = [\n    {'name': 'Aarav', 'xp': 4200},\n    {'name': 'Maya', 'xp': 5100},\n    {'name': 'Rohan', 'xp': 3800}\n]\nsorted_students = sorted(students, key=lambda s: s['xp'], reverse=True)",
                 "graph LR; InputList[Students List] --> Lambda[key=lambda s: s['xp']] --> SortedOutput[Sorted Leaderboard];",
                 "A lambda is a quick, throwaway helper function you write on a sticky note instead of writing a formal letter.",
                 "Syntax is 'lambda params: expression'. Lambdas cannot contain statements (no if-else blocks or loops), only a single expression whose evaluated result is returned.",
                 ["1. Syntax: lambda x: x * 2", "2. Use with sorted(list, key=lambda ...)", "3. Use with filter(lambda ..., list)", "4. Prefer def functions if logic exceeds one simple line"],
                 "Ranking students on a classroom gamification leaderboard based on total XP points.",
                 "• Anonymous one-line functions\n• lambda args: expression\n• Commonly used as sorting keys\n• Higher-order functions accept functions as arguments"),

                ("cl-py-m4-l5", "Recursion & Recursive Problem Solving", 25, 5,
                 ["Identify base cases and recursive steps", "Avoid maximum recursion depth exceeded errors"],
                 "Recursion occurs when a function calls itself to solve smaller sub-problems. Understand base cases, call stacks, and the recursion depth limit.",
                 "def factorial(n: int) -> int:\n    # Base case\n    if n <= 1:\n        return 1\n    # Recursive case\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # 120",
                 "flowchart TD; F5[factorial(5)] --> F4[5 * factorial(4)]; F4 --> F3[4 * factorial(3)]; F3 --> F2[3 * factorial(2)]; F2 --> F1[2 * factorial(1)]; F1 --> Base[1 Base Case];",
                 "Recursion is like looking into two facing mirrors: smaller and smaller reflections until you reach the end.",
                 "Every recursive function requires a base case to prevent infinite recursion and a StackOverflow (RecursionError in Python). Python default recursion depth is 1000.",
                 ["1. Formulate Base Case: when to stop", "2. Formulate Recursive Case: call self with smaller input", "3. Ensure input approaches base case with each step", "4. Track call stack memory usage"],
                 "Traversing directory trees on your computer or parsing nested course module hierarchies.",
                 "• Function calls itself\n• Base case stops recursion\n• Every call adds frame to call stack\n• sys.setrecursionlimit() sets maximum depth"),
            ]),

            ("mod-py-5", "Module 5: Object-Oriented Programming (OOP)", "Classes, objects, encapsulation, inheritance, polymorphism, and magic methods.", 5, [
                ("cl-py-m5-l1", "Classes and Objects in Python", 25, 1,
                 ["Define classes with __init__ constructor", "Create instances and call methods"],
                 "Object-Oriented Programming bundles state (attributes) and behavior (methods) into reusable blueprints called classes.",
                 "class Student:\n    def __init__(self, name: str, grade_level: int):\n        self.name = name\n        self.grade_level = grade_level\n        self.xp = 0\n\n    def award_xp(self, points: int):\n        self.xp += points\n        print(f'{self.name} earned {points} XP! Total: {self.xp}')\n\ns1 = Student('Aarav', 10)\ns1.award_xp(150)",
                 "classDiagram\nclass Student {\n  +str name\n  +int grade_level\n  +int xp\n  +award_xp(points)\n}",
                 "A class is an architectural blueprint; an object is the actual house built from that blueprint.",
                 "The __init__ method is the class constructor called when creating an instance. The 'self' parameter refers to the current instance object being acted upon.",
                 ["1. Define blueprint using 'class Name:'", "2. Initialize state in def __init__(self, ...)", "3. Bind instance attributes using self.attribute", "4. Define methods with 'self' as first parameter"],
                 "Modeling learners, teachers, lessons, and quiz questions in the AdaptiveLearn AI database.",
                 "• class creates blueprint\n• __init__ initializes instance state\n• self refers to instance\n• Instances have independent state"),

                ("cl-py-m5-l2", "Encapsulation & Property Decorators", 25, 2,
                 ["Protect internal state with private attributes", "Use @property for getters and setters"],
                 "Encapsulation restricts direct access to internal object components. Learn private conventions (_protected, __private) and Pythonic @property getters and setters.",
                 "class LearningProgress:\n    def __init__(self, score: float):\n        self._score = max(0.0, min(100.0, score))\n\n    @property\n    def score(self) -> float:\n        return self._score\n\n    @score.setter\n    def score(self, value: float):\n        if 0.0 <= value <= 100.0:\n            self._score = value\n        else:\n            raise ValueError('Score must be between 0 and 100')",
                 "graph LR; External[External Code] --> Getter[@property score] --> Private[_score in Object]; External --> Setter[@score.setter] --> Validation[Validation Logic];",
                 "Encapsulation is like the casing on your smartphone: you interact with buttons and screen, while delicate wires are safely sealed inside.",
                 "Single underscore (_var) indicates internal use by convention. Double underscore (__var) triggers name mangling to prevent accidental subclass override. @property allows clean attribute-like syntax with validation.",
                 ["1. Store raw data in _attribute", "2. Expose with @property def attribute(self):", "3. Provide validation with @attribute.setter", "4. Raise ValueError for invalid assignments"],
                 "Validating that a student's Bayesian Knowledge Tracing probability stays strictly between 0.0 and 1.0.",
                 "• _single_underscore indicates private by convention\n• __double_underscore triggers name mangling\n• @property creates getter\n• @attr.setter creates validated setter"),

                ("cl-py-m5-l3", "Inheritance & Method Overriding", 25, 3,
                 ["Create subclasses that inherit behavior", "Use super() to extend parent functionality"],
                 "Inheritance allows a child class to acquire attributes and methods from a parent class, promoting code reuse and hierarchical domain modeling.",
                 "class User:\n    def __init__(self, name: str, email: str):\n        self.name = name\n        self.email = email\n\n    def get_dashboard(self) -> str:\n        return '/dashboard'\n\nclass Teacher(User):\n    def __init__(self, name: str, email: str, department: str):\n        super().__init__(name, email)\n        self.department = department\n\n    def get_dashboard(self) -> str:\n        return '/teacher'  # Overriding",
                 "classDiagram\nUser <|-- Student\nUser <|-- Teacher\nclass User {\n  +name\n  +email\n  +get_dashboard()\n}\nclass Teacher {\n  +department\n  +get_dashboard()\n}",
                 "Inheritance is like genetic traits: a child inherits features from their parents, but can also have unique talents of their own.",
                 "Subclasses inherit all public and protected members of the superclass. Use super().__init__() to invoke parent constructors. Overriding provides specialized subclass behavior.",
                 ["1. Define child: class Child(Parent):", "2. Call parent init with super().__init__(...)", "3. Add child-specific attributes", "4. Override methods by redefining with same signature"],
                 "Modeling generic Users into specialized Students and Teachers with different permissions.",
                 "• class Child(Parent) establishes inheritance\n• super() calls parent class implementation\n• Method overriding redefines parent methods\n• isinstance() checks type hierarchy"),

                ("cl-py-m5-l4", "Polymorphism & Abstract Base Classes", 25, 4,
                 ["Implement polymorphic interfaces", "Use abc.ABC and @abstractmethod"],
                 "Polymorphism allows different classes to respond to the same method interface in specialized ways. Learn the abc module to enforce contracts.",
                 "from abc import ABC, abstractmethod\n\nclass AccessibleContent(ABC):\n    @abstractmethod\n    def render(self) -> str:\n        pass\n\nclass AudioLesson(AccessibleContent):\n    def render(self) -> str:\n        return 'Playing audio narration with TTS...'\n\nclass VisualLesson(AccessibleContent):\n    def render(self) -> str:\n        return 'Displaying SVG diagram and concept mindmap...'",
                 "graph TD; Abstract[AccessibleContent: render] --> Audio[AudioLesson: render -> Sound]; Abstract --> Visual[VisualLesson: render -> Graphic];",
                 "Polymorphism is like a universal remote control: press 'Play', and it plays audio, video, or animations depending on the device.",
                 "Abstract Base Classes (ABCs) cannot be instantiated directly. Subclasses must implement all @abstractmethod decorators before instantiation, enforcing architectural design patterns.",
                 ["1. Inherit from abc.ABC", "2. Mark abstract methods with @abstractmethod", "3. Subclasses must implement all abstract methods", "4. Call uniform methods polymorphically"],
                 "Adapting lessons into 8 different accessible outputs (Audio, Visual, Dyslexic, Simple, Detailed) through a single render() call.",
                 "• Polymorphism: same method name, different behavior\n• abc.ABC enforces interface contracts\n• @abstractmethod prevents incomplete subclasses"),

                ("cl-py-m5-l5", "Magic (Dunder) Methods", 25, 5,
                 ["Implement __str__ and __repr__ for clean printing", "Overload operators with __eq__, __add__, __len__"],
                 "Magic (double underscore or 'dunder') methods let custom objects integrate with Python syntax: string representation, operators, and length.",
                 "class CourseModule:\n    def __init__(self, title: str, lesson_count: int):\n        self.title = title\n        self.lesson_count = lesson_count\n\n    def __len__(self) -> int:\n        return self.lesson_count\n\n    def __str__(self) -> str:\n        return f'{self.title} ({self.lesson_count} lessons)'\n\nm1 = CourseModule('Module 1: Basics', 5)\nprint(m1)        # Module 1: Basics (5 lessons)\nprint(len(m1))   # 5",
                 "graph LR; Obj[Custom Object] --> Len[len() -> __len__]; Obj --> Str[print() -> __str__]; Obj --> Repr[inspect -> __repr__];",
                 "Magic methods are secret handshakes: they teach Python how your custom objects react to normal commands like print() or +.",
                 "__str__ is intended for readable user-facing output; __repr__ is intended for unambiguous developer debugging. Overloading __eq__ enables direct object comparison.",
                 ["1. __str__: user-friendly string representation", "2. __repr__: developer debugging representation", "3. __len__: enables len(obj)", "4. __eq__: enables obj1 == obj2"],
                 "Comparing two learner progress snapshots or printing clean diagnostic course module summaries.",
                 "• Dunder methods start and end with __\n• __str__ controls print() output\n• __len__ enables len() support\n• __eq__ defines equality comparison"),
            ]),

            ("mod-py-6", "Module 6: Advanced Python & APIs", "File handling, JSON parsing, exception hierarchies, packages, and REST APIs.", 6, [
                ("cl-py-m6-l1", "File Handling with Context Managers", 25, 1,
                 ["Read and write text and binary files", "Use 'with' statements for safe resource cleanup"],
                 "Safely perform file input/output in Python using context managers (with open(...) as f), handling file paths and encodings.",
                 "# Writing safely with context manager\nwith open('notes.txt', 'w', encoding='utf-8') as f:\n    f.write('AdaptiveLearn AI Lesson Summary')\n\n# Reading\nwith open('notes.txt', 'r', encoding='utf-8') as f:\n    content = f.read()\nprint(content)",
                 "graph TD; Open[with open() as f] --> Work[Read or Write Data]; Work --> AutoClose[Automatically Closes File, Even on Error];",
                 "A context manager is like an automatic door: it opens when you walk in and reliably closes behind you, so nothing gets left open.",
                 "The 'with' statement invokes the __enter__ and __exit__ methods of the context manager, guaranteeing that file descriptors are freed even if an exception occurs.",
                 ["1. Always specify encoding='utf-8'", "2. Use 'w' for overwrite, 'a' for append, 'r' for read", "3. Use 'with' to ensure automatic closing", "4. Use pathlib.Path for cross-platform file paths"],
                 "Saving student notes and downloading printable offline revision guides.",
                 "• with open(...) ensures proper closing\n• Modes: 'r' read, 'w' write, 'a' append\n• Always specify encoding='utf-8'\n• Context managers prevent file handle leaks"),

                ("cl-py-m6-l2", "Exception Handling (try-except-finally)", 25, 2,
                 ["Handle runtime errors gracefully", "Use custom exception classes and finally blocks"],
                 "Build resilient software by intercepting runtime errors with try, except, else, and finally blocks without crashing the application.",
                 "try:\n    number = int(input('Enter quiz answer number: '))\n    result = 100 / number\nexcept ValueError:\n    print('Invalid format! Please enter an integer.')\nexcept ZeroDivisionError:\n    print('Answer number cannot be zero.')\nelse:\n    print(f'Calculation successful: {result}')\nfinally:\n    print('Assessment evaluation completed.')",
                 "flowchart TD; Try[Try Block] --> CheckErr{Error Occurred?}; CheckErr -- No --> Else[Else Block]; CheckErr -- Yes --> Except[Except Handler]; Else --> Fin[Finally Block Always]; Except --> Fin;",
                 "Exception handling is like a safety net for a trapeze artist: if something goes wrong, you catch it safely instead of falling.",
                 "Handle specific exceptions rather than catching bare Exception. The 'else' block runs only if no exception occurred; the 'finally' block executes unconditionally (ideal for resource cleanup).",
                 ["1. Wrap risky code inside try block", "2. Catch specific exceptions (ValueError, KeyError)", "3. Use else for clean success path", "4. Use finally for mandatory cleanup"],
                 "Gracefully informing a student when their network connection drops during an adaptive quiz without losing their progress.",
                 "• try contains risky code\n• except handles specific errors\n• else executes on success only\n• finally always executes"),

                ("cl-py-m6-l3", "Modules, Packages, and pip", 20, 3,
                 ["Structure modular Python packages", "Install third-party packages from PyPI using pip"],
                 "Organize code into modular files (.py) and packages (directories with __init__.py). Install external dependencies from the Python Package Index (PyPI).",
                 "# Importing from standard and external packages\nimport math\nfrom datetime import datetime\nimport requests\n\nprint(f'Current Year: {datetime.now().year}')\nprint(f'Pi: {math.pi:.4f}')",
                 "graph TD; Project[Project Root] --> pkg[Package Directory]; pkg --> init[__init__.py]; pkg --> modA[math_engine.py]; pkg --> modB[tutor.py];",
                 "Modules are tools in your toolbox. Packages are organized drawers keeping related tools together.",
                 "Every .py file is a module. A folder with an __init__.py file is a package. Virtual environments (python -m venv venv) isolate project dependencies.",
                 ["1. Group related functions into module.py", "2. Import via 'import module' or 'from module import func'", "3. Manage external dependencies via pip install", "4. Pin versions in requirements.txt"],
                 "Importing scikit-learn, NumPy, and Pandas to power the Bayesian Knowledge Tracing engine in AdaptiveLearn AI.",
                 "• Module is a single .py file\n• Package is a directory with __init__.py\n• pip installs packages from PyPI\n• Virtual environments isolate dependencies"),

                ("cl-py-m6-l4", "Working with JSON Data", 25, 4,
                 ["Serialize Python objects to JSON (dumps)", "Deserialize JSON strings to Python (loads)"],
                 "JavaScript Object Notation (JSON) is the universal data interchange format for modern web APIs. Master json.loads, json.dumps, and file persistence.",
                 "import json\n\nstudent_data = {\n    'name': 'Aarav',\n    'mastery': 89.2,\n    'active': True\n}\n\n# Serialize to JSON string\njson_str = json.dumps(student_data, indent=2)\n\n# Deserialize back to Python dict\nparsed = json.loads(json_str)\nprint(parsed['name'])",
                 "graph LR; PyDict[Python Dict] --> Dumps[json.dumps] --> JSONStr[JSON String]; JSONStr --> Loads[json.loads] --> PyDict2[Python Dict];",
                 "JSON is the common language of the internet: translating a Python dictionary into a text format that web browsers and mobile apps understand.",
                 "json.dumps converts Python objects to JSON strings; json.loads parses JSON strings into Python dictionaries and lists. Use indent=2 for human-readable pretty-printing.",
                 ["1. import json", "2. json.dumps(data) -> string", "3. json.loads(string) -> python dict", "4. Use json.dump / json.load for file streams"],
                 "Transferring student learning profiles between the React frontend and FastAPI backend.",
                 "• json.dumps(): Python to JSON string\n• json.loads(): JSON string to Python\n• json.dump() / json.load() for file streams\n• Maps dict to JSON object, list to JSON array"),

                ("cl-py-m6-l5", "Working with REST APIs using requests", 25, 5,
                 ["Send GET and POST HTTP requests", "Handle status codes and JSON payloads"],
                 "Interact with web services and cloud backends using HTTP requests. Inspect status codes, transmit JSON payloads, and handle network timeouts.",
                 "import requests\n\nresponse = requests.get('http://localhost:5000/api/health', timeout=5)\nif response.status_code == 200:\n    payload = response.json()\n    print(f'Server Status: {payload.get(\"status\")}')",
                 "graph LR; Client[Python requests] --> HTTPReq[HTTP GET /api/health] --> Server[FastAPI Server]; Server --> HTTPRes[HTTP 200 OK + JSON] --> Client;",
                 "Calling an API is like ordering at a restaurant: you look at the menu (endpoints), place an order (request), and the kitchen sends out your food (response).",
                 "Common HTTP verbs: GET (fetch data), POST (create data), PUT/PATCH (update data), DELETE (remove data). Always specify a timeout to avoid hanging connections.",
                 ["1. Use requests.get(url, params=...) for fetching", "2. Use requests.post(url, json=...) for submitting data", "3. Check response.status_code == 200", "4. Parse with response.json()"],
                 "Connecting the Python AI doubt solver to online educational knowledge bases and science databases.",
                 "• requests.get() fetches data\n• requests.post() submits data\n• response.status_code indicates status (200 OK, 404 Not Found)\n• Always set a timeout"),
            ]),

            ("mod-py-7", "Module 7: Capstone Project & Final Assessment", "Synthesize your knowledge by building a complete command-line and API educational application.", 7, [
                ("cl-py-m7-l1", "Designing the Capstone Project Architecture", 30, 1,
                 ["Design modular project architecture", "Structure data models and controller logic"],
                 "Architect an end-to-end Python application: a Personal Quiz & Adaptive Flashcard Study Companion. Plan classes, data flow, and file persistence.",
                 "# Architectural plan\n# 1. models.py (Card, Quiz, Student)\n# 2. engine.py (BKT knowledge tracing)\n# 3. storage.py (JSON file persistence)\n# 4. cli.py (Interactive terminal interface)",
                 "graph TD; CLI[Command Line Interface] --> Engine[Adaptive Study Engine]; Engine --> Models[Flashcard & Quiz Models]; Engine --> Storage[JSON File Storage];",
                 "Building an application is like building a house: plan the blueprint before pouring concrete.",
                 "Apply the Single Responsibility Principle: separate data representation (models), data persistence (storage), business logic (engine), and user interaction (CLI).",
                 ["1. Specify requirements and user journey", "2. Design classes and interactions", "3. Implement unit tests", "4. Refactor and document"],
                 "Creating an inclusive study companion that tracks question difficulty and suggests spaced repetition review.",
                 "• Separate concerns into distinct modules\n• Plan data structures before writing code\n• Design for testability and clarity"),

                ("cl-py-m7-l2", "Project Implementation & Automated Testing", 35, 2,
                 ["Implement the core engine classes", "Write unit tests using pytest or unittest"],
                 "Build and verify the capstone project. Write unit tests to guarantee reliability, edge case handling, and automated validation.",
                 "import unittest\n\nclass TestAdaptiveEngine(unittest.TestCase):\n    def test_accuracy_calculation(self):\n        accuracy = (8 / 10) * 100\n        self.assertEqual(accuracy, 80.0)\n\nif __name__ == '__main__':\n    unittest.main()",
                 "graph LR; Code[Application Code] --> TestRunner[unittest / pytest]; TestRunner --> Assertions[Verify Asserts]; Assertions --> Report[Pass / Fail Report];",
                 "Unit tests are like quality control inspectors on a factory line: checking each part to ensure it never fails.",
                 "Write tests covering typical cases, boundary conditions (zero questions, 100% scores), and error conditions (invalid input types).",
                 ["1. Import unittest or pytest", "2. Create test class inheriting unittest.TestCase", "3. Write test methods starting with test_", "4. Run automated test suite"],
                 "Ensuring educational scoring algorithms never miscalculate a student's grade or progress record.",
                 "• Test-driven development increases reliability\n• Test normal, boundary, and error cases\n• Run tests before deploying code"),
            ]),
        ]

        # Insert Python Modules, Lessons, Resources, and Assessments
        for mod_id, mod_title, mod_desc, seq, lessons_data in py_modules:
            mod = CourseModule(id=mod_id, course_id=c_python.id, title=mod_title, description=mod_desc, sequence_number=seq)
            db.add(mod)
            db.flush()

            for l_id, l_title, l_dur, l_seq, l_objs, l_content, l_code, l_mermaid, l_simple, l_detailed, l_steps, l_example, l_notes in lessons_data:
                lesson = CourseLesson(
                    id=l_id,
                    module_id=mod.id,
                    title=l_title,
                    duration=l_dur,
                    sequence_number=l_seq,
                    learning_objectives_json=json.dumps(l_objs),
                    content=l_content,
                    code_snippet=l_code,
                    diagram_mermaid=l_mermaid,
                    simple_explanation=l_simple,
                    detailed_explanation=l_detailed,
                    step_by_step_json=json.dumps(l_steps),
                    real_world_example=l_example,
                    revision_notes=l_notes,
                    audio_script=f"Welcome to {l_title}. In this lesson, {l_simple}. Let's explore this step by step.",
                )
                db.add(lesson)
                db.flush()

                # Add a sample downloadable resource
                db.add(LessonResource(
                    id=f"res-{l_id}-1",
                    lesson_id=lesson.id,
                    resource_type="pdf",
                    title=f"Printable Revision Cheat Sheet - {l_title}",
                    resource_url=f"/downloads/cheatsheets/{l_id}.pdf"
                ))

            # Add Module Quiz Assessment
            asmt = CourseAssessment(
                id=f"asmt-{mod_id}",
                course_id=c_python.id,
                module_id=mod.id,
                title=f"{mod_title} - Knowledge Check",
                assessment_type="module_quiz",
                total_marks=20,
                passing_percentage=70.0
            )
            db.add(asmt)
            db.flush()

            # Add questions for this module quiz
            db.add(CourseQuestion(
                id=f"q-{asmt.id}-1",
                assessment_id=asmt.id,
                question=f"Which of the following is a key concept introduced in {mod_title}?",
                question_type="multiple_choice",
                options_json=json.dumps([lessons_data[0][1], "Direct Assembly Code", "Microcontroller Hardware Soldering", "Analog Circuit Tuning"]),
                correct_answer=lessons_data[0][1],
                explanation=f"{lessons_data[0][1]} is a foundational pillar taught in {mod_title}.",
                hints_json=json.dumps(["Review the first lesson in this module."]),
                points=10
            ))
            db.add(CourseQuestion(
                id=f"q-{asmt.id}-2",
                assessment_id=asmt.id,
                question="In Python, variable naming must adhere to PEP 8 standards and is case-sensitive.",
                question_type="true_false",
                options_json=json.dumps(["True", "False"]),
                correct_answer="True",
                explanation="Python identifiers are strictly case-sensitive ('age' and 'Age' refer to different variables).",
                hints_json=json.dumps(["Recall case sensitivity in Python."]),
                points=10
            ))

        # Add Final Course Exam for Python
        py_final = CourseAssessment(
            id="asmt-course-python-final",
            course_id=c_python.id,
            module_id=None,
            title="Python Programming - Comprehensive Final Certification Examination",
            assessment_type="final_exam",
            total_marks=100,
            passing_percentage=75.0
        )
        db.add(py_final)
        db.flush()

        final_questions = [
            ("Which keyword is used to define an object-oriented constructor in Python?", "multiple_choice", ["__init__", "constructor", "new", "def_init"], "__init__", "The __init__ method is Python's standard instance initializer.", 20),
            ("What is the time complexity of looking up a key in a standard Python dictionary on average?", "multiple_choice", ["O(1)", "O(N)", "O(log N)", "O(N^2)"], "O(1)", "Python dictionaries utilize a hash table providing O(1) average lookup time.", 20),
            ("Tuples in Python can be modified after creation using the append() method.", "true_false", ["True", "False"], "False", "Tuples are immutable; they do not have an append() method.", 20),
            ("Which built-in function returns an iterator that yields numbers from start up to (but not including) stop?", "multiple_choice", ["range()", "seq()", "counter()", "walk()"], "range()", "The range() function produces sequential numbers for iteration.", 20),
            ("What statement is used to handle exceptions and guarantee execution regardless of whether an error occurred?", "multiple_choice", ["finally", "catch", "defer", "rescue"], "finally", "The finally block executes unconditionally for cleanup.", 20),
        ]
        for q_idx, (q_text, q_type, q_opts, q_ans, q_exp, q_pts) in enumerate(final_questions, 1):
            db.add(CourseQuestion(
                id=f"q-py-final-{q_idx}",
                assessment_id=py_final.id,
                question=q_text,
                question_type=q_type,
                options_json=json.dumps(q_opts),
                correct_answer=q_ans,
                explanation=q_exp,
                hints_json=json.dumps(["Think about fundamental Python mechanics."]),
                points=q_pts
            ))

        db.commit()
        print("[SEED COURSES] Seeded Course 1: Python Programming with 7 modules and 31 lessons.")

        # -------------------------------------------------------------
        # 3. COURSE 2: Java Programming
        # -------------------------------------------------------------
        c_java = Course(
            id="course-java",
            category_id="cat-cs",
            title="Java Programming: Core Principles, JVM Architecture & Applications",
            description="Master Java development: JVM/JDK internals, strong typing, Object-Oriented design, collections framework, exception handling, and enterprise database applications.",
            difficulty="Intermediate",
            instructor_id="user-teacher-1",
            instructor_name="Dr. Elena Sharma",
            instructor_title="Principal AI Research Educator",
            thumbnail="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
            icon="Coffee",
            color="#EA580C",
            estimated_duration="28 hours",
            rating=4.8,
            rating_count=215,
            enrollment_count=980,
            published=True,
            learning_outcomes=[
                "Understand JDK, JRE, and JVM execution with bytecode verification.",
                "Design robust systems using Polymorphism, Interfaces, and Abstract Classes.",
                "Utilize the Java Collections Framework (ArrayList, HashMap, HashSet).",
                "Connect to relational databases via JDBC and build graphical UI applications.",
            ],
            prerequisites=["Basic algorithmic understanding or prior introductory programming."],
        )
        db.add(c_java)
        db.flush()

        java_modules = [
            ("mod-java-1", "Module 1: Java Introduction & JVM Architecture", "Features of Java, bytecode compilation, and environment configuration.", 1, [
                ("cl-java-m1-l1", "Introduction to Java & History", 20, 1,
                 "Java is a class-based, object-oriented language designed with the WORA philosophy: Write Once, Run Anywhere.",
                 "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, Adaptive Java!\");\n    }\n}",
                 "graph LR; Code[.java] --> Javac[javac Compiler] --> Bytecode[.class Bytecode] --> JVM[JVM on Windows/Linux/Mac];"),
                ("cl-java-m1-l2", "Key Features of Java", 15, 2,
                 "Java is platform-independent, strongly typed, secure, robust, and multithreaded.",
                 "// Strongly typed variable declaration\nint score = 95;\nString name = \"Maya\";",
                 "graph TD; Platform[Platform Independent] --- Features[Java Features]; Secure --- Features; Multithreaded --- Features;"),
                ("cl-java-m1-l3", "JDK, JRE, and JVM Explained", 25, 3,
                 "JDK (Development Kit) contains tools and JRE; JRE contains JVM and runtime libraries; JVM executes bytecode.",
                 "// JVM executes compiled bytecode instructions",
                 "graph TD; JDK[JDK: Tools + Compilers] --> JRE[JRE: Libraries]; JRE --> JVM[JVM: Bytecode Execution Engine];"),
                ("cl-java-m1-l4", "Writing & Compiling Your First Java Program", 25, 4,
                 "Compile with 'javac Main.java' to generate 'Main.class', and run with 'java Main'.",
                 "javac Main.java\njava Main",
                 "flowchart LR; Edit[Code in Editor] --> Javac[Compile with javac] --> Class[Bytecode .class] --> Run[Execute with java];"),
            ]),

            ("mod-java-2", "Module 2: Java Fundamentals & Control Structures", "Primitives, arithmetic, branching, and iteration.", 2, [
                ("cl-java-m2-l1", "Variables and Primitive Types", 20, 1,
                 "Java has 8 primitive types: byte, short, int, long, float, double, boolean, and char.",
                 "int age = 16;\ndouble gpa = 3.9;\nboolean active = true;\nchar grade = 'A';",
                 "graph LR; Prims[Primitives: int, double, boolean, char] --> Heap[Objects on Heap];"),
                ("cl-java-m2-l2", "Operators & Expressions", 20, 2,
                 "Arithmetic, relational, bitwise, and ternary operators in Java.",
                 "int max = (a > b) ? a : b;  // Ternary operator",
                 "graph TD; Math[+, -, *, /, %] --> Ops[Operators]; Logic[&&, ||, !] --> Ops; Ternary[? :] --> Ops;"),
                ("cl-java-m2-l3", "Conditional Statements (if-else, switch-case)", 20, 3,
                 "Decision-making using if, else if, else, and enhanced switch expressions.",
                 "switch (day) {\n    case 1 -> System.out.println(\"Monday\");\n    default -> System.out.println(\"Other\");\n}",
                 "flowchart TD; Cond{Evaluate Condition} --> Match[Execute Matched Case];"),
                ("cl-java-m2-l4", "Loops (for, while, do-while, enhanced for)", 25, 4,
                 "Iterate over collections and numerical ranges with control statements.",
                 "for (int i = 0; i < 5; i++) {\n    System.out.println(\"Step \" + i);\n}",
                 "graph TD; LoopInit[i = 0] --> Check{i < 5?} --> Body[Execute Code] --> Incr[i++];"),
            ]),

            ("mod-java-3", "Module 3: Object-Oriented Programming in Java", "Classes, objects, constructors, inheritance, interfaces, and encapsulation.", 3, [
                ("cl-java-m3-l1", "Classes, Objects, and Constructors", 25, 1,
                 "Blueprint definition, member variables, methods, and constructor overloading.",
                 "public class Student {\n    private String name;\n    public Student(String name) { this.name = name; }\n}",
                 "classDiagram\nclass Student {\n  -String name\n  +Student(name)\n}"),
                ("cl-java-m3-l2", "Inheritance with extends", 25, 2,
                 "Single inheritance hierarchy in Java using the extends keyword and super constructor.",
                 "public class GraduateStudent extends Student {\n    public GraduateStudent(String name) { super(name); }\n}",
                 "classDiagram\nStudent <|-- GraduateStudent"),
                ("cl-java-m3-l3", "Polymorphism & Method Overriding", 25, 3,
                 "Dynamic method dispatch at runtime via method overriding and the @Override annotation.",
                 "@Override\npublic String toString() { return \"Student: \" + this.name; }",
                 "graph TD; Super[Superclass Method] --> Overridden[Overridden in Subclass];"),
                ("cl-java-m3-l4", "Interfaces and Multiple Contract Implementation", 25, 4,
                 "Define pure contracts using interfaces and achieve multiple inheritance of type.",
                 "public interface Accessible {\n    void adaptDisplay();\n}",
                 "classDiagram\nclass Accessible {\n  <<interface>>\n  +adaptDisplay()\n}"),
                ("cl-java-m3-l5", "Encapsulation & Access Modifiers", 20, 5,
                 "public, protected, package-private (default), and private visibility rules.",
                 "private double gpa;\npublic double getGpa() { return this.gpa; }",
                 "graph LR; Private[private: class only] --> Package[default: package] --> Protected[protected: subclasses] --> Public[public: everywhere];"),
            ]),

            ("mod-java-4", "Module 4: Advanced Java & Collections", "Exception handling, ArrayList, HashMap, and Generics.", 4, [
                ("cl-java-m4-l1", "Arrays in Java", 20, 1,
                 "Fixed-size typed arrays, multidimensional arrays, and the Arrays utility class.",
                 "int[] numbers = new int[]{10, 20, 30};\nSystem.out.println(numbers.length);",
                 "graph LR; Idx0[0: 10] --- Idx1[1: 20] --- Idx2[2: 30];"),
                ("cl-java-m4-l2", "Exception Handling (try-catch-finally-throws)", 25, 2,
                 "Checked vs unchecked exceptions, custom exception classes, and resource try-with-resources.",
                 "try (Scanner sc = new Scanner(System.in)) {\n    int val = sc.nextInt();\n} catch (InputMismatchException e) {\n    System.out.println(\"Invalid input!\");\n}",
                 "flowchart TD; Try[try] --> Catch[catch Exception] --> Finally[finally cleanup];"),
                ("cl-java-m4-l3", "Java Collections: List, Set, Map", 25, 3,
                 "ArrayList, LinkedList, HashSet, TreeSet, HashMap, and TreeMap performance trade-offs.",
                 "List<String> list = new ArrayList<>();\nMap<String, Integer> scores = new HashMap<>();",
                 "classDiagram\nCollection <|-- List\nCollection <|-- Set\nMap <|.. HashMap"),
            ]),

            ("mod-java-5", "Module 5: Java Applications & JDBC", "Database connectivity with MySQL/SQLite and building desktop tools.", 5, [
                ("cl-java-m5-l1", "JDBC Fundamentals & SQL Connection", 25, 1,
                 "Establish connection via DriverManager, execute PreparedStatements, and iterate ResultSets.",
                 "Connection conn = DriverManager.getConnection(url);\nPreparedStatement ps = conn.prepareStatement(\"SELECT * FROM users WHERE id = ?\");",
                 "graph LR; JavaApp[Java Application] --> JDBC[JDBC Driver] --> DB[(Database)];"),
                ("cl-java-m5-l2", "Java GUI Basics with Swing & Event Listeners", 25, 2,
                 "JFrame, JButton, ActionListeners, and layout managers.",
                 "JButton btn = new JButton(\"Submit\");\nbtn.addActionListener(e -> System.out.println(\"Clicked!\"));",
                 "graph TD; Button[JButton] --> Event[ActionEvent] --> Handler[ActionListener Lambda];"),
            ]),
        ]

        for mod_id, mod_title, mod_desc, seq, lessons_data in java_modules:
            mod = CourseModule(id=mod_id, course_id=c_java.id, title=mod_title, description=mod_desc, sequence_number=seq)
            db.add(mod)
            db.flush()

            for l_idx, (l_id, l_title, l_dur, l_seq, l_content, l_code, l_mermaid) in enumerate(lessons_data, 1):
                lesson = CourseLesson(
                    id=l_id,
                    module_id=mod.id,
                    title=l_title,
                    duration=l_dur,
                    sequence_number=l_seq,
                    learning_objectives_json=json.dumps([f"Master {l_title}", "Understand Java memory model and type safety"]),
                    content=l_content,
                    code_snippet=l_code,
                    diagram_mermaid=l_mermaid,
                    simple_explanation=f"In Java, {l_title} provides strongly typed, high-performance structure.",
                    detailed_explanation=f"Deep architectural exploration of {l_title} within the Java Virtual Machine runtime.",
                    step_by_step_json=json.dumps(["Step 1: Understand concepts", "Step 2: Inspect code structure", "Step 3: Execute in JVM"]),
                    real_world_example="Building high-throughput financial transaction engines and Android mobile systems.",
                    revision_notes=f"• Essential Java component: {l_title}\n• Strongly typed and compiled to bytecode",
                    audio_script=f"Welcome to {l_title} in our Java Programming course.",
                )
                db.add(lesson)

            asmt = CourseAssessment(
                id=f"asmt-{mod_id}",
                course_id=c_java.id,
                module_id=mod.id,
                title=f"{mod_title} - Knowledge Check",
                assessment_type="module_quiz",
                total_marks=20,
                passing_percentage=70.0
            )
            db.add(asmt)
            db.flush()
            db.add(CourseQuestion(
                id=f"q-{asmt.id}-1",
                assessment_id=asmt.id,
                question="What component executes compiled Java bytecode across different operating systems?",
                question_type="multiple_choice",
                options_json=json.dumps(["Java Virtual Machine (JVM)", "C Preprocessor", "Operating System Kernel directly", "Web Browser"]),
                correct_answer="Java Virtual Machine (JVM)",
                explanation="The JVM translates bytecode into native machine instructions for the host OS.",
                points=20
            ))

        db.commit()
        print("[SEED COURSES] Seeded Course 2: Java Programming with 5 modules.")

        # -------------------------------------------------------------
        # 4. COURSE 3: Full Stack Web Development
        # -------------------------------------------------------------
        c_web = Course(
            id="course-webdev",
            category_id="cat-cs",
            title="Modern Full Stack Web Development: HTML, CSS, JavaScript, React & Node",
            description="Build scalable, accessible, modern web applications from scratch: semantic HTML5, modern CSS3 Flexbox/Grid, ES6+ JavaScript, React 19 component trees, Node/Express REST backends, and cloud deployment.",
            difficulty="Beginner",
            instructor_id="user-teacher-1",
            instructor_name="Dr. Elena Sharma",
            instructor_title="Principal AI Research Educator",
            thumbnail="https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=80",
            icon="Globe",
            color="#06B6D4",
            estimated_duration="30 hours",
            rating=4.9,
            rating_count=412,
            enrollment_count=1540,
            published=True,
            learning_outcomes=[
                "Write semantic, WCAG 2.2 accessible HTML5 markup with ARIA landmarks.",
                "Build responsive, modern UI layouts using CSS Flexbox, Grid, and Custom Properties.",
                "Master asynchronous JavaScript (Promises, async/await, Fetch API, DOM manipulation).",
                "Create interactive Single Page Applications using React 19, hooks, and declarative state.",
                "Develop and secure RESTful APIs with Node.js and Express.",
            ],
            prerequisites=["No prerequisites; enthusiastic curiosity about building on the web."],
        )
        db.add(c_web)
        db.flush()

        web_modules = [
            ("mod-web-1", "Module 1: Semantic HTML5 & Web Accessibility", "Structure, headings, forms, tables, and WCAG accessibility standards.", 1),
            ("mod-web-2", "Module 2: Modern CSS3 Styling, Flexbox & Grid", "Box model, responsive design, media queries, CSS variables, and layout engines.", 2),
            ("mod-web-3", "Module 3: Modern JavaScript (ES6+)", "Variables (let/const), arrow functions, array methods, DOM events, and Async/Await.", 3),
            ("mod-web-4", "Module 4: React 19 & Component Architecture", "JSX, props, useState, useEffect, context, and custom hooks.", 4),
            ("mod-web-5", "Module 5: Backend Development with Node & Express", "Server creation, routing, middleware, REST conventions, and JSON APIs.", 5),
            ("mod-web-6", "Module 6: Cloud Deployment & CI/CD", "Environment variables, production bundling, Vercel, Netlify, and Render.", 6),
        ]
        for w_id, w_title, w_desc, w_seq in web_modules:
            mod = CourseModule(id=w_id, course_id=c_web.id, title=w_title, description=w_desc, sequence_number=w_seq)
            db.add(mod)
            db.flush()

            # Add sample lessons
            for i in range(1, 4):
                l_id = f"cl-{w_id}-l{i}"
                db.add(CourseLesson(
                    id=l_id,
                    module_id=mod.id,
                    title=f"{w_title} - Core Topic {i}",
                    duration=20,
                    sequence_number=i,
                    learning_objectives_json=json.dumps([f"Master {w_title} Concept {i}", "Ensure accessibility compliance"]),
                    content=f"Detailed educational breakdown for {w_title} (Lesson {i}). Understanding modern standards and practical implementation.",
                    code_snippet="const app = document.querySelector('#root');\nconsole.log('Inclusive Web Engineering');",
                    diagram_mermaid="graph LR; HTML[HTML Structure] --> CSS[CSS Presentation] --> JS[JS Behavior];",
                    simple_explanation="Websites are like buildings: HTML is the brick frame, CSS is the paint and decor, and JavaScript is the electricity and elevators.",
                    detailed_explanation="In-depth exploration of DOM nodes, CSSOM render tree construction, and JavaScript V8 JIT compilation pipeline.",
                    step_by_step_json=json.dumps(["1. Write semantic elements", "2. Style with responsive units", "3. Attach accessible event listeners"]),
                    real_world_example="Developing high-traffic commercial web portals like Netflix, Wikipedia, and Airbnb.",
                    revision_notes="• Keep markup semantic\n• Always provide alt text for screen readers\n• Use CSS Flexbox and Grid for modern layouts",
                    audio_script=f"Welcome to lesson {i} of {w_title}.",
                ))

            # Add module quiz
            asmt = CourseAssessment(
                id=f"asmt-{w_id}",
                course_id=c_web.id,
                module_id=mod.id,
                title=f"{w_title} - Knowledge Assessment",
                assessment_type="module_quiz",
                total_marks=20,
                passing_percentage=70.0
            )
            db.add(asmt)
            db.flush()
            db.add(CourseQuestion(
                id=f"q-{asmt.id}-1",
                assessment_id=asmt.id,
                question=f"Which standard is essential when engineering inclusive web applications in {w_title}?",
                question_type="multiple_choice",
                options_json=json.dumps(["WCAG 2.2 AA Accessibility Standards", "Flash Browser Plugins", "Inline Table Layouts", "Deprecating Mobile Views"]),
                correct_answer="WCAG 2.2 AA Accessibility Standards",
                explanation="WCAG 2.2 provides normative guidelines to ensure accessibility for individuals with disabilities.",
                points=20
            ))

        db.commit()
        print("[SEED COURSES] Seeded Course 3: Web Development.")

        # -------------------------------------------------------------
        # 5. COURSE 4: Database Management Systems (DBMS)
        # -------------------------------------------------------------
        c_dbms = Course(
            id="course-dbms",
            category_id="cat-cs",
            title="Database Management Systems: SQL, Relational Design & Optimization",
            description="From relational theory to high-performance SQL: ER modeling, normalization (1NF to BCNF), transaction ACID properties, indexing, triggers, and practical MySQL queries.",
            difficulty="Intermediate",
            instructor_id="user-teacher-1",
            instructor_name="Dr. Elena Sharma",
            instructor_title="Principal AI Research Educator",
            thumbnail="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80",
            icon="Database",
            color="#10B981",
            estimated_duration="22 hours",
            rating=4.85,
            rating_count=190,
            enrollment_count=870,
            published=True,
            learning_outcomes=[
                "Model real-world business domains using Entity-Relationship (ER) diagrams.",
                "Normalize database schemas to eliminate redundancy and prevent update anomalies.",
                "Write complex SQL queries involving multi-table JOINs, subqueries, and window functions.",
                "Understand transaction isolation levels, concurrency control, and index optimization.",
            ],
            prerequisites=["Basic logical reasoning and problem-solving skills."],
        )
        db.add(c_dbms)
        db.flush()

        dbms_modules = [
            ("mod-db-1", "Module 1: DBMS Architecture & ER Modeling", "Data abstraction levels, 3-tier architecture, entities, attributes, and relationships.", 1),
            ("mod-db-2", "Module 2: Relational Model & Integrity Constraints", "Tuples, relations, candidate keys, primary keys, and foreign key integrity.", 2),
            ("mod-db-3", "Module 3: Structured Query Language (SQL) Core", "DDL (CREATE, ALTER), DML (INSERT, UPDATE), and DQL (SELECT, WHERE).", 3),
            ("mod-db-4", "Module 4: Advanced SQL, Joins & Subqueries", "INNER, LEFT, RIGHT, FULL OUTER joins, aggregate functions, and correlated subqueries.", 4),
            ("mod-db-5", "Module 5: Normalization & Schema Design", "Functional dependencies, 1NF, 2NF, 3NF, BCNF, and lossless join decomposition.", 5),
            ("mod-db-6", "Module 6: Transactions, Concurrency & Indexing", "ACID properties, B-Tree indices, locks, and query execution plans.", 6),
        ]
        for db_id, db_title, db_desc, db_seq in dbms_modules:
            mod = CourseModule(id=db_id, course_id=c_dbms.id, title=db_title, description=db_desc, sequence_number=db_seq)
            db.add(mod)
            db.flush()

            for i in range(1, 4):
                l_id = f"cl-{db_id}-l{i}"
                db.add(CourseLesson(
                    id=l_id,
                    module_id=mod.id,
                    title=f"{db_title} - Part {i}",
                    duration=20,
                    sequence_number=i,
                    learning_objectives_json=json.dumps([f"Master {db_title} Part {i}", "Write reliable database queries"]),
                    content=f"Comprehensive examination of {db_title}. Understanding data consistency, indexing, and schema reliability.",
                    code_snippet="SELECT u.name, COUNT(p.id) AS completed_lessons\nFROM users u\nJOIN course_lesson_progress p ON u.id = p.student_id\nGROUP BY u.name\nHAVING completed_lessons >= 5;",
                    diagram_mermaid="erDiagram\nSTUDENT ||--o{ ENROLLMENT : has\nCOURSE ||--o{ ENROLLMENT : contains",
                    simple_explanation="A database is like an organized digital library: shelves are tables, books are records, and SQL is the librarian who fetches exactly what you request.",
                    detailed_explanation="Deep dive into relational algebra (projection, selection, cartesian product) and B-Tree indexing disk access optimizations.",
                    step_by_step_json=json.dumps(["1. Define entity relationships", "2. Create tables with foreign key constraints", "3. Write optimized SQL query"]),
                    real_world_example="Banking transaction ledgers, airline flight booking systems, and student records databases.",
                    revision_notes="• Primary key uniquely identifies row\n• Foreign key maintains referential integrity\n• Normalization reduces duplicate data",
                    audio_script=f"Welcome to {db_title} in Database Management Systems.",
                ))

            asmt = CourseAssessment(
                id=f"asmt-{db_id}",
                course_id=c_dbms.id,
                module_id=mod.id,
                title=f"{db_title} - Knowledge Check",
                assessment_type="module_quiz",
                total_marks=20,
                passing_percentage=70.0
            )
            db.add(asmt)
            db.flush()
            db.add(CourseQuestion(
                id=f"q-{asmt.id}-1",
                assessment_id=asmt.id,
                question="What does the 'A' in the database ACID transaction properties stand for?",
                question_type="multiple_choice",
                options_json=json.dumps(["Atomicity (All or Nothing)", "Authentication", "Algorithm", "Asynchronous"]),
                correct_answer="Atomicity (All or Nothing)",
                explanation="Atomicity guarantees that all operations within a transaction succeed completely or roll back entirely.",
                points=20
            ))

        db.commit()
        print("[SEED COURSES] Seeded Course 4: Database Management Systems.")

        # -------------------------------------------------------------
        # 6. COURSE 5: Data Structures and Algorithms (DSA)
        # -------------------------------------------------------------
        c_dsa = Course(
            id="course-dsa",
            category_id="cat-cs",
            title="Data Structures & Algorithms: Computational Thinking & Interview Mastery",
            description="Master computer science fundamentals: asymptotic notation, arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, and dynamic programming.",
            difficulty="Advanced",
            instructor_id="user-teacher-1",
            instructor_name="Dr. Elena Sharma",
            instructor_title="Principal AI Research Educator",
            thumbnail="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
            icon="Cpu",
            color="#8B5CF6",
            estimated_duration="32 hours",
            rating=4.95,
            rating_count=520,
            enrollment_count=1820,
            published=True,
            learning_outcomes=[
                "Analyze algorithm efficiency using Big-O, Big-Omega, and Big-Theta asymptotic bounds.",
                "Implement Linear Data Structures: Singly/Doubly Linked Lists, Stacks, and Queues.",
                "Traverse and balance Trees: BSTs, AVL, Heaps, and Graph Search (BFS / DFS).",
                "Apply dynamic programming, memoization, and greedy heuristics to solve complex coding interview problems.",
            ],
            prerequisites=["Comfortable with any programming language (Python, Java, or C++)."],
        )
        db.add(c_dsa)
        db.flush()

        dsa_modules = [
            ("mod-dsa-1", "Module 1: Asymptotic Analysis & Big O Notation", "Time complexity, space complexity, best/worst/average cases, and growth rates.", 1),
            ("mod-dsa-2", "Module 2: Arrays, Strings & Two-Pointer Techniques", "Memory layout, prefix sums, sliding window, and two-pointer algorithms.", 2),
            ("mod-dsa-3", "Module 3: Linked Lists (Singly, Doubly, Circular)", "Node references, insertion, deletion, reversing lists, and Floyd's cycle detection.", 3),
            ("mod-dsa-4", "Module 4: Stacks, Queues & Monotonic Deques", "LIFO and FIFO principles, balanced parenthesis, queue with two stacks, and sliding window maximum.", 4),
            ("mod-dsa-5", "Module 5: Trees, Binary Search Trees & Graphs", "Tree traversal (Inorder, Preorder, Postorder), BST search/insert, BFS, and DFS.", 5),
            ("mod-dsa-6", "Module 6: Sorting & Searching Algorithms", "Merge sort, Quick sort, Heap sort, binary search, and lower bound analysis.", 6),
            ("mod-dsa-7", "Module 7: Dynamic Programming & Problem Solving", "Optimal substructure, overlapping subproblems, memoization vs tabulation, and 0/1 knapsack.", 7),
        ]
        for dsa_id, dsa_title, dsa_desc, dsa_seq in dsa_modules:
            mod = CourseModule(id=dsa_id, course_id=c_dsa.id, title=dsa_title, description=dsa_desc, sequence_number=dsa_seq)
            db.add(mod)
            db.flush()

            for i in range(1, 4):
                l_id = f"cl-{dsa_id}-l{i}"
                db.add(CourseLesson(
                    id=l_id,
                    module_id=mod.id,
                    title=f"{dsa_title} - Part {i}",
                    duration=25,
                    sequence_number=i,
                    learning_objectives_json=json.dumps([f"Master {dsa_title} Core Concept", "Analyze time and space complexity"]),
                    content=f"Rigorous analysis of {dsa_title}. Exploring edge cases, memory layout, and runtime optimization.",
                    code_snippet="def binary_search(arr: list[int], target: int) -> int:\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
                    diagram_mermaid="graph TD; Root[Root Node: 50] --> Left[Left Child: 30]; Root --> Right[Right Child: 70]; Left --> L1[20]; Left --> L2[40]; Right --> R1[60]; Right --> R2[80];",
                    simple_explanation="Algorithms are recipes for solving puzzles in the fewest possible steps. Binary search is like opening a dictionary in the exact middle to find a word in seconds.",
                    detailed_explanation="Mathematical analysis using recurrence relations (Master Theorem T(n) = aT(n/b) + f(n)) to prove logarithmic and linearithmic bounds.",
                    step_by_step_json=json.dumps(["1. Define problem constraints", "2. Choose appropriate data structure", "3. Formulate invariant condition", "4. Verify worst-case Big-O"]),
                    real_world_example="Google Maps route optimization, database query planners, and operating system CPU scheduling queues.",
                    revision_notes="• Binary search requires sorted array: O(log N)\n• Hash table provides O(1) average lookup\n• Merge sort is O(N log N) worst-case",
                    audio_script=f"Welcome to {dsa_title} in Data Structures and Algorithms.",
                ))

            asmt = CourseAssessment(
                id=f"asmt-{dsa_id}",
                course_id=c_dsa.id,
                module_id=mod.id,
                title=f"{dsa_title} - Algorithmic Quiz",
                assessment_type="module_quiz",
                total_marks=20,
                passing_percentage=70.0
            )
            db.add(asmt)
            db.flush()
            db.add(CourseQuestion(
                id=f"q-{asmt.id}-1",
                assessment_id=asmt.id,
                question="What is the time complexity of Binary Search on a sorted array of size N?",
                question_type="multiple_choice",
                options_json=json.dumps(["O(log N)", "O(N)", "O(1)", "O(N^2)"]),
                correct_answer="O(log N)",
                explanation="Binary search halves the search space with each step, yielding logarithmic time O(log N).",
                points=20
            ))

        db.commit()
        print("[SEED COURSES] Seeded Course 5: Data Structures and Algorithms.")

        # -------------------------------------------------------------
        # 7. ADDITIONAL COURSES ACROSS REMAINING CATEGORIES
        # -------------------------------------------------------------
        additional_courses = [
            ("course-math", "cat-math", "Calculus & Linear Algebra for Machine Learning", "Matrices, vectors, eigenvalues, derivatives, gradient descent, and probability foundations for AI.", "Intermediate", "Calculator", "#EC4899", "18 hours", 4.9, 140, 650),
            ("course-physics", "cat-science", "Engineering Physics & Semiconductor Electronics", "Classical mechanics, electromagnetism, wave optics, quantum basics, and semiconductor diode physics.", "Intermediate", "Atom", "#F59E0B", "20 hours", 4.8, 95, 420),
            ("course-comm", "cat-lang", "Technical Writing & Workplace Communication", "Professional email writing, engineering documentation, presentation skills, and active listening.", "Beginner", "MessageSquare", "#14B8A6", "10 hours", 4.95, 180, 890),
            ("course-aptitude", "cat-career", "Quantitative Aptitude & Placement Interview Mastery", "Arithmetic shortcuts, logical reasoning, data interpretation, puzzles, and coding interview behavior.", "Beginner", "Briefcase", "#6366F1", "16 hours", 4.88, 310, 1420),
            ("course-powerbi", "cat-business", "Business Intelligence & Data Analytics with Power BI & Excel", "Transform messy data with Power Query, write DAX measures, and design executive KPI dashboards.", "Beginner", "TrendingUp", "#10B981", "14 hours", 4.85, 230, 990),
            ("course-gate", "cat-exams", "GATE Computer Science & Information Technology Comprehensive Prep", "In-depth problem-solving for GATE: Theory of Computation, Compiler Design, OS, Networks & Algorithms.", "Advanced", "Award", "#E11D48", "40 hours", 4.92, 410, 1150),
        ]

        for c_id, cat_id, title, desc, diff, icon, color, dur, rat, rc, ec in additional_courses:
            crs = Course(
                id=c_id,
                category_id=cat_id,
                title=title,
                description=desc,
                difficulty=diff,
                instructor_id="user-teacher-1",
                instructor_name="Dr. Elena Sharma",
                instructor_title="Principal AI Research Educator",
                icon=icon,
                color=color,
                estimated_duration=dur,
                rating=rat,
                rating_count=rc,
                enrollment_count=ec,
                published=True,
                learning_outcomes=[
                    f"Comprehensive mastery of {title}.",
                    "Practical application in academic and industrial settings.",
                    "Personalized adaptation and accessibility support.",
                ],
                prerequisites=["Interest and enthusiasm for the topic."],
            )
            db.add(crs)
            db.flush()

            # Add 2 modules with 2 lessons each
            for m_i in range(1, 3):
                mod = CourseModule(
                    id=f"mod-{c_id}-{m_i}",
                    course_id=crs.id,
                    title=f"Module {m_i}: Core Principles of {title.split(':')[0]}",
                    description=f"Essential foundations and practical applications for Module {m_i}.",
                    sequence_number=m_i
                )
                db.add(mod)
                db.flush()

                for l_i in range(1, 3):
                    db.add(CourseLesson(
                        id=f"cl-{c_id}-m{m_i}-l{l_i}",
                        module_id=mod.id,
                        title=f"Lesson {l_i}: Fundamentals & Applications",
                        duration=15,
                        sequence_number=l_i,
                        learning_objectives_json=json.dumps([f"Understand core tenets of Lesson {l_i}", "Apply learning in exercises"]),
                        content=f"Comprehensive lesson explaining {title} (Module {m_i}, Lesson {l_i}). Clear educational principles, examples, and takeaways.",
                        code_snippet="// Educational illustration snippet\nfunction verifyConcept() {\n  return true;\n}",
                        diagram_mermaid="graph TD; Input[Input Data] --> Process[Analytical Engine] --> Output[Mastery Result];",
                        simple_explanation=f"A simplified look at {title} designed for quick understanding.",
                        detailed_explanation=f"Technical depth and academic rigor covering {title}.",
                        step_by_step_json=json.dumps(["Step 1: Introduction", "Step 2: Core Analysis", "Step 3: Verification"]),
                        real_world_example="Applied in cutting-edge technology and engineering problem solving.",
                        revision_notes=f"• Key takeaway for {title} (Module {m_i})\n• Retain concepts with spaced review",
                        audio_script=f"Welcome to this lesson in {title}.",
                    ))

                # Module Quiz
                asmt = CourseAssessment(
                    id=f"asmt-{c_id}-m{m_i}",
                    course_id=crs.id,
                    module_id=mod.id,
                    title=f"Module {m_i} Review Quiz",
                    assessment_type="module_quiz",
                    total_marks=20,
                    passing_percentage=70.0
                )
                db.add(asmt)
                db.flush()
                db.add(CourseQuestion(
                    id=f"q-{asmt.id}-1",
                    assessment_id=asmt.id,
                    question=f"What is the primary focus of this module in {title}?",
                    question_type="multiple_choice",
                    options_json=json.dumps(["Mastering core domain concepts", "Random memorization", "Ignoring practical context", "Outdated legacy standards"]),
                    correct_answer="Mastering core domain concepts",
                    explanation="Rigorous understanding of foundational domain concepts is essential.",
                    points=20
                ))

        db.commit()

        # -------------------------------------------------------------
        # 8. SEED INITIAL ENROLLMENT & SAMPLE PROGRESS FOR DEMO PERSONAS
        # -------------------------------------------------------------
        # Enroll Aarav (learner-a) in Python Programming
        db.add(CourseEnrollment(
            id="enroll-aarav-py",
            student_id="user-student-a",
            course_id="course-python",
            status="active",
            last_accessed_lesson_id="cl-py-m1-l2",
            enrolled_at=datetime.utcnow()
        ))
        # Mark Lesson 1 as completed for Aarav
        db.add(CourseLessonProgress(
            id="prog-aarav-py-l1",
            student_id="user-student-a",
            lesson_id="cl-py-m1-l1",
            completion_status="completed",
            time_spent_minutes=14.5,
            completed_at=datetime.utcnow()
        ))
        # Add sample student note for Aarav
        db.add(StudentLessonNote(
            id="note-aarav-py-l1",
            student_id="user-student-a",
            lesson_id="cl-py-m1-l1",
            note_text="Remember: Python compiles source code into .pyc bytecode before the Python Virtual Machine (PVM) executes it!"
        ))
        # Add sample bookmark
        db.add(LessonBookmark(
            id="bm-aarav-py-l1",
            student_id="user-student-a",
            lesson_id="cl-py-m1-l1"
        ))

        # Enroll Maya (learner-b) in Web Development and DSA
        db.add(CourseEnrollment(
            id="enroll-maya-web",
            student_id="user-student-b",
            course_id="course-webdev",
            status="active",
            last_accessed_lesson_id="cl-mod-web-1-l1",
            enrolled_at=datetime.utcnow()
        ))
        db.add(CourseEnrollment(
            id="enroll-maya-dsa",
            student_id="user-student-b",
            course_id="course-dsa",
            status="active",
            last_accessed_lesson_id="cl-mod-dsa-1-l1",
            enrolled_at=datetime.utcnow()
        ))

        db.commit()
        print("[SEED COURSES] Complete Course and Lesson Management System seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"[SEED COURSES ERROR] {e}")
        raise e
    finally:
        if close_at_end:
            db.close()

if __name__ == "__main__":
    seed_courses_system()

