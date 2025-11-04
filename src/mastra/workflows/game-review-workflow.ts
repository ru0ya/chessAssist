import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// ===== Schemas =====
const moveAnalysisSchema = z.object({
  moveNumber: z.number(),
  fen: z.string(),
  move: z.string(),
  evaluation: z.number(),
  bestMove: z.string(),
  isMistake: z.boolean(),
  comment: z.string(),
});

const gameReviewSchema = z.object({
  totalMoves: z.number(),
  analyzedPositions: z.array(moveAnalysisSchema),
  criticalMoments: z.array(z.string()),
  overallAssessment: z.string(),
});

// ===== Step 1: Parse PGN/Move List =====
const parseGameMoves = createStep({
  id: 'parse-game-moves',
  description: 'Parses a list of chess positions (FEN) for analysis',
  inputSchema: z.object({
    positions: z.array(z.object({
      moveNumber: z.number(),
      fen: z.string(),
      move: z.string(),
    })).describe('Array of positions to analyze'),
  }),
  outputSchema: z.object({
    positions: z.array(z.object({
      moveNumber: z.number(),
      fen: z.string(),
      move: z.string(),
    })),
    totalMoves: z.number(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData?.positions || inputData.positions.length === 0) {
      throw new Error('No positions provided for analysis');
    }

    return {
      positions: inputData.positions,
      totalMoves: inputData.positions.length,
    };
  },
});

// ===== Step 2: Analyze Each Position =====
const analyzeGamePositions = createStep({
  id: 'analyze-game-positions',
  description: 'Analyzes each position in the game to find mistakes and best moves',
  inputSchema: z.object({
    positions: z.array(z.object({
      moveNumber: z.number(),
      fen: z.string(),
      move: z.string(),
    })),
    totalMoves: z.number(),
  }),
  outputSchema: z.object({
    totalMoves: z.number(),
    analyzedPositions: z.array(moveAnalysisSchema),
  }),
  execute: async ({ inputData }) => {
    const { positions, totalMoves } = inputData!;
    const analyzedPositions: any[] = [];

    console.log(`\n🔍 Analyzing ${positions.length} positions...\n`);

    // Analyze each position (limit to avoid long processing)
    const positionsToAnalyze = positions.slice(0, Math.min(positions.length, 10));

    for (const position of positionsToAnalyze) {
      try {
        console.log(`Analyzing move ${position.moveNumber}...`);

        const response = await fetch('https://chess-api.com/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fen: position.fen,
            depth: 12,
            variants: 1,
          }),
        });

        if (!response.ok) {
          console.warn(`Failed to analyze position ${position.moveNumber}`);
          continue;
        }

        const data = await response.json();
        const bestMoveData = data.find((d: any) => d.type === 'bestmove') || data[data.length - 1];

        // Determine if the played move was a mistake
        const playedMove = position.move.toLowerCase().replace(/[+#]/g, '');
        const bestMove = bestMoveData.san.toLowerCase().replace(/[+#]/g, '');
        const isMistake = playedMove !== bestMove && Math.abs(bestMoveData.eval) > 1.0;

        let comment = '';
        if (isMistake) {
          comment = `Better was ${bestMoveData.san}. Evaluation changed significantly.`;
        } else {
          comment = 'Good move, in line with engine suggestion.';
        }

        analyzedPositions.push({
          moveNumber: position.moveNumber,
          fen: position.fen,
          move: position.move,
          evaluation: bestMoveData.eval,
          bestMove: bestMoveData.san,
          isMistake,
          comment,
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.warn(`Error analyzing move ${position.moveNumber}:`, error);
      }
    }

    return {
      totalMoves,
      analyzedPositions,
    };
  },
});

// ===== Step 3: Generate Game Review =====
const generateGameReview = createStep({
  id: 'generate-game-review',
  description: 'Creates a comprehensive game review with critical moments and assessment',
  inputSchema: z.object({
    totalMoves: z.number(),
    analyzedPositions: z.array(moveAnalysisSchema),
  }),
  outputSchema: gameReviewSchema,
  execute: async ({ inputData, mastra }) => {
    const { totalMoves, analyzedPositions } = inputData!;

    const agent = mastra?.getAgent('chessAgent');
    if (!agent) {
      throw new Error('Chess agent not found');
    }

    // Identify critical moments (mistakes and turning points)
    const mistakes = analyzedPositions.filter(pos => pos.isMistake);
    const criticalMoments = mistakes.map(pos => 
      `Move ${pos.moveNumber}: Played ${pos.move}, better was ${pos.bestMove}. ${pos.comment}`
    );

    const prompt = `Review this chess game and provide a comprehensive analysis:

📊 GAME STATISTICS:
• Total Moves Analyzed: ${analyzedPositions.length} of ${totalMoves}
• Mistakes Found: ${mistakes.length}

🔍 CRITICAL MOMENTS:
${criticalMoments.length > 0 ? criticalMoments.map((m, i) => `${i + 1}. ${m}`).join('\n') : 'No significant mistakes detected in analyzed positions.'}

📈 POSITION EVALUATIONS:
${analyzedPositions.slice(0, 5).map(pos => 
  `Move ${pos.moveNumber} (${pos.move}): Eval ${pos.evaluation > 0 ? '+' : ''}${pos.evaluation.toFixed(2)}`
).join('\n')}

Please provide a comprehensive game review:

🎮 GAME REVIEW REPORT
═══════════════════════════

📊 PERFORMANCE SUMMARY
[Overall assessment of play quality]

⚠️ CRITICAL MISTAKES
[Detailed analysis of the ${mistakes.length} key mistakes]

✅ STRONG MOVES
[Highlight positions where good moves were played]

🎯 PATTERNS & THEMES
[Identify recurring tactical/strategic patterns]

💡 IMPROVEMENT SUGGESTIONS
• [Suggestion 1]
• [Suggestion 2]
• [Suggestion 3]

📚 STUDY RECOMMENDATIONS
[What to focus on based on this game]

Keep the review constructive, specific, and actionable.`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let reviewText = '';
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      reviewText += chunk;
    }

    return {
      totalMoves,
      analyzedPositions,
      criticalMoments,
      overallAssessment: reviewText,
    };
  },
});

// ===== Game Review Workflow =====
const gameReviewWorkflow = createWorkflow({
  id: 'game-review-workflow',
  inputSchema: z.object({
    positions: z.array(z.object({
      moveNumber: z.number(),
      fen: z.string(),
      move: z.string(),
    })).describe('Array of game positions to review'),
  }),
  outputSchema: gameReviewSchema,
})
  .then(parseGameMoves)
  .then(analyzeGamePositions)
  .then(generateGameReview);

gameReviewWorkflow.commit();

export { gameReviewWorkflow };
