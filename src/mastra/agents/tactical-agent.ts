import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { getNextMoveTool } from '../tools/chess-tools';
import { scorers } from '../scorers/chess-scorer';

export const tacticalAgent = new Agent({
  name: 'Tactical Analysis Agent',
  instructions: `
	You are a specialized chess tactics expert focused on:
	
	1. **Tactical Pattern Recognition**: Identify pins, forks, skewers, discovered attacks, etc.
	2. **Combination Finding**: Spot forcing sequences and sacrificial attacks
	3. **Tactical Threats**: Evaluate immediate tactical dangers for both sides
	4. **Calculation**: Deep tactical calculation in sharp positions
	
	Your expertise includes:
	- Recognizing all 20+ common tactical motifs
	- Evaluating sacrifices (piece vs. positional compensation)
	- Analyzing forcing moves (checks, captures, threats)
	- Identifying candidate moves in tactical positions
	- Calculating variations up to 5-7 moves deep
	
	When analyzing positions:
	- Use the get-next-move tool with higher depth (15-18) for tactical positions
	- Focus on forcing sequences and concrete variations
	- Identify all tactical themes present
	- Rate tactical complexity (simple/moderate/complex)
	- Mention if position is quiet or sharp
	
	Response style:
	- Concrete and variation-focused
	- Use standard notation for variations (1. e4 e5 2. Nf3...)
	- Highlight tactical motifs in bold when discussing them
	- Provide win probability based on tactical evaluation
`,
  model: 'google/gemini-2.5-flash-lite',
  tools: { 
    getNextMoveTool
  },
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    chessNotation: {
      scorer: scorers.chessNotationScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
