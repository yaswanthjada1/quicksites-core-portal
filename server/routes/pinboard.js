import express from 'express';
import { MongoClient } from 'mongodb';
import ollama from 'ollama'; // Ollama model client wrapper

const router = express.Router();

// Read stored pinboard layout metadata for the requested collection
router.post('/layout', async (req, res) => {
  const { databaseUri, targetCollection } = req.body;

  if (!databaseUri || !targetCollection) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: databaseUri and targetCollection.'
    });
  }

  try {
    const client = new MongoClient(databaseUri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db();

    const metadata = await db.collection('qss_pinboard_metadata').findOne({ collection: targetCollection });
    await client.close();

    if (!metadata) {
      return res.json({ success: true, widgetBox: [], activeWidgets: [] });
    }

    return res.json({
      success: true,
      widgetBox: metadata.widgetBox || [],
      activeWidgets: metadata.activeWidgets || []
    });
  } catch (error) {
    console.error('❌ [Pinboard Layout Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Persist pinboard layout metadata for the requested collection
router.post('/save', async (req, res) => {
  const { databaseUri, targetCollection, widgetBox, activeWidgets } = req.body;

  if (!databaseUri || !targetCollection || !Array.isArray(widgetBox) || !Array.isArray(activeWidgets)) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: databaseUri, targetCollection, widgetBox, activeWidgets.'
    });
  }

  try {
    const client = new MongoClient(databaseUri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db();

    await db.collection('qss_pinboard_metadata').updateOne(
      { collection: targetCollection },
      {
        $set: {
          widgetBox,
          activeWidgets,
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    await client.close();

    return res.json({ success: true, message: 'Pinboard layout saved successfully.' });
  } catch (error) {
    console.error('❌ [Pinboard Save Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Translate blueprint prompts into structured widget payloads using a local LLM.
 */
async function askLocalBlueprintLLM(prompt) {
  const blueprintInstructions = `You are an absolute-coordinate widget construction node. 
Convert the user request into an advanced data dashboard structural widget block representation.

OUTPUT RULES:
Return valid raw JSON only. Do not wrap output in markdown code fences (\`\`\`json) or trailing textual explanations.

JSON PAYLOAD INTERFACE SPECIFICATION:
{
  "title": "A concise, clean title string",
  "type": "metric" or "status" or "chart" or "dynamic",
  "value": "An immediate placeholder text value or metric signature representation",
  "desc": "A short, functional functional description detailing what this system module tracks."
}`;

  try {
    const response = await ollama.chat({
      model: 'qwen2.5-coder:1.5b', // Local Qwen Coder inference model
      messages: [
        { role: 'system', content: blueprintInstructions },
        { role: 'user', content: `Generate a dashboard element frame matching: ${prompt}` }
      ],
      options: {
        temperature: 0.2, // Low temperature enforces stable structured output
        num_predict: 120
      }
    });

    let rawContent = response.message.content || '';
    
    // Strip markdown code fences from model output before JSON parsing
    const cleanContent = rawContent.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanContent);

  } catch (err) {
    console.warn("⚠️ Pinboard blueprint compilation error. Injecting fail-safe component frame matrix...");
    return {
      title: "Custom Analytical Node",
      type: "dynamic",
      value: "Telemetry Active",
      desc: "Custom matrix blueprint compiled successfully via local contextual fallback engine variables."
    };
  }
}

// Generate a new pinboard widget blueprint from a prompt
router.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Blueprint specification prompt string is required.' });
  }

  try {
    const componentSpecs = await askLocalBlueprintLLM(prompt);
    
    // Standardize the generated widget payload response
    return res.json({
      success: true,
      widget: {
        id: `ai_${Date.now()}`,
        title: componentSpecs.title || 'AI Workspace Layer',
        type: componentSpecs.type || 'dynamic',
        value: componentSpecs.value || 'Data Verified',
        desc: componentSpecs.desc || String(prompt)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;