import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('GROQ_API_KEY is not set');
      // Mock response for development if API key is not set
      return NextResponse.json({
        title: 'Makan Siang (Mock OCR)',
        amount: 25000,
        category: 'Makan & Minum'
      });
    }

    // Call Groq Vision API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this receipt image. Extract the primary purchase as a short 2-3 word title (e.g. "Makan Nasi Padang", "Beli Kopi", "Belanja Indomaret"), the TOTAL amount in numbers only, and determine the category (Makan & Minum, Transportasi, Pendidikan). Return ONLY a JSON object exactly like this with no markdown or other text: {"title": "Short Title", "amount": 15000, "category": "Makan & Minum"}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      throw new Error(`Groq API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Attempt to parse JSON from the response
    try {
      // Find JSON block if wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const parsedData = JSON.parse(jsonStr);
      
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error('Failed to parse Groq response:', content);
      throw new Error('Invalid JSON from AI');
    }

  } catch (error) {
    console.error('Error scanning receipt:', error);
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 });
  }
}
