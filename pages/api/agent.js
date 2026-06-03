import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task, contractCode } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Request body must include task.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Anthropic API key is not configured.' });
  }

  const promptParts = [
    'You are a smart contract AI agent for the ARC Testnet. Use the task request to produce a clear and practical response for the developer.',
    `Task: ${task}`,
  ];

  if (contractCode) {
    promptParts.push('Contract code:');
    promptParts.push(contractCode);
  }

  promptParts.push('Provide concise guidance, security notes, and any code recommendations when appropriate.');

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/complete',
      {
        model: 'claude-3.5-mini',
        prompt: promptParts.join('\n\n'),
        max_tokens_to_sample: 500,
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

    const output = response.data?.completion || response.data?.output || '';
    return res.status(200).json({ task, response: output.trim() });
  } catch (error) {
    const message = error?.response?.data || error?.message || 'Agent service failed.';
    return res.status(500).json({ error: message });
  }
}
