import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contractCode } = req.body;
  if (!contractCode) {
    return res.status(400).json({ error: 'Request body must include contractCode.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Anthropic API key is not configured.' });
  }

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/complete',
      {
        model: 'claude-3.5-mini',
        prompt: `Review the following Solidity contract for ARC Testnet deployment. Provide a concise security analysis, gas considerations, and any recommended improvements.\n\n${contractCode}`,
        max_tokens_to_sample: 450,
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
    res.status(200).json({ review: completion });
  } catch (error) {
    const message = error?.response?.data || error?.message || 'Review service failed.';
    res.status(500).json({ error: message });
  }
}
