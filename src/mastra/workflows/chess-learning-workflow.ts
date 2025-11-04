import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { getChessFactsTool, getFamousMovesTool } from '../tools/chess-tools';

// ===== Schemas =====
const famousGameSchema = z.object({
  game: z.string(),
  players: z.string(),
  move: z.string(),
  description: z.string(),
});


const learningContentSchema = z.object({
  famousGames: z.array(famousGameSchema),
  facts: z.array(z.string()),
  educationalSummary: z.string(),
  factCount: z.number(),
});

// ===== Step 1: Fetch Famous Games =====
const fetchFamousGames = createStep({
  id: 'fetch-famous-games',
  description: 'Retrieves famous chess games from the database',
  inputSchema: z.object({
    count: z.number().optional().describe('Number of games to fetch (1-5)'),
  }),
  outputSchema: z.object({
    famousGames: z.array(famousGameSchema),
    count: z.number(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const count = Math.min(inputData?.count || 2, 5);

    try {
      // Directly call the famous moves tool for reliability
      const result = await getFamousMovesTool.execute({
        context: { count },
        runtimeContext: runtimeContext || {} as any,
      });

      return {
        famousGames: result.famousGames,
        count,
      };
    } catch (error) {
      console.warn('Failed to fetch famous games, using fallback:', error);
      
      // Fallback: return default famous games
      return {
        famousGames: [
          {
            game: "The Immortal Game (1851)",
            players: "Adolf Anderssen vs. Lionel Kieseritzky",
            move: "23. Bxe7 (Bishop takes e7)",
            description: "Anderssen sacrificed his queen and both rooks to deliver checkmate.",
          },
        ],
        count,
      };
    }
  },
});

// ===== Step 2: Fetch Chess Facts =====
const fetchChessFacts = createStep({
  id: 'fetch-chess-facts',
  description: 'Retrieves interesting chess facts',
  inputSchema: z.object({
    famousGames: z.array(famousGameSchema),
    count: z.number(),
  }),
  outputSchema: z.object({
    famousGames: z.array(famousGameSchema),
    facts: z.array(z.string()),
    factCount: z.number(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    if (!inputData?.famousGames) {
      throw new Error('Famous games data is required');
    }

    // Calculate fact count based on games count (1-2 facts per game, min 3)
    const factCount = Math.max(3, Math.min(inputData.famousGames.length + 1, 5));

    try {
      // Directly call the chess facts tool for reliability
      const result = await getChessFactsTool.execute({
        context: { count: factCount },
        runtimeContext: runtimeContext || {} as any,
      });

      return {
        famousGames: inputData.famousGames,
        facts: result.facts,
        factCount,
      };
    } catch (error) {
      console.warn('Failed to fetch chess facts, using fallback:', error);
      
      // Fallback facts
      const fallbackFacts = [
        'Chess is one of the oldest games in the world.',
        'There are more possible chess games than atoms in the universe.',
        'The word "checkmate" comes from Persian meaning "the king is dead".',
      ];

      return {
        famousGames: inputData.famousGames,
        facts: fallbackFacts,
        factCount: fallbackFacts.length,
      };
    }
  },
});

// ===== Step 3: Generate Educational Summary =====
const generateEducationalSummary = createStep({
  id: 'generate-educational-summary',
  description: 'Creates a comprehensive educational summary combining games and facts',
  inputSchema: z.object({
    famousGames: z.array(famousGameSchema),
    facts: z.array(z.string()),
    factCount: z.number(),
  }),
  outputSchema: learningContentSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData?.famousGames || !inputData?.facts) {
      throw new Error('Complete learning data (games and facts) is required');
    }

    const { famousGames, facts } = inputData;

    const agent = mastra?.getAgent('chessAgent');
    if (!agent) {
      throw new Error('Chess agent not found');
    }

    const prompt = `Create an educational summary combining these chess elements:

📚 FAMOUS GAMES:
${famousGames.map((game, i) => `${i + 1}. ${game.game} - ${game.players}
   Iconic Move: ${game.move}
   ${game.description}`).join('\n\n')}

💡 CHESS FACTS:
${facts.map((fact, i) => `${i + 1}. ${fact}`).join('\n')}

Please create a comprehensive educational summary that:
1. Introduces the significance of studying famous games
2. Explains what makes each game special
3. Connects the facts to broader chess knowledge
4. Provides key takeaways for chess improvement

Structure your response as:

🎓 CHESS LEARNING JOURNEY
═══════════════════════════

📖 INTRODUCTION
[Brief introduction to chess mastery through famous games]

🏆 LEGENDARY GAMES BREAKDOWN
[Analyze each famous game, explaining tactical and strategic lessons]

💎 FASCINATING CHESS FACTS
[Elaborate on the facts and their significance]

🎯 KEY TAKEAWAYS
• [Lesson 1]
• [Lesson 2]
• [Lesson 3]

📈 NEXT STEPS
[Suggestions for further study and improvement]

Keep the summary engaging, educational, and actionable.`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let summaryText = '';
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      summaryText += chunk;
    }

    return {
      famousGames,
      facts,
      educationalSummary: summaryText,
      factCount: facts.length,
    };
  },
});

// ===== Chess Learning Workflow =====
const chessLearningWorkflow = createWorkflow({
  id: 'chess-learning-workflow',
  inputSchema: z.object({
    count: z.number().optional().describe('Number of famous games to include (1-5, default: 2)'),
  }),
  outputSchema: learningContentSchema,
})
  .then(fetchFamousGames)
  .then(fetchChessFacts)
  .then(generateEducationalSummary);

chessLearningWorkflow.commit();

export { chessLearningWorkflow };
