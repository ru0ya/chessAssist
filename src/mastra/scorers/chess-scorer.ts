import { z } from 'zod';
import { createToolCallAccuracyScorerCode } from '@mastra/evals/scorers/code';
import { createCompletenessScorer } from '@mastra/evals/scorers/code';
import { createScorer } from '@mastra/core/scores';

// Scorer to check if chess tools are used appropriately
export const toolCallAppropriatenessScorer = createToolCallAccuracyScorerCode({
  expectedTool: 'chessTools',
  strictMode: false,
});

// Scorer to check response completeness
export const completenessScorer = createCompletenessScorer();

// Custom scorer: evaluates if chess notation and terminology are used correctly
export const chessNotationScorer = createScorer({
  name: 'Chess Notation Quality',
  description:
    'Checks that proper algebraic chess notation is used and chess concepts are explained accurately',
  type: 'agent',
  judge: {
    model: 'google/gemini-2.5-pro',
    instructions:
      'You are an expert evaluator of chess content quality. ' +
      'Determine whether the assistant uses proper algebraic notation (e.g., e4, Nf3, Qxd5) and ' +
      'provides accurate chess information. Check for proper terminology, correct move descriptions, ' +
      'and appropriate context when discussing positions or games. ' +
      'Return only the structured JSON matching the provided schema.',
  },
})
  .preprocess(({ run }) => {
    const userText = (run.input?.inputMessages?.[0]?.content as string) || '';
    const assistantText = (run.output?.[0]?.content as string) || '';
    return { userText, assistantText };
  })
  .analyze({
    description:
      'Evaluate proper chess notation usage and accuracy of chess information',
    outputSchema: z.object({
      usesProperNotation: z.boolean(),
      accurateInformation: z.boolean(),
      confidence: z.number().min(0).max(1).default(1),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
            You are evaluating if a chess assistant correctly used proper notation and provided accurate information.
            User text:
            """
            ${results.preprocessStepResult.userText}
            """
            Assistant response:
            """
            ${results.preprocessStepResult.assistantText}
            """
            Tasks:
            1) Check if the assistant uses proper algebraic notation when describing moves (e.g., e4, Nf3, Qxd5, O-O, not "pawn to e4").
            2) Verify that chess information is accurate (correct game names, player names, historical facts).
            3) Assess if terminology is used correctly (pieces, positions, tactics, strategies).
            Return JSON with fields:
            {
              "usesProperNotation": boolean,
              "accurateInformation": boolean,
              "confidence": number, // 0-1
              "explanation": string
            }
        `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    let score = 0.5; // Base score
    
    if (r.usesProperNotation) score += 0.25;
    if (r.accurateInformation) score += 0.25;
    
    // Adjust by confidence
    score = score * (r.confidence ?? 1);
    
    return Math.max(0, Math.min(1, score));
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `Chess notation scoring: usesProperNotation=${r.usesProperNotation ?? false}, accurateInformation=${r.accurateInformation ?? false}, confidence=${r.confidence ?? 0}. Score=${score}. ${r.explanation ?? ''}`;
  });

export const scorers = {
  toolCallAppropriatenessScorer,
  completenessScorer,
  chessNotationScorer,
};
