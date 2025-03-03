// This is a placeholder for the actual LLM integration
// In a real implementation, you would connect to OpenAI's API or another LLM service

export interface TransformRequest {
  title: string;
  reward?: string;
}

export interface TransformResponse {
  epicTitle: string;
  epicDescription: string;
  epicReward: string;
  subtaskTransformer: (subtask: string) => string;
}

const DARK_FANTASY_PREFIXES = [
  "The Trial of",
  "The Burden of",
  "The Ritual of",
  "The Covenant of",
  "The Legacy of",
  "The Pact of",
  "The Binding of",
  "The Shadow of",
  "The Omen of",
  "The Curse of",
];

const DARK_FANTASY_PHRASES = [
  "In the forgotten kingdom, where light falters and shadows reign",
  "Amidst the whispers of ancient beings that linger beyond mortal comprehension",
  "The prophecy foretold of this moment, etched in stones that bleed under moonlight",
  "The old texts speak of a burden that must be carried, a duty that cannot be forsaken",
  "Through the veil between worlds, the echoes of necessity call forth",
  "When the stars align and the old powers awaken, thy path becomes clear",
  "The cycle continues, unbroken since time immemorial, demanding your tribute",
  "In lands where names have power and identities are bound by arcane law",
  "The keepers of order have decreed it so, their will absolute and unyielding",
  "The fading of enchantments requires renewal, lest you fade with them into the void",
];

const REWARD_PHRASES = [
  "Should you prevail against these trials, the covenant shall be renewed",
  "The burden carried shall grant you passage through forbidden realms",
  "Completion brings not joy, but merely the absence of greater suffering",
  "The cycle continues, and with it, your place in this dark world is assured",
  "The keepers shall acknowledge your existence for a time, until the next fading",
  "The sigil of passage shall be yours, its protection as fragile as mortality itself",
  "The realm acknowledges your tribute, granting you its cold mercy",
  "The authorities shall turn their gaze from you, a blessing in these shadowed times",
  "Your name remains in the great ledger, sparing you from the fate of the forgotten",
  "The old powers grant you recognition, permitting your continued existence in their domain",
];

const SUBTASK_PREFIXES = [
  "You must first",
  "The ritual demands you",
  "The covenant requires you to",
  "The ancient law commands you to",
  "The path forward requires you to",
  "To proceed, you must",
  "The burden requires you to",
  "As foretold, you shall",
  "The gatekeepers demand you",
  "The scrolls decree you must",
];

// Mock LLM for local development
// In production, replace with actual API call to an LLM service
export const transformToEpicQuest = async (
  request: TransformRequest
): Promise<TransformResponse> => {
  // For now, we'll use an algorithm to make things sound more dark and mysterious
  // In production, replace with an actual LLM API call
  
  const randomDarkPhrase = DARK_FANTASY_PHRASES[Math.floor(Math.random() * DARK_FANTASY_PHRASES.length)];
  const randomPrefix = DARK_FANTASY_PREFIXES[Math.floor(Math.random() * DARK_FANTASY_PREFIXES.length)];
  const rewardPhrase = REWARD_PHRASES[Math.floor(Math.random() * REWARD_PHRASES.length)];
  
  // Create a dark, mysterious title
  const originalWords = request.title.split(' ');
  let titleBase = originalWords[originalWords.length - 1]; // Get the last significant word
  if (originalWords.length > 1) {
    // If there are multiple words, try to extract meaningful part
    if (originalWords.length > 2) {
      titleBase = originalWords.slice(1).join(' ');
    }
  }
  
  // Capitalize first letter of each word for the title
  const capitalized = titleBase.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  const epicTitle = `${randomPrefix} ${capitalized}`;
  
  // Create an epic description based on the title
  // This is where we should use a real LLM in production
  let epicDescription = "";
  
  // Detect common task types and customize description
  if (request.title.toLowerCase().includes("passport") || request.title.toLowerCase().includes("id") || request.title.toLowerCase().includes("license")) {
    epicDescription = `${randomDarkPhrase}. The seals upon your identity scroll have faded, rendering your presence in the realm tenuous. The gatekeepers demand renewal of your covenant. Without the enchanted identification, you risk becoming a phantom in the lands of your dwelling, invisible to officials yet vulnerable to their decrees.`;
  } 
  else if (request.title.toLowerCase().includes("pay") || request.title.toLowerCase().includes("bill")) {
    epicDescription = `${randomDarkPhrase}. The collectors of tribute await your offering. To neglect this duty is to invite the wrath of unseen forces that govern the flow of prosperity. The debt accrues like a shadow, growing longer as the light of opportunity wanes.`;
  }
  else if (request.title.toLowerCase().includes("buy") || request.title.toLowerCase().includes("purchase") || request.title.toLowerCase().includes("get")) {
    epicDescription = `${randomDarkPhrase}. You must venture forth to acquire that which is foretold. The merchants guard their treasures with watchful eyes, demanding fair exchange of the realm's currency. Without this acquisition, your journey shall remain incomplete, your purpose unfulfilled.`;
  }
  else if (request.title.toLowerCase().includes("clean") || request.title.toLowerCase().includes("wash") || request.title.toLowerCase().includes("tidy")) {
    epicDescription = `${randomDarkPhrase}. The corruption of chaos has spread through your domain, a creeping disorder that weakens the boundaries between realms. You must perform the ritual of purification, banishing the accumulated residue of existence back to the void from whence it came.`;
  }
  else if (request.title.toLowerCase().includes("write") || request.title.toLowerCase().includes("email") || request.title.toLowerCase().includes("message")) {
    epicDescription = `${randomDarkPhrase}. Words hold power in the unseen world, and you must craft them with intent. The missive you send shall traverse the ethereal networks, carrying your will to distant minds. Choose your incantations wisely, for they cannot be recalled once released into the void.`;
  }
  else {
    // Generic dark description
    epicDescription = `${randomDarkPhrase}. The task of ${request.title.toLowerCase()} lies before you, inescapable as the coming darkness. Neither time nor fate shall relieve you of this burden. The ancients have decreed it, and so it must be done, lest the delicate balance between order and chaos be disturbed.`;
  }
  
  // Create a dark, mysterious reward description
  const reward = request.reward || "the continuation of your mortal existence";
  const epicReward = `${rewardPhrase}. ${reward.charAt(0).toUpperCase() + reward.slice(1).toLowerCase()} shall be your only solace in these dark times.`;
  
  // Create a function to transform subtasks
  const subtaskTransformer = (subtask: string): string => {
    const prefix = SUBTASK_PREFIXES[Math.floor(Math.random() * SUBTASK_PREFIXES.length)];
    
    // Custom transformations for common subtasks
    if (subtask.toLowerCase().includes("pay") || subtask.toLowerCase().includes("fee")) {
      return `${prefix} offer the required tribute of currency to appease the gatekeepers.`;
    }
    else if (subtask.toLowerCase().includes("form") || subtask.toLowerCase().includes("fill")) {
      return `${prefix} inscribe the arcane symbols upon the scrolls of verification.`;
    }
    else if (subtask.toLowerCase().includes("call") || subtask.toLowerCase().includes("phone")) {
      return `${prefix} commune with the distant keepers through the speaking stone.`;
    }
    else if (subtask.toLowerCase().includes("photo") || subtask.toLowerCase().includes("picture")) {
      return `${prefix} capture your visage in the soul-binding ritual of image-taking.`;
    }
    else if (subtask.toLowerCase().includes("send") || subtask.toLowerCase().includes("submit")) {
      return `${prefix} dispatch your offering through the void to reach the unseeing judges.`;
    }
    else {
      // Generic transformation
      return `${prefix} ${subtask.toLowerCase()}, as the ancient ritual demands.`;
    }
  };
  
  return {
    epicTitle,
    epicDescription,
    epicReward,
    subtaskTransformer
  };
};

// Example of production implementation with OpenAI:
/*
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const transformToEpicQuest = async (
  request: TransformRequest
): Promise<TransformResponse> => {
  const prompt = `
    Transform this mundane task into a dark, mysterious quest description in the style of Dark Souls.
    Make it ominous, cryptic, and atmospheric.
    
    Task: ${request.title}
    Real-life Reward: ${request.reward || ''}
    
    Please respond with a JSON object containing:
    - epicTitle: A dark fantasy title for the quest
    - epicDescription: A mysterious, ominous description in Dark Souls style
    - epicReward: A cryptic description of the reward
    - subtaskTransformer: A function to transform subtasks (represented as a description of how to transform them)
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { 
        role: "system", 
        content: "You are a master of dark fantasy language who transforms ordinary tasks into mysterious, cryptic quests in the style of Dark Souls." 
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  try {
    const result = JSON.parse(response.choices[0].message.content);
    
    // Create a subtask transformer function based on the LLM's description
    const subtaskTransformer = (subtask: string): string => {
      // Make a follow-up call for each subtask
      // This is simplified - in production you might want to batch these
      const subtaskPrompt = `
        Transform this subtask into a dark, mysterious step in the style of Dark Souls:
        "${subtask}"
        
        Main Quest: ${request.title}
      `;
      
      // For demo purposes, just use a simple transformation
      return `The covenant requires you to ${subtask.toLowerCase()}, lest darkness consume all.`;
    };
    
    return {
      epicTitle: result.epicTitle,
      epicDescription: result.epicDescription,
      epicReward: result.epicReward,
      subtaskTransformer: subtaskTransformer
    };
  } catch (error) {
    console.error('Failed to parse LLM response', error);
    return {
      epicTitle: request.title,
      epicDescription: `The task of ${request.title.toLowerCase()} awaits, inevitable as the fading of light.`,
      epicReward: request.reward || "Completion of the dark ritual",
      subtaskTransformer: (subtask: string) => `You must ${subtask.toLowerCase()}, as it was foretold.`
    };
  }
};
*/ 