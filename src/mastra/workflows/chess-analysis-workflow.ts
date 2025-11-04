import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// ===== Schemas =====
const positionAnalysisSchema = z.object({
  fen: z.string(),
  bestMove: z.string(),
  evaluation: z.number(),
  description: z.string(),
  winChance: z.number(),
  depth: z.number(),
  isMate: z.boolean(),
  mateIn: z.number().nullable(),
});

const analysisReportSchema = z.object({
  position: positionAnalysisSchema,
  strategicAdvice: z.string(),
  tacticalThemes: z.array(z.string()),
  alternativeMoves: z.array(z.string()),
});

// ===== Step 1: Analyze Chess Position =====
const analyzePosition = createStep({
  id: 'analyze-position',
  description: 'Analyzes a chess position using Stockfish engine',
  inputSchema: z.object({
    fen: z.string().describe('Chess position in FEN notation'),
    depth: z.number().optional().describe('Analysis depth (default: 12)'),
  }),
  outputSchema: positionAnalysisSchema,
  execute: async ({ inputData }) => {
    if (!inputData?.fen) {
      throw new Error('FEN position is required');
    }

    const depth = inputData.depth || 12;

    // Call Chess API
    const response = await fetch('https://chess-api.com/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fen: inputData.fen,
        depth: Math.min(depth, 18),
        variants: 3, // Get 3 variations for analysis
      }),
    });

    if (!response.ok) {
      throw new Error(`Chess API error: ${response.status}`);
    }

    const data = await response.json();
    const bestMoveData = data.find((d: any) => d.type === 'bestmove') || data[data.length - 1];

    return {
      fen: inputData.fen,
      bestMove: `${bestMoveData.san} (from ${bestMoveData.from} to ${bestMoveData.to})`,
      evaluation: bestMoveData.eval,
      description: bestMoveData.text,
      winChance: bestMoveData.winChance,
      depth: bestMoveData.depth,
      isMate: bestMoveData.mate !== null,
      mateIn: bestMoveData.mate,
    };
  },
});

// ===== Step 2: Generate Strategic Advice =====
const generateStrategicAdvice = createStep({
  id: 'generate-strategic-advice',
  description: 'Uses AI agent to provide strategic advice based on position analysis',
  inputSchema: positionAnalysisSchema,
  outputSchema: analysisReportSchema,
  execute: async ({ inputData, mastra }) => {
    const analysis = inputData;

    if (!analysis) {
      throw new Error('Position analysis data not found');
    }

    const agent = mastra?.getAgent('chessAgent');
    if (!agent) {
      throw new Error('Chess agent not found');
    }

    const prompt = `Analyze this chess position and provide strategic advice:

Position: ${analysis.fen}
Best Move: ${analysis.bestMove}
Evaluation: ${analysis.evaluation} (Win Chance: ${analysis.winChance}%)
${analysis.isMate ? `Forced mate in ${analysis.mateIn} moves!` : ''}

Please provide:
1. Strategic advice (2-3 key strategic points about the position)
2. Tactical themes present (list 3-5 themes like pins, forks, discovered attacks, etc.)
3. Alternative good moves (2-3 other strong moves and why they might be played)

Format your response clearly with sections:
🎯 STRATEGIC ADVICE
[Your strategic analysis here]

⚔️ TACTICAL THEMES
• [Theme 1]
• [Theme 2]
• [Theme 3]

🔄 ALTERNATIVE MOVES
• [Move 1]: [Explanation]
• [Move 2]: [Explanation]
• [Move 3]: [Explanation]`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let adviceText = '';
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      adviceText += chunk;
    }

    // Parse the response to extract sections
    const strategicSection = adviceText.match(/🎯 STRATEGIC ADVICE\n([\s\S]*?)(?=⚔️|$)/)?.[1]?.trim() || adviceText;
    const tacticalSection = adviceText.match(/⚔️ TACTICAL THEMES\n([\s\S]*?)(?=🔄|$)/)?.[1] || '';
    const alternativesSection = adviceText.match(/🔄 ALTERNATIVE MOVES\n([\s\S]*?)$/)?.[1] || '';

    const tacticalThemes = tacticalSection
      .split('\n')
      .filter(line => line.trim().startsWith('•'))
      .map(line => line.replace('•', '').trim());

    const alternativeMoves = alternativesSection
      .split('\n')
      .filter(line => line.trim().startsWith('•'))
      .map(line => line.replace('•', '').trim());

    return {
      position: analysis,
      strategicAdvice: strategicSection,
      tacticalThemes: tacticalThemes.length > 0 ? tacticalThemes : ['Position analysis provided'],
      alternativeMoves: alternativeMoves.length > 0 ? alternativeMoves : ['See best move analysis'],
    };
  },
});

// ===== Chess Analysis Workflow =====
const chessAnalysisWorkflow = createWorkflow({
  id: 'chess-analysis-workflow',
  inputSchema: z.object({
    fen: z.string().describe('Chess position in FEN notation'),
    depth: z.number().optional().describe('Analysis depth (1-18, default: 12)'),
  }),
  outputSchema: analysisReportSchema,
})
  .then(analyzePosition)
  .then(generateStrategicAdvice);

chessAnalysisWorkflow.commit();

export { chessAnalysisWorkflow };
