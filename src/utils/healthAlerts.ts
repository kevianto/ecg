import { ECGReading, HealthAlert } from '../types';

export const analyzeHealthData = (reading: ECGReading): HealthAlert[] => {
  const alerts: HealthAlert[] = [];

  // Check for tachycardia (high heart rate)
  if (reading.bpm > 100) {
    alerts.push({
      type: 'tachycardia',
      message: `High heart rate detected: ${reading.bpm} BPM (Normal: 60-100)`,
      severity: reading.bpm > 120 ? 'high' : 'medium'
    });
  }

  // Check for bradycardia (low heart rate)
  if (reading.bpm < 60) {
    alerts.push({
      type: 'bradycardia',
      message: `Low heart rate detected: ${reading.bpm} BPM (Normal: 60-100)`,
      severity: reading.bpm < 40 ? 'high' : 'medium'
    });
  }

  // Check for fever
  if (reading.temperature > 37.5) {
    alerts.push({
      type: 'fever',
      message: `Elevated temperature: ${reading.temperature}°C (Normal: <37.5°C)`,
      severity: reading.temperature > 39 ? 'high' : 'medium'
    });
  }

  // If no alerts, return normal status
  if (alerts.length === 0) {
    alerts.push({
      type: 'normal',
      message: 'All vital signs within normal range',
      severity: 'low'
    });
  }

  return alerts;
};

export const getAlertColor = (severity: string): string => {
  switch (severity) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};