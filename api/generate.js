module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, style } = req.body;
  if (!imageBase64 || !style) return res.status(400).json({ error: 'Missing fields' });

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
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '9a9b6aa5ac2793993aaaff48fd0e05fc5be213bc85a0bafd24e578d3bb81e628',
        input: {
          prompt: prompt,
          image: imageBase64,
          prompt_strength: 0.6,
          num_inference_steps: 25,
          guidance_scale: 7,
        },
      }),
    });

    const text = await startRes.text();
    let prediction;
    try { prediction = JSON.parse(text); }
    catch(e) { return res.status(500).json({ error: 'Replicate parse error: ' + text.slice(0,200) }); }

    if (!startRes.ok || prediction.error) {
      return res.status(500).json({ error: 'Failed: ' + JSON.stringify(prediction) });
    }

    let result = prediction;
    let attempts = 0;
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 30) {
      await new Promise(r => setTimeout(r, 2000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` },
      });
      result = await poll.json();
      attempts++;
    }

    if (result.status !== 'succeeded') {
      return res.status(500).json({ error: result.error || 'Generation failed after ' + attempts + ' attempts' });
    }

    return res.status(200).json({ imageUrl: result.output?.[0] || result.output });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
