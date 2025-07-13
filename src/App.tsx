import React, { useState, useEffect } from 'react';
import { Monitor, Users, BarChart3, Brain } from 'lucide-react';
import { PatientRegistration } from './components/PatientRegistration';
import { ECGMonitor } from './components/ECGMonitor';
import { ECGHistory } from './components/ECGHistory';
import { GeminiPredictor } from './components/GeminiPredictor';
import { DarkModeToggle } from './components/DarkModeToggle';
import { useWebSocket } from './hooks/useWebSocket';
import { Patient } from './types';

type TabType = 'registration' | 'monitor' | 'history' | 'predictor';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('registration');
  const [registeredPatients, setRegisteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { data: latestReading } = useWebSocket('wss://iot-584n.onrender.com');

  useEffect(() => {
    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handlePatientRegistered = (patient: Patient) => {
    setRegisteredPatients(prev => [...prev, patient]);
    setSelectedPatient(patient);
    // Auto-switch to monitor tab after registration
    setTimeout(() => setActiveTab('monitor'), 2000);
  };

  const tabs = [
    { id: 'registration' as TabType, label: 'Patient Registration', icon: Users },
    { id: 'monitor' as TabType, label: 'Live Monitor', icon: Monitor },
    { id: 'history' as TabType, label: 'History', icon: BarChart3 },
    { id: 'predictor' as TabType, label: 'AI Predictor', icon: Brain },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ECG Monitor Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time cardiac monitoring system</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {registeredPatients.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedPatient?.id || ''}
                    onChange={(e) => {
                      const patient = registeredPatients.find(p => p.id === e.target.value);
                      setSelectedPatient(patient);
                    }}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Patient</option>
                    {registeredPatients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.patientCode})
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {registeredPatients.length} patient{registeredPatients.length !== 1 ? 's' : ''} registered
                  </div>
                </div>
              )}
              <DarkModeToggle 
                isDark={isDarkMode} 
                onToggle={() => setIsDarkMode(!isDarkMode)} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'registration' && (
          <PatientRegistration onPatientRegistered={handlePatientRegistered} />
        )}
        
        {activeTab === 'monitor' && (
          <ECGMonitor selectedPatient={selectedPatient} />
        )}
        
        {activeTab === 'history' && (
          <ECGHistory patients={registeredPatients} />
        )}
        
        {activeTab === 'predictor' && (
          <GeminiPredictor 
            latestReading={latestReading} 
            autoAnalyze={false}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            ECG Monitor Dashboard • Real-time cardiac monitoring with AI predictions
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;