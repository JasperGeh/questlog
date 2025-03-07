# Questlog

Questlog is a dark fantasy themed todo list application that transforms your mundane tasks into mysterious, ominous quests in the style of Dark Souls, with cryptic language, quest steps, and rewards. Inspired by a tweet I'll eventually look for and add here.

> ⚠️ **AI-Generated Project Warning**: This project is "vibecoded" - meaning all portions (including this box) were generated using AI assistance. While efforts have been made to ensure quality and functionality, it comes with the inherent risks and limitations of AI-generated code. The code may contain unexpected behaviors, security vulnerabilities, or implementation gaps. Use at your own discretion and thoroughly test before using in any critical systems.

## Features

- **Dark Fantasy Theme**: Every task becomes a mysterious quest with cryptic, ominous language inspired by Dark Souls
- **Quest Categories**: Organize your tasks as Daily, Main, or Optional quests
- **Quest Steps**: Break down your main tasks into steps, each transformed into a dark ritual or arcane procedure
- **Rewards**: Each quest shows what you'll gain in real life, described in mysterious, foreboding terms
- **API Integration**: Add quests via iOS Shortcuts using the built-in API
- **Local Storage**: Your quests are saved locally in your browser
- **AI-Powered Transformations**: Uses Anthropic's Claude 3.5 Haiku to transform ordinary tasks into epic quests

## Tech Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS 4
- **AI Integration**: Anthropic Claude 3.5 Haiku for quest transformations
- **Development**: TypeScript with ESLint
- **Bundling**: TurboPack for fast development builds

## Project Structure

```
src/
├── app/                 # Next.js App Router structure
│   ├── api/             # API routes for quest creation and transformations
│   │   ├── quest/       # API endpoint for quest CRUD operations
│   │   └── transform/   # API endpoints to transform tasks using Claude AI
│   ├── components/      # React components
│   │   ├── QuestForm.tsx    # Form to create new quests
│   │   ├── QuestItem.tsx    # Individual quest display component
│   │   └── QuestLog.tsx     # Component displaying all quests
│   ├── services/        # Client-side services
│   │   ├── epicTransformer.ts  # Handles transformation of tasks to quests
│   │   └── questStorage.ts     # Local storage management
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Utility functions
│   ├── page.tsx         # Main page component
│   └── globals.css      # Global styles
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/todo-quest.git
cd todo-quest
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   Create a `.env` file in the root directory with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## How It Works

TodoQuest transforms simple tasks into dark fantasy quests:

**Original task**: "Prepare for job interview"  
**Transformed quest**: "The Trial of the Corporate Covenant"

With a description like:
> "Heed these words, ashen one. The Elder Council of Industry beckons, their judgment awaits. Their arcane assessment shall determine if you are worthy to join their shadowed ranks. The ritual of interrogation approaches—a trial where many have faltered, their spirits broken upon the altar of rejection. Prepare thy mind and visage for this grim ceremony, lest you be cast back into the abyss of unemployment, where forgotten souls wander without purpose or coin."

And subtasks like:
- "Research the company" → "Delve into the forbidden archives to uncover the dark history and eldritch secrets of the corporate entity."
- "Practice interview questions" → "Commune with the echoes of past supplicants, rehearsing the ancient liturgy of queries that the Council shall surely demand."
- "Iron clothes for interview" → "Perform the ritual of garment purification, banishing wrinkles to the nether realm, ensuring your corporeal vessel appears worthy of the Council's gaze."

## API Integration with iOS Shortcuts

TodoQuest provides an API endpoint that you can use with iOS Shortcuts to add new quests directly from your iPhone or iPad.

### Endpoint: `/api/quest`

**Method**: POST

**Request Body**:
```json
{
  "title": "Your task title",
  "category": "daily", // "main" or "optional"
  "reward": "What you get from completing this",
  "dueDate": "2023-12-31", // Optional ISO date string
  "subTasks": ["Subtask 1", "Subtask 2"] // Optional array of subtasks
}
```

**Example iOS Shortcut Setup**:
1. Create a new Shortcut in the Shortcuts app
2. Add a "Text" action with your task name
3. Add a "URL" action with your site URL + "/api/quest"
4. Add a "Get Contents of URL" action:
   - Method: POST
   - Request Body: JSON
   - Key: title, Value: Shortcut Input
   - Add any additional fields as needed
5. Optional: Add a "Show Result" action to see the response

## Customization

### Changing Theme Colors

Edit the CSS variables in `src/app/globals.css` to change the color scheme:

```css
:root {
  --primary: 35, 50%, 50%;
  --secondary: 200, 25%, 35%;
  --accent: 340, 50%, 40%;
  /* other variables */
}
```

### LLM Integration

The app includes integration with Anthropic's Claude 3.5 Haiku for transforming tasks into dark fantasy quests. You can modify the prompts in the following files:

- `src/app/api/transform/route.ts` - Main quest transformation
- `src/app/api/transform/subtask/route.ts` - Subtask transformation
- `src/app/api/transform/batch/route.ts` - Batch subtask transformation

## Environment Setup

This application uses Anthropic's Claude 3.5 Haiku model for transforming todo items into epic quests. You need to set up your environment variables:

1. Create or edit the `.env` file in the root directory
2. Add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```
3. Restart the development server if it's already running

You can get an API key from [Anthropic's Console](https://console.anthropic.com/).

## Development

### Building for Production

To build the app for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

### Linting

To run ESLint:

```bash
npm run lint
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Created using Next.js and React
- Styled with Tailwind CSS
- Fonts: Cinzel and EB Garamond for that dark fantasy feel
- AI transformations powered by Anthropic's Claude 3.5 Haiku
