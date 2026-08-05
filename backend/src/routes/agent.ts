import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import {
  DEFAULT_MODEL,
  isSupportedModel,
  streamChatCompletion,
  ModelId,
} from '../services/openrouter';

const router = Router();

const SYSTEM_PROMPT = `You are DevBuild, an expert software architect that creates complete, production-ready projects from scratch.
The user will describe the project they want. You must respond with the ENTIRE project:
- A complete file tree covering every file needed for the project to run.
- The FULL source code for every file - complete, correct and runnable, with no placeholders like "...".
- Include config files (package.json, tsconfig.json, .env.example, etc.) and a README.md.

Format every file exactly like this:

### FILE: relative/path/inside/project/file-name.ext
<complete file content>

Do not add commentary, explanations or markdown outside the file markers. Only output file markers and code.
If generating many files, keep each file complete - never truncate a file mid-code.
When asked to continue, resume exactly where you left off, starting with the first file you have not fully emitted yet, using the same ### FILE: format.`;

interface GenerateBody {
  prompt: string;
  model?: string;
}

export function buildAgentMessages(userPrompt: string) {
  return [{ role: 'user' as const, content: userPrompt }];
}

router.post('/generate', requireAuth, async (req: AuthRequest, res) => {
  const body = (req.body ?? {}) as GenerateBody;
  const { prompt, model } = body;

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'A project description is required' });
  }

  const modelId: ModelId = isSupportedModel(model) ? model : DEFAULT_MODEL;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const abortController = new AbortController();
  let clientGone = false;
  let finished = false;

  req.on('close', () => {
    if (!finished) {
      clientGone = true;
      abortController.abort();
    }
  });

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...buildAgentMessages(prompt.trim()),
  ];

  let assistantText = '';
  let streamFailed = false;
  let streamErrorMessage = '';

  try {
    for await (const delta of streamChatCompletion(messages, modelId, abortController.signal)) {
      if (clientGone) break;
      assistantText += delta;
      res.write(`data: ${JSON.stringify({ event: 'message', delta })}\n\n`);
    }
  } catch (err) {
    const abortError = err instanceof Error && err.name === 'AbortError';
    if (!abortError && !clientGone) {
      streamFailed = true;
      streamErrorMessage =
        err instanceof Error && err.message ? err.message : 'The agent failed to respond.';
      console.error('Agent stream error:', err);
    }
  }

  finished = true;

  if (!clientGone) {
    if (streamFailed) {
      res.write(`data: ${JSON.stringify({ event: 'error', error: streamErrorMessage })}\n\n`);
    }
    res.write(
      `data: ${JSON.stringify({ event: 'done', length: assistantText.length })}\n\n`
    );
    res.end();
  }
});

export default router;
