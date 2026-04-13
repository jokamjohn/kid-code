import type { Subject } from '@/types/curriculum'

export const CURRICULUM: Subject[] = [
  {
    id: 'computing',
    title: 'Computing Basics',
    description: 'Discover how computers work — from bits to logic gates!',
    icon: '💻',
    color: 'text-kc-yellow-700',
    bgColor: 'bg-kc-yellow-50',
    topics: [
      {
        id: 'what-is-a-computer',
        subjectId: 'computing',
        title: 'What is a Computer?',
        description: 'Learn what computers are and how they follow instructions.',
        duration: '10 min',
        difficulty: 1,
        sections: [
          { type: 'text', content: '## What is a Computer?\n\nA computer is a machine that follows instructions. Just like you follow a recipe to bake cookies, a computer follows a recipe called a **program**.' },
          { type: 'visual', content: 'computer-diagram' },
          { type: 'text', content: '### Parts of a Computer\n\n- **CPU** (Brain) — does the thinking\n- **RAM** (Short memory) — remembers what it\'s working on right now\n- **Storage** (Long memory) — saves things even when turned off\n- **Input** — keyboard, mouse, microphone\n- **Output** — screen, speakers, printer' },
          { type: 'try-it', content: 'Can you name 3 input devices and 2 output devices you use every day?' },
        ],
      },
      {
        id: 'binary-numbers',
        subjectId: 'computing',
        title: 'Binary Numbers',
        description: 'Computers only understand 0s and 1s — let\'s learn why!',
        duration: '15 min',
        difficulty: 2,
        sections: [
          { type: 'text', content: '## Binary Numbers\n\nComputers speak in a language of **0s and 1s** called **binary**. Every letter, number, and image is stored as a sequence of 0s and 1s.' },
          { type: 'text', content: '### Counting in Binary\n\n| Decimal | Binary |\n|---------|--------|\n| 0 | 0 |\n| 1 | 1 |\n| 2 | 10 |\n| 3 | 11 |\n| 4 | 100 |\n| 8 | 1000 |' },
          { type: 'try-it', content: 'What is the number 5 in binary? Hint: 4 is 100 and 1 is 1...' },
        ],
      },
      {
        id: 'input-output',
        subjectId: 'computing',
        title: 'Input & Output',
        description: 'How information flows into and out of a computer.',
        duration: '10 min',
        difficulty: 1,
        sections: [
          { type: 'text', content: '## Input & Output\n\n**Input** is information going INTO the computer.\n**Output** is information coming OUT of the computer.' },
          { type: 'visual', content: 'input-output-diagram' },
        ],
      },
      {
        id: 'algorithms',
        subjectId: 'computing',
        title: 'Algorithms',
        description: 'Step-by-step instructions that solve problems.',
        duration: '12 min',
        difficulty: 2,
        sections: [
          { type: 'text', content: '## Algorithms\n\nAn **algorithm** is a step-by-step set of instructions to solve a problem. Every program you\'ve ever used was built from algorithms!' },
          { type: 'try-it', content: 'Write an algorithm (step-by-step instructions) for making a peanut butter sandwich.' },
        ],
      },
    ],
  },
  {
    id: 'html',
    title: 'HTML',
    description: 'Build the skeleton of every webpage with HTML tags.',
    icon: '🏷️',
    color: 'text-kc-coral-700',
    bgColor: 'bg-kc-coral-50',
    topics: [
      {
        id: 'intro-to-html',
        subjectId: 'html',
        title: 'Intro to HTML',
        description: 'What is HTML and how does it build web pages?',
        duration: '10 min',
        difficulty: 1,
        sections: [
          { type: 'text', content: '## What is HTML?\n\n**HTML** stands for **HyperText Markup Language**. It\'s the language used to create every web page on the internet!' },
          { type: 'code', language: 'html', content: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n    <p>This is my first web page!</p>\n  </body>\n</html>' },
          { type: 'try-it', content: 'Try it in the Playground — change "Hello, World!" to your name!' },
        ],
      },
      {
        id: 'html-tags',
        subjectId: 'html',
        title: 'HTML Tags',
        description: 'Learn the most important HTML tags.',
        duration: '15 min',
        difficulty: 1,
        sections: [
          { type: 'text', content: '## HTML Tags\n\nTags are like containers for content. They come in pairs — an opening tag and a closing tag.\n\n```html\n<tagname>content goes here</tagname>\n```' },
          { type: 'code', language: 'html', content: '<h1>Big Heading</h1>\n<h2>Smaller Heading</h2>\n<p>A paragraph of text.</p>\n<strong>Bold text</strong>\n<em>Italic text</em>\n<br> <!-- line break, no closing tag! -->' },
        ],
      },
      {
        id: 'html-links-images',
        subjectId: 'html',
        title: 'Links & Images',
        description: 'Make clickable links and add images to your pages.',
        duration: '12 min',
        difficulty: 1,
        sections: [
          { type: 'text', content: '## Links\n\nUse the `<a>` tag to create links:\n\n```html\n<a href="https://example.com">Click me!</a>\n```\n\n## Images\n\nUse the `<img>` tag to show images:\n\n```html\n<img src="cat.jpg" alt="A cute cat">\n```' },
        ],
      },
      {
        id: 'html-forms',
        subjectId: 'html',
        title: 'HTML Forms',
        description: 'Collect information from users with forms.',
        duration: '15 min',
        difficulty: 2,
        sections: [
          { type: 'text', content: '## Forms\n\nForms let users type information and submit it.\n\n```html\n<form>\n  <label>Name: <input type="text"></label>\n  <button type="submit">Send!</button>\n</form>\n```' },
        ],
      },
    ],
  },
  {
    id: 'css',
    title: 'CSS',
    description: 'Add colors, layouts, and animations to make pages beautiful.',
    icon: '🎨',
    color: 'text-kc-blue-700',
    bgColor: 'bg-kc-blue-50',
    topics: [
      {
        id: 'intro-to-css',
        subjectId: 'css',
        title: 'Intro to CSS',
        description: 'What is CSS and how do you use it?',
        duration: '10 min',
        difficulty: 1,
        sections: [
          { type: 'text', content: '## What is CSS?\n\n**CSS** stands for **Cascading Style Sheets**. It controls how HTML elements look — colors, sizes, fonts, and layouts!' },
          { type: 'code', language: 'css', content: '/* This makes all h1 elements red */\nh1 {\n  color: red;\n  font-size: 32px;\n  text-align: center;\n}' },
        ],
      },
      {
        id: 'colors-backgrounds',
        subjectId: 'css',
        title: 'Colors & Backgrounds',
        description: 'Add beautiful colors and backgrounds to your pages.',
        duration: '12 min',
        difficulty: 1,
        sections: [
          { type: 'text', content: '## Colors in CSS\n\nYou can use color names, hex codes, or RGB values:\n\n```css\ncolor: red;           /* color name */\ncolor: #ff0000;       /* hex code */\ncolor: rgb(255,0,0);  /* RGB */\n```' },
        ],
      },
      {
        id: 'flexbox',
        subjectId: 'css',
        title: 'Flexbox Layout',
        description: 'Arrange items in rows and columns with Flexbox.',
        duration: '20 min',
        difficulty: 2,
        sections: [
          { type: 'text', content: '## Flexbox\n\nFlexbox makes it easy to arrange items in a row or column.\n\n```css\n.container {\n  display: flex;\n  gap: 10px;\n  justify-content: center;\n}\n```' },
        ],
      },
      {
        id: 'css-animations',
        subjectId: 'css',
        title: 'CSS Animations',
        description: 'Make things move with CSS animations!',
        duration: '15 min',
        difficulty: 3,
        sections: [
          { type: 'text', content: '## CSS Animations\n\nMake elements move, fade, and transform!\n\n```css\n@keyframes bounce {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }\n}\n\n.ball {\n  animation: bounce 1s infinite;\n}\n```' },
        ],
      },
    ],
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Bring your pages to life with interactivity and logic.',
    icon: '⚡',
    color: 'text-kc-green-700',
    bgColor: 'bg-kc-green-50',
    topics: [
      {
        id: 'variables',
        subjectId: 'javascript',
        title: 'Variables',
        description: 'Store information in boxes called variables.',
        duration: '12 min',
        difficulty: 1,
        sections: [
          { type: 'text', content: '## Variables\n\nA variable is like a labeled box that stores information.\n\n```javascript\nlet name = "Alex"\nlet age = 10\nlet isCool = true\n\nconsole.log("Hello, " + name)\n```' },
        ],
      },
      {
        id: 'loops',
        subjectId: 'javascript',
        title: 'Loops',
        description: 'Repeat actions without typing them over and over.',
        duration: '15 min',
        difficulty: 2,
        sections: [
          { type: 'text', content: '## Loops\n\nLoops repeat code multiple times.\n\n```javascript\nfor (let i = 1; i <= 5; i++) {\n  console.log("Count: " + i)\n}\n// Output: Count: 1, Count: 2 ... Count: 5\n```' },
        ],
      },
      {
        id: 'functions',
        subjectId: 'javascript',
        title: 'Functions',
        description: 'Package code into reusable blocks called functions.',
        duration: '15 min',
        difficulty: 2,
        sections: [
          { type: 'text', content: '## Functions\n\nFunctions are reusable blocks of code.\n\n```javascript\nfunction greet(name) {\n  return "Hello, " + name + "!"\n}\n\nconsole.log(greet("Sam"))  // Hello, Sam!\n```' },
        ],
      },
      {
        id: 'dom-manipulation',
        subjectId: 'javascript',
        title: 'DOM Manipulation',
        description: 'Change HTML elements with JavaScript.',
        duration: '20 min',
        difficulty: 3,
        sections: [
          { type: 'text', content: '## DOM Manipulation\n\nJavaScript can change your HTML!\n\n```javascript\n// Select an element\nconst heading = document.getElementById("title")\n\n// Change its text\nheading.textContent = "New Title!"\n\n// Change its style\nheading.style.color = "purple"\n```' },
        ],
      },
    ],
  },
]

export function getSubject(id: string): Subject | undefined {
  return CURRICULUM.find(s => s.id === id)
}

export function getTopic(subjectId: string, topicId: string) {
  return getSubject(subjectId)?.topics.find(t => t.id === topicId)
}
