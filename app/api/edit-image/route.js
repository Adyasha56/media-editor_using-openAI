// app/api/edit-image/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Replicate from 'replicate';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Rate limiting (simple in-memory, use Redis in production)
const rateLimit = new Map();
const RATE_LIMIT = 10; // requests per minute
const WINDOW = 60000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}

async function analyzeCommand(imageBase64, command) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image editing request: "${command}". 
              Determine the best approach and return JSON with:
              {
                "action": "filter|remove_bg|generate|transform",
                "parameters": {...},
                "description": "what will be done"
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });
    
    const analysis = JSON.parse(response.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error('Failed to analyze command');
  }
}

async function removeBackground(imageBase64) {
  try {
    const output = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: imageBase64
        }
      }
    );
    return output;
  } catch (error) {
    console.error('Background removal error:', error);
    throw new Error('Failed to remove background');
  }
}

async function applyGenerativeEdit(imageBase64, prompt) {
  try {
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: imageBase64,
          prompt: prompt,
          strength: 0.7
        }
      }
    );
    return output[0];
  } catch (error) {
    console.error('Generative edit error:', error);
    throw new Error('Failed to apply generative edit');
  }
}

export async function POST(request) {
  try {
    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { image, command } = await request.json();

    // Validation
    if (!image || !command) {
      return NextResponse.json(
        { error: 'Image and command are required' },
        { status: 400 }
      );
    }

    if (command.length > 500) {
      return NextResponse.json(
        { error: 'Command too long' },
        { status: 400 }
      );
    }

    // Step 1: Analyze the command using GPT-4 Vision
    console.log('Analyzing command:', command);
    const analysis = await analyzeCommand(image, command);
    console.log('Analysis result:', analysis);

    let result;

    // Step 2: Route to appropriate AI model
    switch (analysis.action) {
      case 'remove_bg':
        result = await removeBackground(image);
        break;
      
      case 'generate':
      case 'transform':
        result = await applyGenerativeEdit(image, command);
        break;
      
      case 'filter':
        // For simple filters, return instruction to handle client-side
        result = {
          type: 'filter',
          filter: analysis.parameters.filter,
          image: image
        };
        break;
      
      default:
        throw new Error('Unsupported edit action');
    }

    // Step 3: Return the processed image
    return NextResponse.json({
      success: true,
      result: result,
      analysis: analysis.description,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    version: '1.0.0',
    endpoints: {
      edit: 'POST /api/edit-image'
    }
  });
}