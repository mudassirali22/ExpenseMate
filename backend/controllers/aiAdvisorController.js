const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Goal = require("../models/Goal");
const Budget = require("../models/Budget");

// AI Chat endpoint
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Fetch user's financial data for context
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 }).limit(100);
    const incomes = await Income.find({ user: userId }).sort({ date: -1 }).limit(100);
    const goals = await Goal.find({ user: userId });
    const budgets = await Budget.find({ user: userId });

    const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0);

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Build context for AI with simpler labels
    const financialContext = `
USER DATA SUMMARY:
- Monthly Income: Rs ${totalIncome.toLocaleString()}
- Monthly Spending: Rs ${totalExpense.toLocaleString()}
- Leftover Money: Rs ${(totalIncome - totalExpense).toLocaleString()}
- Saving Rate: ${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(0) : 0}%
- Biggest Spending: ${topCategories.map(([cat, amt]) => `${cat} (Rs ${amt.toLocaleString()})`).join(", ")}
- Savings Goals: ${goals.length > 0 ? goals.map(g => `${g.title}`).join(", ") : "None set yet"}
- Budgets: ${budgets.length} Categories
`;

    // Try Gemini API if key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are the ExpanseMate AI Financial Advisor. You help people manage their money in a simple and friendly way.
Your tone is helpful, easy to understand, and professional. Use simple English and avoid complex finance words.

Here is the user's financial info:
${financialContext}

Current User Message: "${message}"

Rules for your response:
1. Speak like a friendly human expert. Use "Easy English".
2. Use the user's data (Income, Spending, Goals) to give real advice.
3. If they ask for an "audit" or "review", give them a clear breakdown of what they are doing well and where they can improve.
4. Always encourage them to reach their goals: ${goals.map(g => g.title).join(", ")}.
5. Keep it short and use simple bullet points if needed.
6. Use "Rs" for money.`;

        const result = await model.generateContent(prompt);
        const aiReply = result.response.text();

        return res.status(200).json({ reply: aiReply });
      } catch (aiError) {
        console.error("Gemini API Error:", aiError.message);
      }
    }

    // Fallback: Generate simple smart response
    const reply = generateSmartResponse(message, {
      totalIncome,
      totalExpense,
      topCategories,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(0) : 0,
      goals
    });

    res.status(200).json({ reply });
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    res.status(500).json({ message: "AI is resting right now. Try again soon!", error: error.message });
  }
};

function generateSmartResponse(message, data) {
  const lower = message.toLowerCase();
  const { totalIncome, totalExpense, topCategories, savingsRate, goals } = data;

  const savingsAmt = totalIncome - totalExpense;
  const topCat = topCategories.length > 0 ? topCategories[0][0] : "everything";

  if (lower.includes("audit") || lower.includes("review") || lower.includes("health") || lower.includes("check")) {
    return `### Your Financial Health Check 🩺
    
**What's going well:**
- You have a personal saving rate of **${savingsRate}%**.
- Your total income for this period is **Rs ${totalIncome.toLocaleString()}**.

**Where to improve:**
- You are spending a lot on **${topCat}**. Try to cut this back by 10% next month.
- Your total spending is **Rs ${totalExpense.toLocaleString()}**.

**My Advice:**
Keep an eye on your **${topCat}** costs. If you save just a little more there, you'll reach your goals much faster!`;
  }

  if (lower.includes("spend") || lower.includes("breakdown") || lower.includes("where is my money")) {
    const list = topCategories.map(([cat, amt]) => `- **${cat}**: Rs ${amt.toLocaleString()}`).join("\n");
    return `### Where your money is going 💸

Here are your top spending areas:
${list}

You've spent a total of **Rs ${totalExpense.toLocaleString()}** recently. Focus on reducing the top items to keep more money in your pocket!`;
  }

  if (lower.includes("save") || lower.includes("tips") || lower.includes("how can i")) {
    return `### Fast Tips to Save More 💡

1. **The 10% Rule**: Try to save just 10% more of your income before you spend anything. That would be **Rs ${Math.round(totalIncome * 0.1).toLocaleString()}** for you.
2. **Review ${topCat}**: This is your biggest expense. Even a small change here makes a big difference.
3. **Emergency Fund**: Aim to keep at least **Rs ${Math.round(totalExpense * 3).toLocaleString()}** in a separate account for rainy days.

You are currently saving **Rs ${savingsAmt.toLocaleString()}** - you're on the right track!`;
  }

  if (lower.includes("goal")) {
    if (goals.length > 0) {
      return `### Your Goals 🎯
      
You are working towards: **${goals.map(g => g.title).join(", ")}**.

To reach these faster, try to move your leftover **Rs ${savingsAmt.toLocaleString()}** into your goals account as soon as you get paid!`;
    }
    return "You haven't set any savings goals yet! Go to the **Savings Goals** page and set one. It's the best way to stay motivated.";
  }

  // DEFAULT RESULT (Financial Snapshot) - Always give a result as requested
  return `### 📊 Your ExpanseMate Snapshot

**Current State:**
- **Inbound**: Rs ${totalIncome.toLocaleString()}
- **Outbound**: Rs ${totalExpense.toLocaleString()}
- **Retention**: ${savingsRate}% (Rs ${savingsAmt.toLocaleString()})

**Quick Insight:**
You have **Rs ${savingsAmt.toLocaleString()}** left over. ${savingsRate > 20 ? "Your savings rate is looking very healthy!" : "Try to reduce your spending on **" + topCat + "** to increase your savings."}

Ask me something specific if you need a deep audit or saving tips!`;
}
