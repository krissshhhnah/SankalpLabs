import { FastifyPluginAsync } from 'fastify';

export const aiRoutes: FastifyPluginAsync = async (server) => {
  // Check AI Engine Status
  server.get('/api/ai/status', async () => {
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
    return {
      status: 'online',
      provider: hasGeminiKey ? 'google-gemini' : 'sankalp-canvas-intelligence',
      version: '2.0.0',
      capabilities: [
        'text-to-diagram',
        'sequence-diagrams',
        'mind-maps',
        'auto-organize-grid',
        'canvas-summarization',
        'diagram-to-tasks',
        'context-aware-autocomplete',
      ],
    };
  });

  // Next-Step Prediction Endpoint
  server.post('/api/ai/suggest-next', async (request) => {
    const { nodeText } = request.body as { nodeText: string };
    const lower = (nodeText || '').toLowerCase();

    if (lower.includes('auth') || lower.includes('login')) {
      return {
        suggestions: [
          { label: 'Validate Password Hash', type: 'process', color: '#eff6ff' },
          { label: 'Verify 2FA Token', type: 'decision', color: '#fef3c7' },
          { label: 'Issue Signed JWT', type: 'process', color: '#dcfce7' },
        ],
      };
    }

    if (lower.includes('payment') || lower.includes('order')) {
      return {
        suggestions: [
          { label: 'Verify Card Balance', type: 'decision', color: '#fef3c7' },
          { label: 'Stripe Charge Capture', type: 'process', color: '#eff6ff' },
          { label: 'Send Receipt Email', type: 'process', color: '#dcfce7' },
        ],
      };
    }

    return {
      suggestions: [
        { label: 'Process & Validate', type: 'process', color: '#eff6ff' },
        { label: 'Decision Review', type: 'decision', color: '#fef3c7' },
        { label: 'Persist & Notify', type: 'process', color: '#dcfce7' },
      ],
    };
  });

  // Main Canvas Agent Endpoint
  server.post('/api/ai/agent', async (request, reply) => {
    try {
      const { prompt, boardId } = request.body as { prompt: string; boardId: string };
      if (!prompt) {
        return reply.status(400).send({ error: 'Prompt is required' });
      }

      const geminiKey = process.env.GEMINI_API_KEY;

      if (geminiKey) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are Sankalp Canvas AI, an intelligent whiteboard assistant. User prompt: "${prompt}". Reply concisely with clear whiteboard instructions or steps.`,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (replyText) {
              return { reply: replyText, source: 'gemini-1.5-flash' };
            }
          }
        } catch (e) {
          server.log.warn({ err: e }, 'Gemini API call failed, falling back to embedded engine');
        }
      }

      return {
        reply: `Processed instruction: "${prompt}". Canvas Agent is active for board ${boardId}.`,
        source: 'sankalp-embedded-engine',
      };
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({ error: 'Failed to process AI command' });
    }
  });
};

