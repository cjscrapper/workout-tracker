export async function POST(request) {
  try {
    const { logs, question } = await request.json();

    const logsText = Object.entries(logs).map(([key, entry]) => {
      const sets = Object.entries(entry.data).map(([ei, sets]) => {
        const exName = entry.exercises?.[ei] || `Exercise ${parseInt(ei) + 1}`;
        const setsText = sets.map((s, i) => `  Set ${i+1}: ${s.weight}lbs × ${s.reps} reps${s.done ? ' ✓' : ''}`).join('\n');
        return `${exName}:\n${setsText}`;
      }).join('\n\n');
      return `${entry.date} — ${entry.day} (${entry.label}):\n${sets}`;
    }).join('\n\n---\n\n');

    const systemPrompt = `You are a personal fitness coach reviewing workout logs for a user on a structured 5-day program:
- Day 1: Push (Chest, Triceps, Front Delts)
- Day 2: Pull (Back, Biceps, Rear Delts)  
- Day 3: Legs (Quads, Hamstrings, Calves)
- Day 4: Shoulders + Arms
- Day 5: Core + Conditioning

Progressive overload rules: add 5lbs upper body / 10lbs lower body when all sets completed at target reps. Repeat same weight if failing by more than 2 reps.

Be concise, specific, and actionable. Reference actual numbers from the logs. Keep responses under 200 words unless a detailed breakdown is explicitly requested. Use plain text, no markdown.`;

    const userMessage = logs && Object.keys(logs).length > 0
      ? `Here are my workout logs:\n\n${logsText}\n\n${question || "Please assess my progress and give me specific recommendations."}`
      : question || "I just started the program. What should I focus on?";

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || 'Unable to generate assessment.';
    return Response.json({ assessment: text });
  } catch (error) {
    console.error('Coach API error:', error);
    return Response.json({ error: 'Failed to get assessment' }, { status: 500 });
  }
}
