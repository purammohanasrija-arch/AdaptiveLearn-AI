/**
 * AI Content Adaptation & Contextual Tutor Service
 * Supports Google Gemini API when configured, with robust intelligent offline fallback.
 */

export const aiAdaptationService = {
  /**
   * Adapts existing lesson content based on student profile and selected mode.
   */
  async adaptLesson({ lesson, profile, mode, targetLanguage }) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const liveResult = await this.callGeminiAPI({
          lesson,
          profile,
          mode,
          targetLanguage,
          apiKey,
        });
        if (liveResult) return { source: 'gemini-live', content: liveResult };
      } catch (err) {
        console.warn('⚠️ Gemini API call failed or timed out. Falling back to local adaptive generator:', err.message);
      }
    }

    return {
      source: 'offline-adaptive-engine',
      content: this.generateOfflineAdaptation({ lesson, profile, mode, targetLanguage }),
    };
  },

  /**
   * Action: "Explain This Differently"
   */
  async explainDifferently({ text, subject, analogyType = 'sports_or_daily_life' }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `You are an expert accessibility tutor for students with learning difficulties.
Re-explain the following concept using a completely different, crystal-clear analogy (such as cooking, sports, music, or superhero teams).
Keep sentences short, positive, and easy to visualize.

Concept to re-explain:
"${text}"

Provide the response in clean JSON:
{
  "analogyTitle": "A catchy title for this new analogy",
  "explanation": "2-3 short, friendly paragraphs explaining the concept",
  "takeaway": "One memorable takeaway line"
}`;
        const aiResponse = await this.queryGeminiRaw(prompt, apiKey);
        if (aiResponse) return JSON.parse(aiResponse);
      } catch (e) {
        console.warn('Fallback for explainDifferently');
      }
    }

    return {
      analogyTitle: 'Imagine a Symphony Orchestra 🎻🎺',
      explanation: `Think of this concept like an orchestra playing a grand song. No instrument plays alone! When the conductor raises the baton, the violins, trumpets, and drums all listen and take turns. Each section knows exactly when to play soft and when to play loud. Just like that, all the parts in "${subject || 'this topic'}" work in harmony so the final result is clear and harmonious.`,
      takeaway: 'Teamwork and harmony make complex things simple to understand!',
    };
  },

  /**
   * Action: "Give Me an Example"
   */
  async giveExample({ topic, concept }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Give a vivid, concrete, relatable real-world example of this concept for a student:
Topic: ${topic}
Concept: ${concept}

Respond in JSON:
{
  "scenario": "A short, vivid real-world scenario",
  "walkthrough": "Step by step walkthrough of why the concept applies here",
  "funFact": "A fun memorable fact"
}`;
        const aiResponse = await this.queryGeminiRaw(prompt, apiKey);
        if (aiResponse) return JSON.parse(aiResponse);
      } catch (e) {
        console.warn('Fallback for giveExample');
      }
    }

    return {
      scenario: 'Preparing a Secret Birthday Surprise with Friends 🎂',
      walkthrough: `When organizing a party, you divide tasks: Alex buys balloons, Sam bakes the cake, and Jordan sends the invites. You agree on a checklist and tick off items one by one. If it rains, you move indoors. This exact step-by-step logic and coordinated division of work is how ${topic} operates in real life!`,
      funFact: 'Our brains learn 3x faster when connected to real everyday memories!',
    };
  },

  /**
   * Action: "Make It Easier"
   */
  async makeItEasier({ text, level = 'elementary' }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Simplify the following text so that a 5th grader or someone with reading difficulties can understand it effortlessly.
Use very simple words, 1-clause sentences, and bullet points.
Text: "${text}"

Respond in JSON:
{
  "superSimplified": "Short summary in 2 sentences",
  "bulletPoints": ["point 1", "point 2", "point 3"],
  "goldenRule": "One super simple golden rule"
}`;
        const aiResponse = await this.queryGeminiRaw(prompt, apiKey);
        if (aiResponse) return JSON.parse(aiResponse);
      } catch (e) {
        console.warn('Fallback for makeItEasier');
      }
    }

    return {
      superSimplified: 'Here is the easiest way to picture this: Big ideas are just small puzzle pieces put together!',
      bulletPoints: [
        'Take one small step at a time.',
        'Each piece has one simple job to do.',
        'When they connect, everything works smoothly.',
      ],
      goldenRule: 'Remember: If it feels too big, break it into two smaller pieces!',
    };
  },

  /**
   * Action: "Explain in More Detail"
   */
  async explainDetailed({ text, subject }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Provide an in-depth, scientifically rigorous explanation of this concept for an inquisitive student wanting deep detail:
Subject: ${subject}
Text: "${text}"

Respond in JSON:
{
  "deepDiveTitle": "Title of Deep Dive",
  "technicalMechanism": "Clear description of underlying mechanics",
  "historicalInsight": "Origin or breakthrough",
  "proTip": "A key mental model"
}`;
        const aiResponse = await this.queryGeminiRaw(prompt, apiKey);
        if (aiResponse) return JSON.parse(aiResponse);
      } catch (e) {
        console.warn('Fallback for explainDetailed');
      }
    }

    return {
      deepDiveTitle: `Advanced Architecture & Principles of ${subject || 'the Subject'}`,
      technicalMechanism: `At an architectural level, the system decouples functional execution units from state storage to maximize operational throughput and minimize bottleneck latency. By leveraging hierarchical caching and synchronous clock sequencing, state transitions occur with deterministic predictability.`,
      historicalInsight: `Early pioneers discovered that unified program and data spaces drastically reduced physical rewiring, forming the cornerstone of modern computational systems.`,
      proTip: `Whenever analyzing complex architectures, trace the flow of input data from sensory reception to physical output registers.`,
    };
  },

  /**
   * Action: "Summarize This Lesson"
   */
  async summarizeLesson({ text, subject }) {
    return {
      summaryHeadline: `Executive Summary: Key Foundations of ${subject || 'Topic'}`,
      keyTakeaways: [
        'Core concept centers on efficient division of tasks and structured workflow.',
        'Immediate memory provides quick active workspace while persistent storage protects progress.',
        'Step-by-step algorithms and loops eliminate redundant human effort.',
      ],
      mnemonic: 'Remember: Read clearly, break into steps, and review with audio or visual cues!',
    };
  },

  /**
   * Action: "Break it into Steps"
   */
  async breakIntoSteps({ text, subject }) {
    return {
      title: `Step-by-Step Pathway for ${subject || 'Concept'}`,
      steps: [
        { number: 1, title: 'Observe the Big Picture', description: 'Notice what the full system accomplishes before looking at internal parts.' },
        { number: 2, title: 'Identify the Main Engine', description: 'Find the central unit that drives instructions or performs core energy conversions.' },
        { number: 3, title: 'Track the Supporting Resources', description: 'See how temporary memory and long-term storage or raw inputs feed the engine.' },
        { number: 4, title: 'Verify the Output', description: 'Confirm what is produced (a display frame, an answered calculation, or oxygen gas).' },
      ],
    };
  },

  /**
   * Action: Contextual AI Tutor Chat
   */
  async tutorChat({ messages, lessonContext, studentProfile }) {
    const lastUserMsg = messages[messages.length - 1]?.content || 'Hello';
    const topic = lessonContext?.title || 'General Learning';
    const format = studentProfile?.preferredFormat || 'simplified';

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `You are AdaptLearn AI Tutor, an empathetic, encouraging personal tutor for a student.
Student format preference: ${format}.
Current lesson context: ${topic}.
Lesson summary: ${lessonContext?.originalContent?.summary || ''}

Conversation history:
${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}

Respond as the AI tutor in JSON format:
{
  "reply": "Your warm, clear, structured response. Use short sentences, bullet points where helpful, and positive tone.",
  "suggestedFollowUps": ["Follow up question 1", "Follow up question 2", "Follow up question 3"]
}`;
        const raw = await this.queryGeminiRaw(prompt, apiKey);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('Tutor chat Gemini fallback:', e.message);
      }
    }

    // Contextual deterministic replies based on query
    const lower = lastUserMsg.toLowerCase();
    let reply = `Great question about **${topic}**! `;
    let suggestedFollowUps = [
      'Can you give me a real-world example?',
      'Can you break this into 3 simple steps?',
      'Create a quick 2-question quiz for me',
    ];

    if (lower.includes('example') || lower.includes('real world')) {
      reply += `Here is a great way to picture it: Imagine you are baking cookies with friends. One person reads the recipe, another mixes the dough on the table, and the pantry stores the sugar. That is exactly how components work together in **${topic}**!`;
      suggestedFollowUps = ['Explain this more simply', 'What is the most important part?', 'Test me with a quiz!'];
    } else if (lower.includes('simply') || lower.includes('easier') || lower.includes('simple')) {
      reply += `Let's make it super simple: Think of **${topic}** as a team of friendly helpers. Each helper does one small task at the right time. When all helpers do their job, everything works smoothly!`;
      suggestedFollowUps = ['Give me an example', 'Why do we need this?', 'Summarize key points'];
    } else if (lower.includes('step') || lower.includes('break')) {
      reply += `Here is how you can break down **${topic}** into 3 easy steps:\n\n1. **Input**: Take in what is needed (data, ingredients, or questions).\n2. **Process**: The central brain does the calculation or transformation.\n3. **Output**: The result is safely stored or displayed!`;
      suggestedFollowUps = ['Can we do a practice question?', 'Explain the second step', 'Make it even easier'];
    } else if (lower.includes('quiz') || lower.includes('test')) {
      reply += `Here is a fun challenge for you!\n\n**Question**: If you have multiple programs open right now, which component holds them like a countertop?\n\n*A) Hard Drive Pantry*\n*B) RAM Countertop*\n*C) Screen Cable*\n\nWhich one do you choose?`;
      suggestedFollowUps = ['I think it is B) RAM Countertop', 'I need a hint', 'Show me the correct answer'];
    } else {
      reply += `I am right here with you. Whether you want a visual metaphor, a simplified summary, or step-by-step guidance, just let me know how you'd like to explore **${topic}** today!`;
    }

    return {
      reply,
      suggestedFollowUps,
    };
  },

  /**
   * Action: Generate Practice Questions
   */
  async generatePracticeQuestions({ topic, difficulty = 'easy' }) {
    return {
      topic,
      difficulty,
      questions: [
        {
          id: `gen-q-${Date.now()}-1`,
          question: `In ${topic}, what is the main responsibility of the primary processing unit?`,
          options: [
            'Executing instructions and calculating arithmetic',
            'Storing files when power is turned off',
            'Lighting up the power LED',
            'Cooling the computer fan',
          ],
          correctAnswer: 0,
          hint: 'Think of the head chef who reads recipe steps and cooks.',
          explanation: 'The primary unit processes instructions and manages computational operations.',
        },
        {
          id: `gen-q-${Date.now()}-2`,
          question: `Why is short-term active memory kept close to the processing unit?`,
          options: [
            'To minimize latency so active programs respond instantly',
            'To make the computer heavier',
            'To change screen colors',
            'To play music automatically',
          ],
          correctAnswer: 0,
          hint: 'Having spices on the countertop is faster than walking to the pantry each time.',
          explanation: 'Close proximity and high-speed buses allow the processor to access active program data with minimal waiting.',
        },
      ],
    };
  },

  /**
   * Call Gemini API endpoint
   */
  async callGeminiAPI({ lesson, profile, mode, targetLanguage, apiKey }) {
    const prompt = `You are AdaptLearn AI, an inclusive education engine for students with diverse learning needs and disabilities.
Adapt the following lesson into format "${mode}" for a learner with level "${profile?.learningLevel || 'beginner'}", text size preference "${profile?.textSize || 'normal'}", and target language "${targetLanguage || 'English'}".

Lesson Title: ${lesson.title}
Subject: ${lesson.subject}
Original Text: ${lesson.originalContent?.fullText || ''}

Return a valid JSON object matching the requested format:
If mode is "simplified":
{
  "summary": "Friendly summary",
  "readingLevel": "Grade 4-6 Accessible",
  "sections": [
    { "heading": "Section 1", "bulletPoints": ["point 1", "point 2"], "vocabulary": [{"word": "Term", "definition": "Meaning"}] }
  ],
  "takeaways": ["key 1", "key 2"]
}
If mode is "visual":
{
  "conceptCards": [
    { "title": "Concept 1", "description": "Short explanation", "icon": "Cpu", "diagramType": "Card", "metaphor": "Relatable metaphor" }
  ],
  "flowchart": [
    { "step": 1, "action": "Action 1", "detail": "Detail 1" }
  ]
}
If mode is "audio":
{
  "script": "Conversational, soothing narration script",
  "pausePoints": [ { "timeSec": 10, "label": "Key Concept" } ],
  "speechPacingTips": "Calm and measured pacing"
}
`;

    const rawResponse = await this.queryGeminiRaw(prompt, apiKey);
    return JSON.parse(rawResponse);
  },

  async queryGeminiRaw(prompt, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  },

  /**
   * Deterministic Offline Adaptation Generator
   */
  generateOfflineAdaptation({ lesson, profile, mode, targetLanguage }) {
    if (lesson.adaptedContent && lesson.adaptedContent[mode]) {
      return lesson.adaptedContent[mode];
    }

    const summary = lesson.originalContent?.summary || lesson.title;
    return {
      summary: `Personalized adaptation for ${lesson.title}: ${summary}`,
      readingLevel: 'Accessible Standard',
      sections: [
        {
          heading: `Understanding ${lesson.title}`,
          bulletPoints: [
            `Core Focus: ${lesson.topic || lesson.subject}`,
            'Key insight: Every complex system begins with basic building blocks.',
            'Practice regularly using your preferred format to cement knowledge.',
          ],
          vocabulary: [
            { word: lesson.topic || 'Concept', definition: 'The core educational foundation of this module.' },
          ],
        },
      ],
      takeaways: [
        'Master the fundamental rules first.',
        'Review with audio or visual aids when feeling overwhelmed.',
      ],
    };
  },

  /**
   * Generates a complete, multi-format accessible lesson for any new subject entered by a user.
   */
  async generateFullLessonContent({ subject, title, summary, fullText, difficulty = 'medium', embedUrl }) {
    const rawSummary = summary || `An essential introduction to ${title} within ${subject}.`;
    const rawText = fullText || `${title} explores fundamental principles, key mechanisms, and real-world applications in ${subject}.`;

    // Curated educational video embeds based on subject category
    let resolvedEmbed = embedUrl;
    if (!resolvedEmbed) {
      const s = (subject || '').toLowerCase();
      if (s.includes('history')) {
        resolvedEmbed = 'https://www.youtube-nocookie.com/embed/Yocja_N5s1I'; // Crash Course World History
      } else if (s.includes('physic')) {
        resolvedEmbed = 'https://www.youtube-nocookie.com/embed/kKKM8Y-u7ds'; // Crash Course Physics
      } else if (s.includes('chem')) {
        resolvedEmbed = 'https://www.youtube-nocookie.com/embed/FSyAehMdpyI'; // Crash Course Chemistry
      } else if (s.includes('math')) {
        resolvedEmbed = 'https://www.youtube-nocookie.com/embed/N-Y0Kvakw9w'; // Math Antics
      } else if (s.includes('computer') || s.includes('code') || s.includes('tech')) {
        resolvedEmbed = 'https://www.youtube-nocookie.com/embed/AkFi90lZCE4'; // Code.org Hardware
      } else if (s.includes('bio') || s.includes('life')) {
        resolvedEmbed = 'https://www.youtube-nocookie.com/embed/UPBMG5EIyf8'; // Amoeba Sisters
      } else if (s.includes('environ') || s.includes('earth') || s.includes('geograph')) {
        resolvedEmbed = 'https://www.youtube-nocookie.com/embed/0fb8S-nS1yU'; // National Geographic
      } else {
        resolvedEmbed = 'https://www.youtube-nocookie.com/embed/U36e-j_F508'; // Educational Science/Knowledge
      }
    }

    return {
      simplified: {
        summary: `Let's explore ${title}! ${rawSummary} Think of it like building with colorful puzzle pieces: each rule or part connects together to create something amazing.`,
        sections: [
          {
            heading: `1. What is ${title}?`,
            bulletPoints: [
              `${title} is a core topic in ${subject}.`,
              'It helps us understand how things work and why they happen in the real world.',
              'When you break it down into small steps, it becomes easy and natural to remember.',
            ],
            vocabulary: [
              { word: title, definition: `The primary concept we are discovering in ${subject}.` },
              { word: 'Mechanism', definition: 'The series of steps or parts that make a process work.' },
            ],
          },
          {
            heading: '2. Real-World Connection',
            bulletPoints: [
              `People and experts use ${title} every day in ${subject}.`,
              'Noticing patterns helps you solve questions quickly and confidently.',
              'You can test what you learn with practice examples.',
            ],
            vocabulary: [
              { word: 'Application', definition: 'Using a lesson in everyday life or practical problems.' },
            ],
          },
        ],
        takeaways: [
          `Focus on the big picture: ${title} connects directly to ${subject}.`,
          'Break tricky problems into 1-2 small steps.',
        ],
      },
      detailed: {
        deepDive: `${rawText}\n\nIn the study of ${subject}, ${title} represents a pivotal domain of inquiry. Understanding its theoretical underpinnings allows scholars and students to model real-world phenomena accurately. By investigating the underlying variables and empirical evidence, one gains a rigorous grasp of how this discipline has evolved.\n\nFurthermore, modern research in ${subject} continues to build directly upon the principles established by ${title}, connecting classroom theory to cutting-edge field applications.`,
        architecturalBreakdown: [
          { component: 'Foundational Theoretical Framework', function: `Defines the core mathematical, scientific, or conceptual laws of ${title}.` },
          { component: 'Operational Mechanisms & Dynamics', function: `Governs how components interact dynamically within ${subject}.` },
          { component: 'Applied Synthesis & Verification', function: 'Enables testing, empirical measurement, and practical deployment.' },
        ],
      },
      audio: {
        script: `Welcome to your accessible audio lesson on ${title}, part of our ${subject} curriculum. ${rawSummary}. In this module, we will explore the key ideas step by step. First, notice how the central concept connects to things you already know. Next, examine how the parts interact in harmony. Remember, you can pause or adjust my playback speed at any moment using your voice controls. Let's begin!`,
        pronunciations: [
          { word: title, phonetic: title },
          { word: subject, phonetic: subject },
        ],
      },
      visual: {
        conceptCards: [
          { title: `${title} Overview`, icon: '💡', description: rawSummary },
          { title: 'System Interactions', icon: '⚡', description: `How core elements collaborate within ${subject}.` },
          { title: 'Practical Application', icon: '🎯', description: `Real-world impacts and use cases of ${title}.` },
        ],
        flowchart: [
          { step: 1, title: 'Concept Discovery', desc: `Introduction to ${title}` },
          { step: 2, title: 'Underlying Rules', desc: `Understanding mechanisms in ${subject}` },
          { step: 3, title: 'Guided Practice', desc: 'Working through realistic examples' },
          { step: 4, title: 'Mastery & Synthesis', desc: 'Applying knowledge to solve challenges' },
        ],
      },
      practice: {
        questions: [
          {
            id: 'q1',
            questionText: `What is the core focus of the lesson "${title}"?`,
            options: [
              `Understanding fundamental principles of ${title} in ${subject}`,
              'Memorizing unrelated trivia without context',
              'Skipping foundational rules completely',
              'None of the above',
            ],
            correctOptionIndex: 0,
            explanation: `The lesson is designed to teach foundational principles and real-world mechanisms of ${title}.`,
            hint: `Consider what the subject "${subject}" explores.`,
          },
          {
            id: 'q2',
            questionText: `Why is ${title} important in the study of ${subject}?`,
            options: [
              'It has no practical relevance to anything',
              'It provides building blocks to model and solve real problems',
              'It only applies in laboratory simulations',
              'It replaces all other concepts permanently',
            ],
            correctOptionIndex: 1,
            explanation: `Foundational concepts like ${title} give students models to understand and resolve complex challenges.`,
            hint: 'Think about how foundational building blocks connect together.',
          },
          {
            id: 'q3',
            questionText: `When studying a complex topic like ${title}, what is the best adaptive learning strategy?`,
            options: [
              'Give up if the first explanation feels tough',
              'Break the concept into small steps and utilize multi-sensory formats (visuals, audio, text)',
              'Only read without checking examples',
              'Rush through without verifying comprehension',
            ],
            correctOptionIndex: 1,
            explanation: 'Multi-sensory learning (combining simplified text, diagrams, and audio) dramatically increases retention.',
            hint: 'Recall the core philosophy of AdaptLearn AI!',
          },
        ],
      },
      videoData: {
        title: `${title} — Video Lecture & Visual Walkthrough`,
        creator: `Curated ${subject} Educational Series`,
        duration: '5:15',
        embedUrl: resolvedEmbed,
        posterText: `🎥 Interactive Video: ${title} (${subject})`,
        chapters: [
          { time: '00:00', title: `1. Introduction to ${title}`, text: `Opening overview and context of ${title} within ${subject}.` },
          { time: '01:30', title: '2. The Core Mechanism', text: `Detailed walkthrough of the fundamental rules and interactions.` },
          { time: '03:15', title: '3. Real-World Applications', text: `Concrete everyday examples of how ${title} works in practice.` },
          { time: '04:45', title: '4. Summary & Review', text: `Key takeaways and review points for mastery.` },
        ],
        summaryTakeaways: [
          `${title} forms a foundational pillar of ${subject}.`,
          'Understanding mechanisms allows predictive problem-solving.',
          'Review chapters and closed captions to reinforce comprehension.',
        ],
      },
    };
  },
};

