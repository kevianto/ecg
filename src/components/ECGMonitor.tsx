import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Wifi, WifiOff, Heart, Thermometer, Timer, User } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ECGReading, HealthAlert, Patient } from '../types';
import { analyzeHealthData, getAlertColor } from '../utils/healthAlerts';

interface ECGMonitorProps {
  selectedPatient?: Patient;
}

export const ECGMonitor: React.FC<ECGMonitorProps> = ({ selectedPatient }) => {
  const { data, connectionStatus, error, reconnect } = useWebSocket('wss://iot-584n.onrender.com');
  const [ecgHistory, setEcgHistory] = useState<(ECGReading & { time: string })[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (data) {
      const timeString = new Date(data.timestamp).toLocaleTimeString();
      const newReading = { ...data, time: timeString };
      
      setEcgHistory(prev => {
        const updated = [...prev, newReading].slice(-50); // Keep last 50 readings
        return updated;
      });
      
      setAlerts(analyzeHealthData(data));
      setLastUpdate(new Date());
    }
  }, [data]);

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'connecting':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>;
      default:
        return <WifiOff className="h-5 w-5 text-red-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 card-enter">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Real-time ECG Monitor</h2>
          </div>
          <div className="flex items-center space-x-4">
            {selectedPatient && (
              <div className="flex items-center bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-lg">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedPatient.name} ({selectedPatient.patientCode})
                </span>
              </div>
            )}
            <div className="flex items-center">
              {getConnectionIcon()}
              <span className={`ml-2 text-sm font-medium ${
                connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' : 
                connectionStatus === 'connecting' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {getConnectionText()}
              </span>
            </div>
            {connectionStatus === 'disconnected' && (
              <button
                onClick={reconnect}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
        
        {lastUpdate && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
        
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Current Vitals */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 card-enter">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Heart Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.bpm}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">BPM</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 card-enter">
            <div className="flex items-center">
              <Timer className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">RR Interval</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.rr}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ms</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 card-enter">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">HRV</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.hrv}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ms</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 card-enter">
            <div className="flex items-center">
              <Thermometer className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.temperature}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">°C</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 border ${getAlertColor(alert.severity)} card-enter`}
            >
              <p className="font-medium">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* ECG Graph */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 card-enter">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ECG Waveform</h3>
        <div className="h-64 ecg-grid">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ecgHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <Tooltip 
                labelFormatter={(value) => `Time: ${value}`}
                formatter={(value: any, name: string) => [value, name === 'ecg' ? 'ECG Value' : name]}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="ecg" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
                name="ECG"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};