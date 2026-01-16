import { GoogleGenAI } from "@google/genai";
import { UserProfile, RankTitle } from "../types";
import { QUOTES } from "../constants";

const getAIClient = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getEncouragement = async (profile: UserProfile, currentTitle: RankTitle) => {
  // Fallback: Pick a random quote
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const fallbackMsg = `「${randomQuote.text}」—— ${randomQuote.author}`;

  try {
    const ai = getAIClient();
    if (!ai) return fallbackMsg;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `
        你是一位溫暖幽默的「學習工坊」導師。
        目前學生的資訊：
        - 名字：${profile.name}
        - 目前稱號：${currentTitle.name}
        - 目前剩餘點數：${profile.points}
        - 累計獲得點數：${profile.totalEarned}

        參考名言庫（你可以從中挑選一個合適的，或是自己提供一個類似水準的）：
        ${QUOTES.map(q => `「${q.text}」-- ${q.author}`).join('\n')}

        請寫一段簡短（30-60字）的鼓勵話語，讚美他的成就並「引用一段名言」（一定要包含名言與作者）來鼓勵他。
        請使用親切、像大哥哥大姊姊一樣的語氣。
      `,
    });
    return response.text() || fallbackMsg;
  } catch (error) {
    console.error("Gemini Error:", error);
    return fallbackMsg;
  }
};

export const generateDailyMission = async (profile: UserProfile) => {
  try {
    const ai = getAIClient();
    if (!ai) throw new Error("API Key not found");

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `
        請為「學習工坊」的用戶生成一個今日隨機學習任務。
        用戶目前等級：${profile.totalEarned} 點。
        
        請以 JSON 格式輸出：
        {
          "title": "任務名稱",
          "description": "任務具體內容（例如：閱讀一篇科技文章並寫下心得）",
          "points": 獎勵點數 (50-200 之間)
        }
      `,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text() || '{}';
    return JSON.parse(text);
  } catch (error) {
    return {
      title: "每日閱讀",
      description: "閱讀一本好書 30 分鐘，並記錄下最喜歡的一句話。",
      points: 100
    };
  }
};
