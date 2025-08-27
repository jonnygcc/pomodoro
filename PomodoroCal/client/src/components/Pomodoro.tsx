import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { formatTime, requestNotificationPermission, showNotification } from "@/lib/time";
import { apiRequest } from "@/lib/queryClient";
import type { SessionType, TimerState, Task } from "@shared/schema";

interface PomodoroProps {
  currentTask?: Task;
}

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

export function Pomodoro({ currentTask }: PomodoroProps) {
  const queryClient = useQueryClient();
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [settings, setSettings] = useState<TimerSettings>({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  });

  const { mutate: createFocusBlock } = useMutation({
    mutationFn: (data: { title: string; minutes: number; taskId?: string }) =>
      apiRequest('POST', '/api/focus-block', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/next-events'] });
    }
  });

  const { mutate: updateTask } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      apiRequest('PATCH', `/api/tasks/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  // Request notification permission on first mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerState('finished');
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState, timeRemaining]);

  // Reset timer when session type changes
  useEffect(() => {
    const duration = settings[sessionType] * 60;
    setTimeRemaining(duration);
    setTimerState('idle');
  }, [sessionType, settings]);

  const handleTimerComplete = useCallback(() => {
    const sessionName = sessionType === 'pomodoro' ? 'Pomodoro' :
                       sessionType === 'shortBreak' ? 'Short Break' : 'Long Break';
    
    showNotification(
      `${sessionName} Complete!`,
      sessionType === 'pomodoro' ? 'Time for a break!' : 'Ready to focus?'
    );

    // Update task pomodoros if it's a pomodoro session
    if (sessionType === 'pomodoro' && currentTask) {
      updateTask({
        id: currentTask.id,
        updates: {
          pomodorosCompleted: currentTask.pomodorosCompleted + 1,
          completed: currentTask.pomodorosCompleted + 1 >= currentTask.pomodorosRequired
        }
      });
    }
  }, [sessionType, currentTask, updateTask]);

  const toggleTimer = () => {
    if (timerState === 'idle' || timerState === 'paused') {
      // Create focus block when starting a pomodoro
      if (timerState === 'idle' && sessionType === 'pomodoro') {
        const taskTitle = currentTask?.title || 'Focus Session';
        createFocusBlock({
          title: taskTitle,
          minutes: Math.ceil(timeRemaining / 60),
          taskId: currentTask?.id
        });
      }
      setTimerState('running');
    } else if (timerState === 'running') {
      setTimerState('paused');
    }
  };

  const resetTimer = () => {
    setTimerState('idle');
    setTimeRemaining(settings[sessionType] * 60);
  };

  const adjustSetting = (type: keyof TimerSettings, delta: number) => {
    setSettings(prev => ({
      ...prev,
      [type]: Math.max(1, Math.min(60, prev[type] + delta))
    }));
  };

  // Calculate progress for the circular timer
  const totalTime = settings[sessionType] * 60;
  const progress = ((totalTime - timeRemaining) / totalTime) * 283; // 283 is circumference
  const strokeDashoffset = 283 - progress;

  const getButtonText = () => {
    switch (timerState) {
      case 'idle': return 'Start';
      case 'running': return 'Pause';
      case 'paused': return 'Resume';
      case 'finished': return 'Start';
      default: return 'Start';
    }
  };

  return (
    <div className="space-y-8">
      {/* Session Type Tabs */}
      <Tabs value={sessionType} onValueChange={(value) => setSessionType(value as SessionType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pomodoro" data-testid="tab-pomodoro">All</TabsTrigger>
          <TabsTrigger value="shortBreak" data-testid="tab-short-break">Short Break</TabsTrigger>
          <TabsTrigger value="longBreak" data-testid="tab-long-break">Long Break</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Circular Timer */}
      <div className="flex flex-col items-center space-y-8">
        <div className="relative w-80 h-80">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              className="timer-circle transition-all duration-1000"
              data-testid="timer-progress-circle"
            />
          </svg>
          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-light text-foreground" data-testid="text-timer-display">
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Current Task Display */}
        <div className="text-center">
          <div className="text-lg font-medium text-foreground mb-2" data-testid="text-current-task">
            {currentTask ? `#${currentTask.pomodorosCompleted + 1} - ${currentTask.title}` : 'No active task'}
          </div>
        </div>
      </div>

      {/* Custom Timer Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground text-center">
          Custom Timer (Minutes)
        </h4>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-sm text-muted-foreground mb-2 capitalize">
                {key === 'pomodoro' ? 'Pomodoro' : key === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => adjustSetting(key as keyof TimerSettings, -1)}
                  data-testid={`button-decrease-${key}`}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span 
                  className="font-medium text-foreground w-8 text-center"
                  data-testid={`text-${key}-minutes`}
                >
                  {value}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => adjustSetting(key as keyof TimerSettings, 1)}
                  data-testid={`button-increase-${key}`}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
