const rawData = [
  // General Science (Category: Science)
  {
    lecture_id: 1,
    user_id: 201,
    title: 'Introduction to Science',
    subject: 'general-science',
    category: 'Science',
    module: 'General Science',
    chapter: 1,
    description: 'Overview and introduction to basic scientific concepts.',
    file_type: 'video',
    file_url: 'https://example.com/video/general-science-intro.mp4',
    created_at: '2025-01-01T08:00:00Z'
  },
  {
    lecture_id: 2,
    user_id: 201,
    title: 'Scientific Method',
    subject: 'general-science',
    category: 'Science',
    module: 'General Science',
    chapter: 2,
    description: 'Notes and PDF resources on the scientific method.',
    file_type: 'notes',
    file_url: 'https://example.com/notes/general-science-scientific-method.pdf',
    created_at: '2025-01-02T08:00:00Z'
  },
  {
    lecture_id: 3,
    user_id: 201,
    title: 'Lab Safety',
    subject: 'general-science',
    category: 'Science',
    module: 'General Science',
    chapter: 3,
    description: 'Lab safety procedures and best practices (video).',
    file_type: 'video',
    file_url: 'https://example.com/video/general-science-lab-safety.mp4',
    created_at: '2025-01-03T08:00:00Z'
  },

  // Biology (Category: Science)
  {
    lecture_id: 4,
    user_id: 202,
    title: 'Cell Biology',
    subject: 'biology',
    category: 'Science',
    module: 'Biology',
    chapter: 1,
    description: 'Introduction to cell structure and function.',
    file_type: 'video',
    file_url: 'https://example.com/video/biology-cell-biology.mp4',
    created_at: '2025-01-04T08:00:00Z'
  },
  {
    lecture_id: 5,
    user_id: 202,
    title: 'Genetics',
    subject: 'biology',
    category: 'Science',
    module: 'Biology',
    chapter: 2,
    description: 'Genetics notes (PDF) covering inheritance and DNA basics.',
    file_type: 'notes',
    file_url: 'https://example.com/notes/biology-genetics.pdf',
    created_at: '2025-01-05T08:00:00Z'
  },
  {
    lecture_id: 6,
    user_id: 202,
    title: 'Evolution',
    subject: 'biology',
    category: 'Science',
    module: 'Biology',
    chapter: 3,
    description: 'Video: principles of evolution and natural selection.',
    file_type: 'video',
    file_url: 'https://example.com/video/biology-evolution.mp4',
    created_at: '2025-01-06T08:00:00Z'
  },

  // Chemistry (Category: Science)
  {
    lecture_id: 7,
    user_id: 203,
    title: 'Chemical Reactions',
    subject: 'chemistry',
    category: 'Science',
    module: 'Intro to Chemistry',
    chapter: 1,
    description: 'Explore chemical reactions and examples (video).',
    file_type: 'video',
    file_url: 'https://example.com/video/chemistry-chemical-reactions.mp4',
    created_at: '2025-01-07T08:00:00Z'
  },
  {
    lecture_id: 8,
    user_id: 203,
    title: 'Atomic Structure',
    subject: 'chemistry',
    category: 'Science',
    module: 'Intro to Chemistry',
    chapter: 2,
    description: 'PDF notes on atomic structure and subatomic particles.',
    file_type: 'notes',
    file_url: 'https://example.com/notes/chemistry-atomic-structure.pdf',
    created_at: '2025-01-08T08:00:00Z'
  },
  {
    lecture_id: 9,
    user_id: 203,
    title: 'Chemical Bonding',
    subject: 'chemistry',
    category: 'Science',
    module: 'Intro to Chemistry',
    chapter: 3,
    description: 'Video covering ionic and covalent bonds.',
    file_type: 'video',
    file_url: 'https://example.com/video/chemistry-chemical-bonding.mp4',
    created_at: '2025-01-09T08:00:00Z'
  },

  // Physics (Category: Science)
  {
    lecture_id: 10,
    user_id: 204,
    title: 'Motion and Forces',
    subject: 'physics',
    category: 'Science',
    module: 'Physics',
    chapter: 1,
    description: 'Video: basics of motion and Newtonian forces.',
    file_type: 'video',
    file_url: 'https://example.com/video/physics-motion-and-forces.mp4',
    created_at: '2025-01-10T08:00:00Z'
  },
  {
    lecture_id: 11,
    user_id: 204,
    title: 'Energy and Work',
    subject: 'physics',
    category: 'Science',
    module: 'Physics',
    chapter: 2,
    description: 'Notes on energy, work, and conservation laws (PDF).',
    file_type: 'notes',
    file_url: 'https://example.com/notes/physics-energy-and-work.pdf',
    created_at: '2025-01-11T08:00:00Z'
  },
  {
    lecture_id: 12,
    user_id: 204,
    title: 'Waves and Sound',
    subject: 'physics',
    category: 'Science',
    module: 'Physics',
    chapter: 3,
    description: 'Video covering wave behavior and sound properties.',
    file_type: 'video',
    file_url: 'https://example.com/video/physics-waves-and-sound.mp4',
    created_at: '2025-01-12T08:00:00Z'
  },

  // General Math (Category: Mathematics)
  {
    lecture_id: 13,
    user_id: 205,
    title: 'Number Systems',
    subject: 'general-math',
    category: 'Mathematics',
    module: 'General Math',
    chapter: 1,
    description: 'Video: number systems and representations.',
    file_type: 'video',
    file_url: 'https://example.com/video/general-math-number-systems.mp4',
    created_at: '2025-01-13T08:00:00Z'
  },
  {
    lecture_id: 14,
    user_id: 205,
    title: 'Basic Operations',
    subject: 'general-math',
    category: 'Mathematics',
    module: 'General Math',
    chapter: 2,
    description: 'PDF notes on arithmetic operations and properties.',
    file_type: 'notes',
    file_url: 'https://example.com/notes/general-math-basic-operations.pdf',
    created_at: '2025-01-14T08:00:00Z'
  },
  {
    lecture_id: 15,
    user_id: 205,
    title: 'Problem Solving',
    subject: 'general-math',
    category: 'Mathematics',
    module: 'General Math',
    chapter: 3,
    description: 'Video: strategies for solving math problems.',
    file_type: 'video',
    file_url: 'https://example.com/video/general-math-problem-solving.mp4',
    created_at: '2025-01-15T08:00:00Z'
  },

  // Algebra (Category: Mathematics)
  {
    lecture_id: 16,
    user_id: 206,
    title: 'Linear Equations',
    subject: 'algebra',
    category: 'Mathematics',
    module: 'Algebra',
    chapter: 1,
    description: 'Video introduction to linear equations.',
    file_type: 'video',
    file_url: 'https://example.com/video/algebra-linear-equations.mp4',
    created_at: '2025-01-16T08:00:00Z'
  },
  {
    lecture_id: 17,
    user_id: 206,
    title: 'Quadratic Functions',
    subject: 'algebra',
    category: 'Mathematics',
    module: 'Algebra',
    chapter: 2,
    description: 'Notes on quadratic functions and graphs (PDF).',
    file_type: 'notes',
    file_url: 'https://example.com/notes/algebra-quadratic-functions.pdf',
    created_at: '2025-01-17T08:00:00Z'
  },
  {
    lecture_id: 18,
    user_id: 206,
    title: 'Polynomials',
    subject: 'algebra',
    category: 'Mathematics',
    module: 'Algebra',
    chapter: 3,
    description: 'Video covering polynomial operations.',
    file_type: 'video',
    file_url: 'https://example.com/video/algebra-polynomials.mp4',
    created_at: '2025-01-18T08:00:00Z'
  },

  // Geometry (Category: Mathematics)
  {
    lecture_id: 19,
    user_id: 207,
    title: 'Basic Shapes',
    subject: 'geometry',
    category: 'Mathematics',
    module: 'Geometry',
    chapter: 1,
    description: 'Video overview of basic geometric shapes.',
    file_type: 'video',
    file_url: 'https://example.com/video/geometry-basic-shapes.mp4',
    created_at: '2025-01-19T08:00:00Z'
  },
  {
    lecture_id: 20,
    user_id: 207,
    title: 'Area and Perimeter',
    subject: 'geometry',
    category: 'Mathematics',
    module: 'Geometry',
    chapter: 2,
    description: 'PDF notes with formulas for area and perimeter.',
    file_type: 'notes',
    file_url: 'https://example.com/notes/geometry-area-perimeter.pdf',
    created_at: '2025-01-20T08:00:00Z'
  },
  {
    lecture_id: 21,
    user_id: 207,
    title: 'Volume and Surface Area',
    subject: 'geometry',
    category: 'Mathematics',
    module: 'Geometry',
    chapter: 3,
    description: 'Video: calculating volumes and surface areas.',
    file_type: 'video',
    file_url: 'https://example.com/video/geometry-volume-surface-area.mp4',
    created_at: '2025-01-21T08:00:00Z'
  },

  // Calculus (Category: Mathematics)
  {
    lecture_id: 22,
    user_id: 208,
    title: 'Limits and Continuity',
    subject: 'calculus',
    category: 'Mathematics',
    module: 'Calculus',
    chapter: 1,
    description: 'Video introduction to limits and continuity.',
    file_type: 'video',
    file_url: 'https://example.com/video/calculus-limits-continuity.mp4',
    created_at: '2025-01-22T08:00:00Z'
  },
  {
    lecture_id: 23,
    user_id: 208,
    title: 'Derivatives',
    subject: 'calculus',
    category: 'Mathematics',
    module: 'Calculus',
    chapter: 2,
    description: 'Derivatives notes (PDF) with rules and examples.',
    file_type: 'notes',
    file_url: 'https://example.com/notes/calculus-derivatives.pdf',
    created_at: '2025-01-23T08:00:00Z'
  },
  {
    lecture_id: 24,
    user_id: 208,
    title: 'Integrals',
    subject: 'calculus',
    category: 'Mathematics',
    module: 'Calculus',
    chapter: 3,
    description: 'Video covering basic integration techniques.',
    file_type: 'video',
    file_url: 'https://example.com/video/calculus-integrals.mp4',
    created_at: '2025-01-24T08:00:00Z'
  },

  // Computer Science (Category: Technology)
  {
    lecture_id: 25,
    user_id: 209,
    title: 'Introduction to Computing',
    subject: 'computer-science',
    category: 'Technology',
    module: 'Computer Science',
    chapter: 1,
    description: 'Overview of computing principles (video).',
    file_type: 'video',
    file_url: 'https://example.com/video/computer-science-intro.mp4',
    created_at: '2025-01-25T08:00:00Z'
  },
  {
    lecture_id: 26,
    user_id: 209,
    title: 'Data Structures',
    subject: 'computer-science',
    category: 'Technology',
    module: 'Computer Science',
    chapter: 2,
    description: 'PDF notes on basic data structures.',
    file_type: 'notes',
    file_url: 'https://example.com/notes/computer-science-data-structures.pdf',
    created_at: '2025-01-26T08:00:00Z'
  },
  {
    lecture_id: 27,
    user_id: 209,
    title: 'Algorithms',
    subject: 'computer-science',
    category: 'Technology',
    module: 'Computer Science',
    chapter: 3,
    description: 'Video covering algorithm basics and complexity.',
    file_type: 'video',
    file_url: 'https://example.com/video/computer-science-algorithms.mp4',
    created_at: '2025-01-27T08:00:00Z'
  },

  // Programming (Category: Technology)
  {
    lecture_id: 28,
    user_id: 210,
    title: 'Programming Basics',
    subject: 'programming',
    category: 'Technology',
    module: 'Programming',
    chapter: 1,
    description: 'Video: fundamentals of programming.',
    file_type: 'video',
    file_url: 'https://example.com/video/programming-basics.mp4',
    created_at: '2025-01-28T08:00:00Z'
  },
  {
    lecture_id: 29,
    user_id: 210,
    title: 'Object-Oriented Programming',
    subject: 'programming',
    category: 'Technology',
    module: 'Programming',
    chapter: 2,
    description: 'OOP notes (PDF) with examples.',
    file_type: 'notes',
    file_url: 'https://example.com/notes/programming-oop.pdf',
    created_at: '2025-01-29T08:00:00Z'
  },
  {
    lecture_id: 30,
    user_id: 210,
    title: 'Web Development',
    subject: 'programming',
    category: 'Technology',
    module: 'Programming',
    chapter: 3,
    description: 'Video covering basic web development concepts.',
    file_type: 'video',
    file_url: 'https://example.com/video/programming-web-development.mp4',
    created_at: '2025-01-30T08:00:00Z'
  },

  // Robotics (Category: Technology)
  {
    lecture_id: 31,
    user_id: 211,
    title: 'Robot Components',
    subject: 'robotics',
    category: 'Technology',
    module: 'Robotics',
    chapter: 1,
    description: 'Video overview of common robot components.',
    file_type: 'video',
    file_url: 'https://example.com/video/robotics-components.mp4',
    created_at: '2025-02-01T08:00:00Z'
  },
  {
    lecture_id: 32,
    user_id: 211,
    title: 'Programming Robots',
    subject: 'robotics',
    category: 'Technology',
    module: 'Robotics',
    chapter: 2,
    description: 'PDF notes on programming robots and control systems.',
    file_type: 'notes',
    file_url: 'https://example.com/notes/robotics-programming-robots.pdf',
    created_at: '2025-02-02T08:00:00Z'
  },
  {
    lecture_id: 33,
    user_id: 211,
    title: 'Robot Applications',
    subject: 'robotics',
    category: 'Technology',
    module: 'Robotics',
    chapter: 3,
    description: 'Video on real-world robot applications.',
    file_type: 'video',
    file_url: 'https://example.com/video/robotics-applications.mp4',
    created_at: '2025-02-03T08:00:00Z'
  },

  // General Engineering (Category: Engineering)
  {
    lecture_id: 34,
    user_id: 212,
    title: 'Engineering Design Process',
    subject: 'general-engineering',
    category: 'Engineering',
    module: 'General Engineering',
    chapter: 1,
    description: 'Video introducing the engineering design process.',
    file_type: 'video',
    file_url: 'https://example.com/video/engineering-design-process.mp4',
    created_at: '2025-02-04T08:00:00Z'
  },
  {
    lecture_id: 35,
    user_id: 212,
    title: 'Materials Science',
    subject: 'general-engineering',
    category: 'Engineering',
    module: 'General Engineering',
    chapter: 2,
    description: 'Notes on common engineering materials (PDF).',
    file_type: 'notes',
    file_url: 'https://example.com/notes/engineering-materials-science.pdf',
    created_at: '2025-02-05T08:00:00Z'
  },
  {
    lecture_id: 36,
    user_id: 212,
    title: 'Systems Engineering',
    subject: 'general-engineering',
    category: 'Engineering',
    module: 'General Engineering',
    chapter: 3,
    description: 'Video covering systems thinking in engineering.',
    file_type: 'video',
    file_url: 'https://example.com/video/engineering-systems-engineering.mp4',
    created_at: '2025-02-06T08:00:00Z'
  },
]

export default rawData