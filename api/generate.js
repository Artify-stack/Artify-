const { GoogleGenAI } = require('@google/genai');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { style } = req.body;
  if (!style) return res.status(400).json({ error: 'Missing style' });

  const stylePrompts = {
    'Anime Style': 'anime style portrait illustration, manga art, vibrant colors, bold outlines, high quality digital art',
    'Cyberpunk': 'cyberpunk style portrait, neon lights, dystopian city background, electric colors, high quality',
    'Line Art': 'minimal line art portrait, clean ink drawing, black and white, elegant strokes, high quality',
    'Watercolor': 'watercolor portrait painting, soft color washes, artistic, dreamy, high quality',
    'Oil Painting': 'oil painting portrait, classic fine art style, rich textures, painterly, high quality',
    'Pixel Art': 'pixel art portrait, 16-bit retro game art style, colorful, high quality',
    'Impressionist': 'impressionist portrait painting, loose brushstrokes, Monet style, soft light, high quality',
    'Ukiyo-e': 'ukiyo-e Japanese woodblock print style portrait, flat colors, bold outlines, traditional art',
  };

  const prompt = stylePrompts[style] || 'beautiful artistic portrait illustration, high quality';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    let imageBase64 = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!imageBase64) {
      return res.status(500).json({ error: 'No image returned from Google' });
    }

    return res.status(200).json({
      imageUrl: 'data:image/png;base64,' + imageBase64
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
