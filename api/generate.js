module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { style } = req.body;
  if (!style) return res.status(400).json({ error: 'Missing style' });

  const stylePrompts = {
    'Anime Style': 'anime style portrait illustration manga art vibrant colors bold outlines high quality digital art',
    'Cyberpunk': 'cyberpunk style portrait neon lights dystopian city electric colors high quality',
    'Line Art': 'minimal line art portrait clean ink drawing black and white elegant high quality',
    'Watercolor': 'watercolor portrait painting soft color washes artistic dreamy high quality',
    'Oil Painting': 'oil painting portrait classic fine art rich textures painterly high quality',
    'Pixel Art': 'pixel art portrait 16-bit retro game art style colorful high quality',
    'Impressionist': 'impressionist portrait painting Monet style soft light loose brushstrokes high quality',
    'Ukiyo-e': 'ukiyo-e Japanese woodblock print portrait flat colors bold outlines traditional art',
  };

  const prompt = encodeURIComponent(stylePrompts[style] || 'artistic portrait illustration high quality');
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&seed=${seed}&nologo=true`;

  // Return the URL directly — browser fetches it, no timeout issue
  return res.status(200).json({ imageUrl });
}
