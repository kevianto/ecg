import { GoogleGenerativeAI } from '@google/generative-ai';
import { ECGReading } from '../types';

// Replace with your actual Gemini API key
const API_KEY = 'AIzaSyA0rJYe982pfnQH1g48i0KeSgNNwMA2I1E'; // Replace with your actual API key

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateHealthPrediction = async (reading: ECGReading): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Given the following health sensor data:
- BPM (Heart Rate): ${reading.bpm}
- RR Interval: ${reading.rr}ms
- HRV (Heart Rate Variability): ${reading.hrv}
- Temperature: ${reading.temperature}°C
- Timestamp: ${reading.timestamp}
- Patient Code: ${reading.patientCode || 'Unknown'}

Analyze this medical data and predict possible health issues (cardiac or general) based on these readings. 
Provide a short, professional medical assessment in plain English that a healthcare provider would understand.
Focus on any abnormalities or patterns that might indicate health concerns.
Keep the response concise but informative (2-3 sentences maximum).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating prediction:', error);
    throw new Error('Failed to generate health prediction. Please check your API configuration.');
  }
};