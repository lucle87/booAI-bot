import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Request body must include message.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Anthropic API key is not configured.' });
  }

  const systemPrompt = `You are a smart contract assistant for booAI_bot.\nHelp users deploy contracts by asking for required parameters one question at a time.\nSupported types: ERC20 token, ERC721 NFT, simple storage.\nWhen you have all info, respond with JSON only: { done: true, contractType: 'ERC20', params: { name, symbol, supply, decimals }, solidityCode: '...' }.\nOtherwise ask the next question naturally.`;

  // Build a conversation string including history and the new message
  const convo = [];
  if (Array.isArray(history)) {
    history.forEach((m) => {
      convo.push(`${m.role === 'assistant' ? 'Assistant' : 'Human'}: ${m.text}`);
    });
  }
  convo.push(`Human: ${message}`);

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/complete',
      {
        model: 'claude-3.5-mini',
        prompt: `${systemPrompt}\n\n${convo.join('\n')}`,
        max_tokens_to_sample: 1000,
        temperature: 0.2,
        stop_sequences: ['\n\nHuman:'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const completion = response.data?.completion || response.data?.output || '';

    // Try to find a JSON block in the completion
    const jsonMatch = completion.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.status(200).json({ assistant: completion, ...parsed });
      } catch (e) {
        // fallthrough to return raw assistant text
      }
    }

    return res.status(200).json({ assistant: completion, done: false });
  } catch (error) {
    const messageErr = error?.response?.data || error?.message || 'Chat service failed.';
    return res.status(500).json({ error: messageErr });
  }
}
