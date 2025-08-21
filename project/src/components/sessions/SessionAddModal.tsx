import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Calendar as CalendarIcon, Users, Clock, BookOpen, CheckCircle } from 'lucide-react';
// Update the import path below to the correct location of your Calendar component, or install one if missing
import { Calendar } from 'react-calendar';
// If you don't have 'react-calendar', install it with: npm install react-calendar
import 'react-calendar/dist/Calendar.css';

// Custom styles for the calendar
const calendarStyle = `
  .modern-calendar {
    border: none !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
    font-family: inherit !important;
  }
  
  .modern-calendar .react-calendar__navigation {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
    border-radius: 12px 12px 0 0 !important;
    padding: 12px !important;
    margin-bottom: 0 !important;
  }
  
  .modern-calendar .react-calendar__navigation button {
    color: white !important;
    background: none !important;
    border: none !important;
    font-weight: 600 !important;
    padding: 8px 12px !important;
    border-radius: 8px !important;
    transition: all 0.2s ease !important;
  }
  
  .modern-calendar .react-calendar__navigation button:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
  
  .modern-calendar .react-calendar__month-view__weekdays {
    background: #f8fafc !important;
    padding: 8px 0 !important;
  }
  
  .modern-calendar .react-calendar__month-view__weekdays__weekday {
    color: #64748b !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    font-size: 12px !important;
  }
  
  .modern-calendar .react-calendar__tile {
    background: none !important;
    border: none !important;
    padding: 12px 8px !important;
    color: #374151 !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
    border-radius: 8px !important;
    margin: 2px !important;
  }
  
  .modern-calendar .react-calendar__tile:hover {
    background: #e0e7ff !important;
    color: #3730a3 !important;
  }
  
  .modern-calendar .react-calendar__tile--active {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
    color: white !important;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
  }
  
  .modern-calendar .react-calendar__tile--now {
    background: #fef3c7 !important;
    color: #92400e !important;
    font-weight: 600 !important;
  }
  
  .modern-calendar .react-calendar__tile--now:hover {
    background: #fde68a !important;
    color: #78350f !important;
  }
`;

// Mock learners for selection
const learners = [
  { id: '1', name: 'Emma Johnson' },
  { id: '2', name: 'Liam Chen' },
  { id: '3', name: 'Sophia Davis' },
  { id: '4', name: 'Noah Wilson' },
];

const activities = [
  'Speech Therapy',
  'Occupational Therapy',
  'Behavioral Session',
  'Social Skills',
  'Sensory Play',
];

export interface SessionAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (session: any) => void;
}

export const SessionAddModal: React.FC<SessionAddModalProps> = ({ open, onClose, onAdd }) => {
  const [step, setStep] = React.useState(0);
  const [selectedLearner, setSelectedLearner] = React.useState<string | null>(null);
  const [date, setDate] = React.useState<Date | null>(null);
  const [time, setTime] = React.useState('');
  const [selectedActivities, setSelectedActivities] = React.useState<string[]>([]);

  const today = new Date();
  today.setHours(0,0,0,0);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);
  const handleAdd = () => {
    if (selectedLearner && date && time && selectedActivities.length > 0) {
      onAdd({
        learner: learners.find(l => l.id === selectedLearner)?.name,
        date: date.toISOString().split('T')[0],
        time,
        activities: selectedActivities,
      });
      setStep(0);
      setSelectedLearner(null);
      setDate(null);
      setTime('');
      setSelectedActivities([]);
      onClose();
    }
  };

  const stepTitles = [
    { icon: Users, title: 'Select Learner', subtitle: 'Choose who this session is for' },
    { icon: CalendarIcon, title: 'Schedule Session', subtitle: 'Pick date and time' },
    { icon: BookOpen, title: 'Choose Activities', subtitle: 'Select therapy activities' }
  ];

  return (
    <>
      <style>{calendarStyle}</style>
      <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              {React.createElement(stepTitles[step].icon, { className: "h-6 w-6" })}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {stepTitles[step].title}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">{stepTitles[step].subtitle}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </DialogHeader>
        {/* Step 1: Select Learner */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 gap-3">
              {learners.map(learner => (
                <Button
                  key={learner.id}
                  variant={selectedLearner === learner.id ? 'default' : 'outline'}
                  className={`p-4 h-auto justify-start text-left transition-all duration-200 ${
                    selectedLearner === learner.id 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-50 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedLearner(learner.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      selectedLearner === learner.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700'
                    }`}>
                      {learner.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium">{learner.name}</span>
                  </div>
                </Button>
              ))}
            </div>
            <DialogFooter>
              <Button 
                onClick={handleNext} 
                disabled={!selectedLearner}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8"
              >
                Continue
              </Button>
            </DialogFooter>
          </div>
        )}
        {/* Step 2: Select Date & Time */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="space-y-4">
              <div className="calendar-container">
                <Calendar
                  value={date}
                  onChange={value => {
                    if (value instanceof Date) {
                      setDate(value);
                    } else if (Array.isArray(value) && value[0] instanceof Date) {
                      setDate(value[0]);
                    } else {
                      setDate(null);
                    }
                  }}
                  minDate={today}
                  className="modern-calendar w-full rounded-xl border border-gray-200 shadow-sm"
                />
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Select Time</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    min="08:00"
                    max="18:00"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border">8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleBack} className="px-6">
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!date || !time}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8"
              >
                Continue
              </Button>
            </DialogFooter>
          </div>
        )}
        {/* Step 3: Select Activities */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 gap-3">
              {activities.map(activity => (
                <Button
                  key={activity}
                  variant={selectedActivities.includes(activity) ? 'default' : 'outline'}
                  className={`p-4 h-auto justify-start text-left transition-all duration-200 ${
                    selectedActivities.includes(activity) 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-50 hover:border-green-300'
                  }`}
                  onClick={() => setSelectedActivities(prev => 
                    prev.includes(activity) 
                      ? prev.filter(a => a !== activity) 
                      : [...prev, activity]
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedActivities.includes(activity) 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700'
                      }`}>
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{activity}</span>
                    </div>
                    {selectedActivities.includes(activity) && (
                      <CheckCircle className="h-5 w-5 text-white" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            {selectedActivities.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700 font-medium">
                  {selectedActivities.length} activit{selectedActivities.length === 1 ? 'y' : 'ies'} selected
                </p>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={handleBack} className="px-6">
                Back
              </Button>
              <Button 
                onClick={handleAdd} 
                disabled={selectedActivities.length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8"
              >
                Create Session
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
