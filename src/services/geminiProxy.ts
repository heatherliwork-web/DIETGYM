const API_BASE = '/api';

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
            parts: [
              {
                inlineData: {
                  data: imageData.split(',')[1],
                  mimeType
                }
              },
              {
                text: "Analyze this food image. Estimate the macronutrients and calories. Return ONLY a valid JSON object like this: {\"foodName\": \"name\", \"calories\": 100, \"carbs\": 10, \"protein\": 5, \"fat\": 3}. No markdown, no explanation."
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze food');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
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
            parts: [
              {
                text: `Analyze this workout description: "${text}". Estimate the calories burned. Return ONLY a valid JSON object like this: {\"workoutName\": \"Running\", \"caloriesBurned\": 300}. No markdown, no explanation.`
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze workout');
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanedText = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  },
};