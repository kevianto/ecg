import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertTriangle, Loader } from 'lucide-react';
import { ECGReading, GeminiPrediction } from '../types';
import { generateHealthPrediction } from '../utils/geminiApi';

interface GeminiPredictorProps {
  latestReading: ECGReading | null;
  autoAnalyze?: boolean;
}

export const GeminiPredictor: React.FC<GeminiPredictorProps> = ({
  latestReading,
  autoAnalyze = false
}) => {
  const [predictions, setPredictions] = useState<GeminiPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoAnalyze && latestReading) {
      handleAnalyze(latestReading);
    }
  }, [latestReading, autoAnalyze]);

  const handleAnalyze = async (reading: ECGReading) => {
    setIsLoading(true);
    setError(null);

    const predictionId = `prediction-${Date.now()}`;
    const newPrediction: GeminiPrediction = {
      id: predictionId,
      prediction: '',
      timestamp: new Date().toISOString(),
      isLoading: true
    };

    setPredictions(prev => [newPrediction, ...prev].slice(0, 5)); // Keep last 5 predictions

    try {
      const prediction = await generateHealthPrediction(reading);
      
      setPredictions(prev => 
        prev.map(p => 
          p.id === predictionId 
            ? { ...p, prediction, isLoading: false }
            : p
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      
      setPredictions(prev => 
        prev.map(p => 
          p.id === predictionId 
            ? { ...p, error: errorMessage, isLoading: false }
            : p
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 card-enter">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Health Predictor</h2>
          <Sparkles className="h-5 w-5 text-yellow-500 ml-2" />
        </div>
        
        {latestReading && (
          <button
            onClick={() => handleAnalyze(latestReading)}
            disabled={isLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Analyze Current Reading
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-600 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {predictions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>No predictions yet. Click "Analyze Current Reading" to get AI insights.</p>
          </div>
        ) : (
          predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(prediction.timestamp).toLocaleString()}
                </span>
                {prediction.isLoading && (
                  <div className="flex items-center text-purple-600 dark:text-purple-400">
                    <Loader className="h-4 w-4 mr-1 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                )}
              </div>
              
              {prediction.isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-1/2"></div>
                </div>
              ) : prediction.error ? (
                <div className="text-red-600 dark:text-red-400 text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  {prediction.error}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{prediction.prediction}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Powered by Google Gemini AI • For educational purposes only
      </div>
    </div>
  );
};