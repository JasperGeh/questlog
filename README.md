# TodoQuest

TodoQuest is a dark fantasy themed todo list application that transforms your mundane tasks into mysterious, ominous quests in the style of Dark Souls, with cryptic language, quest steps, and rewards.

> ⚠️ **AI-Generated Project Warning**: This project is "vibecoded" - meaning all portions (including this box) were generated using AI assistance. While efforts have been made to ensure quality and functionality, it comes with the inherent risks and limitations of AI-generated code. The code may contain unexpected behaviors, security vulnerabilities, or implementation gaps. Use at your own discretion and thoroughly test before using in any critical systems.

## Features

- 🏰 **Dark Fantasy Theme**: Every task becomes a mysterious quest with cryptic, ominous language inspired by Dark Souls
- 📜 **Quest Categories**: Organize your tasks as Daily, Main, or Optional quests
- ✓ **Quest Steps**: Break down your main tasks into steps, each transformed into a dark ritual or arcane procedure
- 🏆 **Rewards**: Each quest shows what you'll gain in real life, described in mysterious, foreboding terms
- 📱 **API Integration**: Add quests via iOS Shortcuts using the built-in API
- 💾 **Local Storage**: Your quests are saved locally in your browser

## Getting Started

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

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## How It Works

TodoQuest transforms simple tasks into dark fantasy quests:

**Original task**: "Renew Latvian Passport"  
**Transformed quest**: "The Covenant of Latvian Passport"

With a description like:
> "In the forgotten kingdom, where light falters and shadows reign. The seals upon your identity scroll have faded, rendering your presence in the realm tenuous. The gatekeepers demand renewal of your covenant. Without the enchanted identification, you risk becoming a phantom in the lands of your dwelling, invisible to officials yet vulnerable to their decrees."

And subtasks like:
- "Pay printing fee" → "The ritual demands you offer the required tribute of currency to appease the gatekeepers."
- "Submit photos" → "You must first capture your visage in the soul-binding ritual of image-taking."

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

The app includes a placeholder service for transforming tasks into dark fantasy quests using predefined patterns. For a more advanced experience, you can integrate with OpenAI's API or another LLM service:

1. Get an API key from OpenAI or other LLM provider
2. Uncomment and configure the actual API call in `src/app/services/epicTransformer.ts`
3. Install required packages (`npm install openai`)
4. Add your API key to environment variables

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

// ... existing code ...

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Created using Next.js and React
- Styled with Tailwind CSS
- Fonts: Cinzel and EB Garamond for that dark fantasy feel
