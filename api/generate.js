module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { style } = req.body;
  if (!style) return res.status(400).json({ error: 'Missing style' });

  const stylePrompts = {
    'Anime Style': 'a portrait in anime style illustration, manga art, vibrant colors, bold outlines, high quality digital art',
    'Cyberpunk': 'a portrait in cyberpunk style, neon lights, dystopian city, electric colors, glitch effects, high quality',
    'Line Art': 'a portrait as minimal line art, clean ink drawing, black and white, elegant strokes, high quality',
    'Watercolor': 'a portrait as watercolor painting, soft color washes, artistic, dreamy, high quality',
    'Oil Painting': 'a portrait as oil painting, classic fine art style, rich textures, painterly, high quality',
    'Pixel Art': 'a portrait in pixel art style, 16-bit retro game art, colorful, high quality',
    'Impressionist': 'a portrait as impressionist painting, loose brushstrokes, Monet style, soft light, high quality',
    'Ukiyo-e': 'a portrait in ukiyo-e Japanese woodblock print style, flat colors, bold outlines, traditional art',
  };

  const prompt = stylePrompts[style] || 'a beautiful artistic illustration, high quality';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'Google error: ' + errText.slice(0, 300) });
    }

    const data = await response.json();
    const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
      return res.status(500).json({ error: 'No image returned: ' + JSON.stringify(data).slice(0, 200) });
    }

    return res.status(200).json({
      imageUrl: 'data:image/png;base64,' + base64Image
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
