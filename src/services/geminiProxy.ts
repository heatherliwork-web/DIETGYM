const API_BASE = '/api';

interface AnalyzeFoodRequest {
  imageData: string;
  mimeType: string;
}

interface AnalyzeWorkoutRequest {
  text: string;
}

export const geminiProxy = {
  analyzeFood: async (imageData: string, mimeType: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            inlineData: {
              data: imageData.split(',')[1],
              mimeType
            }
          },
          {
            text: "Analyze this food image. Estimate the macronutrients and calories. Return ONLY a JSON object with keys: 'foodName' (string), 'calories' (number), 'carbs' (number in grams), 'protein' (number in grams), 'fat' (number in grams)."
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              foodName: { type: "STRING" },
              calories: { type: "NUMBER" },
              carbs: { type: "NUMBER" },
              protein: { type: "NUMBER" },
              fat: { type: "NUMBER" }
            },
            required: ["foodName", "calories", "carbs", "protein", "fat"]
          }
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze food');
    }

    const data = await response.json();
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
  },

  analyzeWorkout: async (text: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            text: `Analyze this workout description: "${text}". Estimate the calories burned. Return ONLY a JSON object with keys: 'workoutName' (string), 'caloriesBurned' (number).`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              workoutName: { type: "STRING" },
              caloriesBurned: { type: "NUMBER" }
            },
            required: ["workoutName", "caloriesBurned"]
          }
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze workout');
    }

    const data = await response.json();
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
  },
};