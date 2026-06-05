import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured or is set to placeholder.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST route for student advisor
app.post("/api/advisor", async (req, res) => {
  try {
    const { budget, expenses, goals, message, customPrompt } = req.body;

    console.log("Analyzing finances for student adviser request...");

    let client: GoogleGenAI;
    try {
      client = getGeminiClient();
    } catch (err: any) {
      console.warn("Using fallback rules due to configuration error:", err.message);
      return res.json(getFallbackAdvice(budget, expenses, goals, message));
    }

    const systemPrompt = `You are a highly empathetic and extremely practical personal finance adviser specifically for high school/college/university students.
Students deal with limited income, high prices of textbooks, expensive meal plans, student rents, and high social peer pressure. 
You provide actionable, positive, student-friendly, and highly realistic tips (e.g. buying used textbooks, smart thrifting, discount cards, student transit passes, sharing meal preps).
You MUST return your response as a valid JSON object matching the requested schema. DO NOT wrap with markdown blocks or format with anything except clean JSON.`;

    const userPrompt = `
Analyze the following student financial dashboard:

1. BUDGET LIMITS:
${JSON.stringify(budget, null, 2)}

2. RECENT EXPENSES LOGGED:
${JSON.stringify(expenses, null, 2)}

3. ACTIVE SAVINGS GOALS:
${JSON.stringify(goals, null, 2)}

4. STUDENT'S MESSAGE/QUERY:
"${message || "How is my overall financial health and what student-specific savings should I implement?"}"

Please evaluate:
- Where the student is overspending (compare category totals in expenses to their specified budget limits).
- Suggest 3 concrete, extremely practical student savings actions (e.g. "Pack a lunch", "Ditch textbook buyback for thirft rentals", "Use student ID discount"). Estimate realistic dollar amounts they can save.
- Suggest simple adjustments to their budget if needed.
- Provide a responsive chat answer addressing their message.

Return a JSON document with this exact typescript shape:
{
  generalStatus: string; // e.g. "On Track", "Caution: Entertainment High", "Budget Alert"
  summaryAdvice: string; // 1-2 sentence overall review
  savingsSuggestions: {
    title: string;
    description: string;
    potentialSavings: string; // e.g. "$10/week", "$50/semester"
  }[];
  suggestedBudgetAdjustments: {
    category: string;
    currentLimit: number;
    suggestedLimit: number;
    reason: string;
  }[];
  chatResponse: string; // Direct empathetic friendly answer to their chat message or query.
}
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["generalStatus", "summaryAdvice", "savingsSuggestions", "suggestedBudgetAdjustments", "chatResponse"],
          properties: {
            generalStatus: { type: Type.STRING },
            summaryAdvice: { type: Type.STRING },
            savingsSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "potentialSavings"],
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  potentialSavings: { type: Type.STRING },
                },
              },
            },
            suggestedBudgetAdjustments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["category", "currentLimit", "suggestedLimit", "reason"],
                properties: {
                  category: { type: Type.STRING },
                  currentLimit: { type: Type.NUMBER },
                  suggestedLimit: { type: Type.NUMBER },
                  reason: { type: Type.STRING },
                },
              },
            },
            chatResponse: { type: Type.STRING },
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini advisor error:", error);
    res.status(500).json({
      error: "Could not generate AI Advice: " + error.message,
      usingFallback: true,
      ...getFallbackAdvice(req.body.budget, req.body.expenses, req.body.goals, req.body.message)
    });
  }
});

// Mock/Fallback Advice generator for offline status or missing API key
function getFallbackAdvice(budget: any, expenses: any[], goals: any[], message: string) {
  // Simple heuristic logic to simulate high quality student savings recommendations offline
  const totalLimit = Object.values(budget || {}).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number;
  
  // Calculate expenses by category
  const categoryTotals: Record<string, number> = {};
  let totalExpense = 0;
  if (Array.isArray(expenses)) {
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
      totalExpense += Number(e.amount);
    });
  }

  // Find dynamic alerts
  let status = "Getting Started";
  let overviewText = "Let's track your first few expenses to unlock deeper insights.";
  const adjustments: any[] = [];
  
  if (totalExpense > 0) {
    status = totalExpense > totalLimit ? "Budget Exceeded" : "Healthy Spending";
    overviewText = `You have spent $${totalExpense.toFixed(2)} out of your $${totalLimit.toFixed(2)} budget limits. Keep exploring student discounts!`;
    
    // Check specific overspend
    Object.keys(budget || {}).forEach((cat) => {
      const spent = categoryTotals[cat] || 0;
      const limit = Number(budget[cat] || 0);
      if (spent > limit && limit > 0) {
        status = `Overspent in ${cat}`;
        adjustments.push({
          category: cat,
          currentLimit: limit,
          suggestedLimit: spent + 20,
          reason: `Your logged expenses ($${spent.toFixed(2)}) exceed your limit ($${limit.toFixed(2)}). Consider temporary adjustments.`,
        });
      }
    });
  }

  return {
    generalStatus: status,
    summaryAdvice: overviewText,
    savingsSuggestions: [
      {
        title: "Ditch Coffee Shop Runs",
        description: "Switch to making cold brew or coffee at home. Committing to a reusable thermos saves up to 80% on daily beverage charges.",
        potentialSavings: "$15.00/week"
      },
      {
        title: "Rent Used Textbooks",
        description: "Avoid buying raw standard new textbooks. Utilize online course material rental systems or search of physical bulletin boards on campus.",
        potentialSavings: "$120.00/semester"
      },
      {
        title: "Flash Your Student ID",
        description: "Always ask 'Do you offer student discount?' at local grocery hubs, software subscriptions, apparel stores, and regional transit services.",
        potentialSavings: "$25.00/month"
      }
    ],
    suggestedBudgetAdjustments: adjustments.length > 0 ? adjustments : [
      {
        category: "Entertainment",
        currentLimit: budget?.Entertainment || 100,
        suggestedLimit: Math.max((budget?.Entertainment || 100) - 20, 20),
        reason: "Trim entertainment budget slightly to redirect towards your higher-priority saving objectives."
      }
    ],
    chatResponse: `Hello! I'm your Student Savings Guide (Offline Mode). I notice you've logged some student expenses. To maximize your savings, focus on cheap home meals, campus-sponsored free social gatherings, and utilize local transit discounts instead of rideshares. ${message ? `Regarding your question "${message}": my best advice is to analyze your highest category cost and seek free alternatives on-campus!` : "Let me know regular queries about student budget advice!"}`
  };
}

// Start Server Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite Dev Server Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Student Finance Server is live on http://localhost:${PORT}`);
  });
}

startServer();
