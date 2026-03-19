module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { style } = req.body;
  if (!style) return res.status(400).json({ error: 'Missing style' });

  const stylePrompts = {
    'Anime Style': 'anime style illustration, manga art, vibrant colors, bold outlines, high quality',
    'Cyberpunk': 'cyberpunk neon lights dystopian electric colors glitch effects high quality',
    'Line Art': 'minimal line art clean ink drawing black and white elegant high quality',
    'Watercolor': 'watercolor painting soft washes artistic dreamy high quality',
    'Oil Painting': 'oil painting classic fine art rich textures painterly high quality',
    'Pixel Art': 'pixel art 16-bit retro game art colorful high quality',
    'Impressionist': 'impressionist painting loose brushstrokes Monet style soft light high quality',
    'Ukiyo-e': 'ukiyo-e Japanese woodblock print flat colors bold outlines traditional',
  };

  const prompt = stylePrompts[style] || 'artistic illustration high quality';

  try {
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/v1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/json',
          'x-use-cache': 'false',
        },
        body: JSON.stringify({
          inputs: prompt,
          model: 'black-forest-labs/FLUX.1-schnell',
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'HF error: ' + errText.slice(0, 300) });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resultBase64 = 'data:image/png;base64,' + buffer.toString('base64');
    return res.status(200).json({ imageUrl: resultBase64 });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
