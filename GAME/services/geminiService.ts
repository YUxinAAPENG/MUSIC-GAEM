
import { GoogleGenAI } from "@google/genai";
import { GameStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePerformanceReview = async (stats: GameStats): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash";
    
    // Calculate APM or similar metric roughly
    const reactionQuality = stats.accuracy > 90 ? "神级反应" : stats.accuracy > 70 ? "不错的节奏感" : "手忙脚乱";
    
    const prompt = `
    你是一个苛刻但也幽默的音乐节奏游戏制作人。玩家刚刚完成了一局游戏。
    数据如下:
    - 得分: ${stats.score}
    - 最大连击: ${stats.maxCombo}
    - 准确率: ${stats.accuracy.toFixed(1)}%
    - 命中数: ${stats.hits}
    - 失误数: ${stats.misses}

    请用中文写一段简短的评价（50字以内）。
    如果准确率低于 70%，嘲讽他们的节奏感像是在“切菜”。
    如果准确率高于 90%，称赞他们是“节奏大师”。
    风格要像音乐选秀节目的评委。
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        temperature: 1,
      },
    });

    return response.text || "节奏不错，但还需要多加练习！";

  } catch (error) {
    console.error("Error generating review:", error);
    return "系统繁忙，但你的表现大家都看在眼里！";
  }
};
