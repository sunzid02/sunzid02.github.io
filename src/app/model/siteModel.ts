export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export type HeroModel = {
  headline: string;
  subline: string;
  pills: string[];
  cta: {
    email: string;
    links: {
      label: string;
      url: string;
      icon: "linkedin" | "github" | "youtube";
    }[];
  };
  note: string;
};

export type AboutModel = {
  title: string;
  paragraphs: string[];
  focusAreas: string[];
};

export type TechFace = {
  title: string;
  badge: string;
  items: string[];
};

export type TechModel = {
  title: string;
  hint: string;
  faces: TechFace[];
};

export type ExperienceItem = {
  title: string;
  when: string;
  bullets: string[];
};

export type ExperienceModel = {
  title: string;
  items: ExperienceItem[];
};

export type ProjectItem = {
  title: string;
  desc: string;
  meta: string;
  url?: string;
};

export type ProjectsModel = {
  title: string;
  intro: string;
  items: ProjectItem[];
};

export type CreatorVideo = {
  id: string;
  title: string;
  desc: string;
  url: string;
};

export type CreatorModel = {
  title: string;
  intro: string;
  hint: string;
  videos: CreatorVideo[];
};


export type ContactModel = {
  email: string;
  links: {
    label: string;
    url: string;
  }[];
};


export type RecommendationItem = {
  name: string;
  role: string;
  company: string;
  photo?: string;
  text: string;
  linkedin?: string;
};

export type RecommendationsModel = {
  title: string;
  intro: string;
  items: RecommendationItem[];
};


export type TravelFlag = {
  emoji: string;
  name: string;
};

export type TravelPhoto = {
  src: string;
  title: string;
  desc: string;
};

export type TravelModel = {
  title: string;
  intro: string;
  flags: TravelFlag[];
  quote: {
    text: string;
    author: string;
  };
  photos: {
    title: string;
    intro: string;
    hint: string;
    items: TravelPhoto[];
  };
};

export type SiteModel = {
  brand: { name: string; href: string };
  nav: NavItem[];

  hero: HeroModel;
  about: AboutModel;
  tech: TechModel;
  experience: ExperienceModel;
  projects: ProjectsModel;
  creator: CreatorModel;
  travel: TravelModel;
  contact: ContactModel; 
  recommendations: RecommendationsModel;

};

export const siteModel: SiteModel = {
  brand: { name: "Sarker Sunzid Mahmud", href: "#top" },

  nav: [
    { id: "about", label: "About", href: "#about" },
    { id: "stack", label: "Tech", href: "#stack" },
    { id: "experience", label: "Experience", href: "#experience" },
    { id: "projects", label: "Projects", href: "#projects" },
    { id: "creator", label: "Content", href: "#creator" },
    { id: "travel", label: "Travelling", href: "#travel" },
    { id: "recommendations", label: "Recommendations", href: "#recommendations" },
    // { id: "contact", label: "Contact", href: "#contact" },
  ],

  hero: {
    headline: "Full-Stack Developer | MSc Data Science @ TU Dortmund",
    subline:
      "5+ years of building scalable web apps and APIs.",
    pills: [
      // "5+ years • Full-Stack",
      "Laravel • React • Angular • Node.js",
      "Performance • Clean Architecture • GDPR",
      "GenAI • RAG • LangChain • Vector DB",
    ],
    cta: {
      email: "sunzid02@gmail.com",
      links: [
        {
          label: "LinkedIn",
          url: "https://www.linkedin.com/in/sarker-sunzid-mahmud",
          icon: "linkedin",
        },
        {
          label: "GitHub",
          url: "https://github.com/sunzid02",
          icon: "github",
        },
        {
          label: "YouTube",
          url: "https://www.youtube.com/@sarkersunzidmahmud2875",
          icon: "youtube",
        },
      ],
    },

    note: "Open to opportunities • Germany / EU",
  },


  about: {
    title: "About",
    paragraphs: [
      "I am a Full-Stack Developer with over five years of professional experience building and delivering scalable web applications across Europe and Asia. I work across backend and frontend, specializing in API development, performance optimization, and designing reliable systems that are easy to maintain and extend over time. My core focus is writing clean, well-structured code that supports long-term product growth.",
      "Alongside my industry experience, I am pursuing a Master’s degree in Data Science, which allows me to combine strong software engineering practices with machine learning and applied AI. This combination helps me build applications that are not only technically robust, but also enhanced by data, automation, and intelligent decision-making. I am comfortable working at the intersection of web development, data, and AI-driven features.",
      "I value clarity, ownership, and long-term thinking in every project. Before starting any task, I follow a principle I call WWW: What, Why, and Where. I focus on understanding what needs to be built, why it matters from a business and user perspective, and where it fits within the overall system. This approach helps me reduce complexity, make better architectural decisions, and leave codebases cleaner and more stable than before.",
      "Colleagues often describe me as calm, dependable, and easy to collaborate with. I enjoy breaking down complex problems, connecting ideas across systems, and building solutions that remain reliable and useful long after they are deployed.",
    ],
    focusAreas: [
      "Backend API development and clean architecture",
      "Frontend web applications with React and Angular",
      "Performance optimization, reliability, and security fundamentals",
      "DevOps and cloud basics including Docker, Kubernetes, and CI/CD",
    ],
  },


  tech: {
    title: "Tech Stack",
    hint: "Explore my stack as a 3D cube. Drag to rotate, or use the buttons to jump to a side.",
    faces: [
      {
        title: "Backend",
        badge: "APIs • Data • Architecture",
        items: [
          "PHP (Laravel, Symfony)",
          "Node.js (Express)",
          "REST APIs",
          "GraphQL",
          "MySQL",
          "MongoDB",
          "Kafka",
        ],
      },
      {
        title: "Frontend",
        badge: "UI • Web Apps • Experiments",
        items: [
          "HTML",
          "CSS",
          "Tailwind CSS",
          "JavaScript",
          "React",
          "Angular",
          "TypeScript",
          "VWO (A/B Testing)",
          "Optimizely",
          "Google Optimize",
        ],
      },
      {
        title: "AI",
        badge: "RAG • LLM • Automation",
        items: [
          "Python",
          "LLM Applications",
          "RAG Pipelines",
          "LangChain",
          "Vector Databases",
          "Generative AI",
        ],
      },
      {
        title: "DevOps",
        badge: "Deploy • Scale • Ship",
        items: ["Docker", "Kubernetes", "GitHub Actions", "PHPUnit • Jest"],
      },
      {
        title: "Prompting Tools",
        badge: "Research • Ideation • Prompting",
        items: ["ChatGPT", "Gemini", "Grok", "Canva", "Perplexity", "NotebookLM"],
      },
      {
        title: "Content Creation",
        badge: "Video • Audio",
        items: ["CapCut", "ElevenLabs (Audio)"],
      },
    ],
  },

  experience: {
    title: "Experience",
    items: [
      {
        title: "Full Stack Developer (Part-time) | Atflow GmbH, Hamburg, Germany",
        when: "Sep 2025 to Dec 2025",
        bullets: [
          "Developed task and time tracking features with Laravel and React for calendar-based hour allocation and accurate client billing.",
          "Optimized DATEV-based billing workflows using task-time analytics and code reviews, reducing errors by around 20%.",
        ],
      },
      {
        title:
          "Full Stack Developer (Part-time) | Konnektivität & Kommunikation GmbH, Hamm, Germany",
        when: "Aug 2021 to May 2025",
        bullets: [
          "Reduced REST API response times by 30% through caching and endpoint optimization using PHP Slim.",
          "Improved reporting performance by 25% via MySQL schema and index optimization.",
          "Built and maintained Angular-based internal web apps, reducing manual reporting effort by 40% for teams.",
        ],
      },
      {
        title:
          "Internship | Deutsche Gesetzliche Unfallversicherung e.V. (DGUV), Bochum, Germany",
        when: "May 2024 to Aug 2024",
        bullets: [
          "Built and cleaned large-scale sensor datasets using Python (Pandas, NumPy) for occupational health research.",
          "Applied logistic regression and ROC analysis to determine an optimal daylight exposure threshold (600 lux).",
          "Created clear visualizations to communicate findings to researchers and non-technical stakeholders.",
        ],
      },
      {
        title: "Software Engineer | Echologyx, Dhaka, Bangladesh",
        when: "Oct 2020 to May 2021",
        bullets: [
          "Reduced page load times by 15% by optimizing JavaScript and CSS delivery and removing render-blocking resources.",
          "Increased conversion rates by up to 25% through A/B and multivariate testing using Optimizely, VWO, and Google Optimize.",
        ],
      },
      {
        title: "Software Engineer | REPTO Education Center, Dhaka, Bangladesh",
        when: "May 2019 to May 2020",
        bullets: [
          "Designed and scaled backend systems using Laravel, MySQL, and REST APIs for an e-learning platform with 50,000+ users.",
          "Integrated job boards, exam systems, and premium memberships with SSLCommerz payments, increasing engagement by 35%.",
        ],
      },
      {
        title: "Web Developer | Cloudwell Limited (PayWell), Dhaka, Bangladesh",
        when: "Oct 2017 to Mar 2019",
        bullets: [
          "Built secure, high-volume payment processing services in PHP handling thousands of daily transactions.",
          "Automated sales reporting and dashboard generation using cron-based Excel integrations, reducing manual effort by 50%.",
        ],
      },
    ],
  },

  projects: {
    title: "Projects",
    intro: "Selected projects that reflect my day to day stack and the kind of problems I enjoy solving.",
    items: [
      {
        title: "News Aggregator",
        desc: "Laravel 12 + React platform aggregating multi-source news via scheduled ingestion and RESTful APIs.",
        meta: "Laravel • React • DTO architecture • Search and filters",
        url: "https://github.com/sunzid02/news-aggregator",
      },
      {
        title: "Dev Connector",
        desc: "Developer social network built with React, Node.js, and MongoDB with JWT authentication.",
        meta: "React • Node.js • MongoDB • JWT",
        url: "https://github.com/sunzid02/SocialSite",
      },
      {
        title: "Daylight Exposure Analysis (DGUV Internship)",
        desc: "Logistic regression and ROC analysis on sensor data to identify optimal daylight thresholds.",
        meta: "Python • scikit-learn • Data analysis",
      },
      {
        title: "Weather App - React Dashboard",
        desc: "The Weather App provides current weather information for locations in Germany. Built with React and Redux, the app fetches weather data from the Open-Meteo API and uses the OpenCage Geocoding API for location search. It displays detailed weather information such as temperature, wind speed, wind direction, and weather conditions in a user-friendly interface.",
        meta: "React • Redux • Open-Meteo API • OpenCage Geocoding API",
        url: "https://github.com/sunzid02/WeatherApp"
      },
      {
        title: "Chatting App - Vue.js & Firebase",
        desc: "A real-time chatting application built with Vue.js and Firebase, featuring user authentication, chat rooms, and message persistence.",
        meta: "Laravel • Vue.js • Firebase • Real-time communication",
        url: "https://github.com/sunzid02/Broadcasting"
      },
      {
        title: "Movie-Recommendation-System",
        desc: "Recommend the movies based on the user input, Cosine_Similarity of Scikit learn has been used to check the similarity between the movies and recommend the most similar movies.",
        meta: "sklearn • Python • Jupyter Notebook • Data Analysis",
        url: "https://github.com/sunzid02/Movie-Recommendation-System"
      },
      {
        title: "Customer Segmentation",
        desc: "Using K-means algorithm detects the customer clusters based on their purchasing behavior, which helps the business to target specific customer groups with tailored marketing strategies.",
        meta: "KMeans • Python • Jupyter Notebook • Data Analysis",
        url: "https://github.com/sunzid02/-Customer-Segmentation"
      },
    ],
  },

  creator: {
    title: "Content Creator",
    intro:
      "I also create developer focused content like short tutorials, interview prep, and practical engineering notes. When I am not explaining serious tech things, I enjoy making funny and creative memes to show my imagination, keep learning fun, and remind everyone that engineers are allowed to laugh too.",
    hint: "Use the arrows to browse. Press play to load the video.",
    videos: [
      {
        id: "xNwMbXn1rpE",
        title: "This is who I am",
        desc: "If you are a developer, engineer, or someone who loves problem solving, this video is for you.",
        url: "https://youtu.be/xNwMbXn1rpE",
      },
      {
        id: "d2BziZU60us",
        title: "How I Met My Wife",
        desc: "This Christmas, I wanted to give my wife something special. This is my first animated video and I dedicate it to my wife ❤️",
        url: "https://www.youtube.com/watch?v=d2BziZU60us",
      },
      {
        id: "PHp-iQHsOHQ",
        title: "Why do we really need calculus in real life? ",
        desc: "In this video, I explain calculus in a simple and fun way, with no formulas, no fear, just real understanding.",
        url: "https://www.youtube.com/watch?v=PHp-iQHsOHQ",
      },
      {
        id: "NdIGFgBrxfM",
        title: "Async JavaScript Explained: Promises vs Observables vs RxJS (Simple Guide)",
        desc: "In this video, I explain Promises, Observables — especially for developers who struggle with RxJS like I once did.",
        url: "https://www.youtube.com/watch?v=NdIGFgBrxfM",
      },
      {
        id: "-Yxgw5RiCvY",
        title: "Rise of Hadi",
        desc: "No more silence.",
        url: "https://youtu.be/-Yxgw5RiCvY",
      },
      {
        id: "7slH9G95u8U",
        title: "How I started my Career",
        desc: "From nothing to Germany.",
        url: "https://www.youtube.com/watch?v=7slH9G95u8U",
      },
    ],
  },

  travel: {
    title: "Travel & Mindset",
    intro:
      "Traveling has shaped how I think and work. Experiencing different cultures across Europe helped me adapt quickly, communicate clearly, and stay calm while solving complex problems in unfamiliar environments.",
    flags: [
      { emoji: "🇧🇩", name: "Bangladesh" },
      { emoji: "🇩🇪", name: "Germany" },
      { emoji: "🇦🇹", name: "Austria" },
      { emoji: "🇨🇭", name: "Switzerland" },
      { emoji: "🇭🇷", name: "Croatia" },
      { emoji: "🇪🇸", name: "Spain" },
      { emoji: "🇹🇷", name: "Turkey" },
      { emoji: "🇫🇷", name: "France" },
    ],
    quote: {
      text: "A person who never made a mistake never tried anything new.",
      author: "Albert Einstein",
    },
    photos: {
      title: "Travel Photos",
      intro: "A few moments from my travels. Use the arrows to browse.",
      hint: "Use the arrows to browse photos.",
      items: [
        {
          src: "assets/travel/switzerland.jpg",
          title: "Switzerland",
          desc: `Flying above the mountains, nothing under my feet, just air and trust.
                  I remember the mix of fear and excitement, the loud laugh that came out without thinking, and the feeling of being completely alive.

                  \nFor a few minutes, all worries disappeared.
                  No plans, no pressure, just the sky, the wind, and pure joy.

                  It taught me that sometimes you have to let go to truly feel free.`,
        },

       {
          src: "assets/travel/germany.jpg",
          title: "Germany",
          desc: `Standing in the stadium, holding the flag, I felt something deeper than excitement.
                  It was pride mixed with gratitude.

                  Germany gave me more than memories.
                  It gave me a sense of belonging, growth, and a second home built through experiences.

                  In that moment, I was not just watching a game.
                  I was celebrating the journey, the struggles, and how far I have come.`,
        },
        {
          src: "assets/travel/austria.jpg",
          title: "Austria",
          desc: "A small bridge, fresh green hills, and a bicycle paused in between. It looks like a moment where nothing is rushed. You are not trying to reach somewhere fast, I was just enjoying where I was. The mountains stand quietly, the air feels clean, and the ride feels light. It captures freedom in a simple form. No noise, no pressure, just movement, balance, and peace. A reminder that sometimes the best journeys are slow ones.",
        },
        {
          src: "assets/travel/croatia.jpg",
          title: "Croatia",
          desc: `Sitting on the Iron Throne in Dubrovnik felt unreal.
                  For a moment, I was not a traveler or a tourist.

                  I felt like the king of the Seven Kingdoms.
                  Relaxed, confident, and enjoying the power of imagination.

                  It was playful and symbolic.
                  A reminder that sometimes life lets you step into a story and own the moment.`,
        },
        {
          src: "assets/travel/spain.jpg",
          title: "Spain",
          desc: `Standing on the rocks of Montserrat, I felt small in the best way.
                  The mountains were rough, calm, and steady, like they had seen everything.

                  The wind was quiet, the view endless.
                  It felt like a moment of pause, reflection, and strength.

                  Up there, I was not rushing anywhere.
                  I was just present, grounded, and trusting the path ahead.`,
        },
        {
          src: "assets/travel/turkey.jpg",
          title: "Turkey",
          desc: `Standing inside Hagia Sophia in Istanbul felt deeply grounding.
                  The space was vast, quiet, and full of history that could be felt rather than explained.

                  I felt small, humble, and present.
                  Surrounded by centuries of faith, culture, and human devotion.

                  It was a moment of reflection.
                  A reminder of time, belief, and how many lives have passed through the same space before me.`,
        },
        {
          src: "assets/travel/france.jpg",
          title: "France",
          desc: `At the Louvre in Paris, doing my best impression of modern art.
                  I am the one on the left, just in case you are wondering.

                  We tried to hold the pyramid like it was light.
                  Turns out friendship and bad ideas make great memories.

                  Cold night, tired feet, and a lot of laughing.
                  Paris taught me that sometimes the best moments are unplanned and slightly stupid.`,
        },
        {
          src: "assets/travel/bd.jpg",
          title: "Bangladesh",
          desc: `Cox’s Bazar at sunset, standing by the sea with the person I love.
                  The sky was calm, the waves were slow, and everything felt quiet inside.

                  We did not talk much.
                  Holding hands was enough.

                  This moment was about love, trust, and shared silence.
                  A reminder that the most meaningful journeys are the ones you do not take alone.`,
        }

      ],
    },


    
  },

  recommendations: {
    title: "Recommendations",
    intro: "Kind words from colleagues and clients I've worked with over the years.",
    items: [
      {
        name: "Niklas",
        role: "Geschäftsführer",
        company: "Atflow GmbH",
        photo: "assets/recommendations/niklas.jpg",
        text: "I worked with Sarker Sunzid Mahmud during his time as a working student in our team, where he consistently delivered high-quality results. He independently designed and implemented complex features in React Native and PHP, taking full ownership from concept to delivery. Sarker learns fast, makes solid technical decisions and executes reliably. He works with focus and clarity, addresses challenges directly and raises the quality of the work around him. His contributions had a noticeable impact on our product development. He's driven and very capable. I appreciated working with him and am confident he'll continue to build an impressive career.",
      },
      {
        name: "Tanvir Mahmud Rabbi",
        role: "Software Engineer",
        company: "Zalando",
        photo: "assets/recommendations/tanvir.jpg",
        text: "Sunzid is a very talented developer. He understands complex matters and grabs business logic, very quickly. He is always eager to learn and is a strong, goal oriented team player. I had the opportunity to work with him and supervise him directly. I was very impressed by his enthusiasm and will to always give his 100%. I wish him best of luck for all his future ventures.",
      },
      {
        name: "Abir Hossain",
        role: "Junior Data Scientist",
        company: "E.ON Digital Technology",
        photo: "assets/recommendations/abir.jpg",
        text: "I had the privilege of studying alongside Sunzid during our Master's in Data Science, and throughout that time, I witnessed his exceptional dedication, resilience, and sharp intellect. What sets Sunzid apart is his unwavering commitment to delivering quality work. Perhaps what I value most is how clearly I see my own reflection in his persistence—he loves to approach problems with a solution-oriented attitude and never quits until he is genuinely satisfied with the outcome. Beyond his innate talent, I was inspired by his personal investment in growth through microlearning and continuous self-improvement. Working and learning alongside him was not only motivating but also personally enriching — I consider myself fortunate to have had that experience.",
      },
      {
        name: "Sara Foresti",
        role: "Developer",
        company: "Modern Citizens (UK)",
        photo: "assets/recommendations/sara.jpg",
        text: "Sunzid is a brilliant programmer. I've had the pleasure of knowing him for about a year, as he worked as a freelance developer for Daydot, helping us build A/B tests in busy periods. Above all, I was impressed with Sunzid's ability to quickly pick up feedback and improve day by day, adapting his code style to the company's standards. And, of course, his energy and enthusiasm. He would really be a great addition to any dev team and it's without hesitation that I recommend Sunzid.",
      },
      {
        name: "Trevor Cookler",
        role: "Sr. Product Manager, Core Experience / Retention",
        company: "hims & hers",
        photo: "assets/recommendations/trevor.jpg",
        text: "Sunzid is a wonderful developer. He supported us with one of our larger clients (The Wall Street Journal and Barrons.com) in a wide range of A/B tests across acquisition channels (shop/checkout), the onboarding experience and several complex product engagement-related tests. He was able to quickly understand the test hypotheses, business goals and technical specifications and turn around an extremely high performing test. Beyond his technical ability, Sunzid was a pleasure to work with, was always energetic, curious and happy to assist at a moment's notice. I know Sunzid would be an incredible asset to any team.",
      },
    ],
  },

  contact: {
    email: "sunzid02@gmail.com",
    links: [
      { label: "GitHub", url: "https://github.com/sunzid02" },
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/sarker-sunzid-mahmud",
      },
    ],
  },


};
