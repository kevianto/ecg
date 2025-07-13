export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  patientCode: string;
  createdAt: string;
}

export interface ECGReading {
  id?: string;
  ecg: number;
  bpm: number;
  rr: number;
  hrv: number;
  temperature: number;
  timestamp: string;
  patientCode?: string;
}

export interface HealthAlert {
  type: 'tachycardia' | 'bradycardia' | 'fever' | 'normal';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface GeminiPrediction {
  id: string;
  prediction: string;
  timestamp: string;
  isLoading: boolean;
  error?: string;
}