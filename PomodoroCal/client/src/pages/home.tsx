import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Bell, ChevronDown, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/Progress";
import { TaskList } from "@/components/TaskList";
import { NextMeeting } from "@/components/NextMeeting";
import { Pomodoro } from "@/components/Pomodoro";
import { Controls } from "@/components/Controls";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const queryClient = useQueryClient();

  // Auto-login for demo
  const { mutate: login } = useMutation({
    mutationFn: () => apiRequest('POST', '/api/login', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    }
  });

  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    select: (data: any) => data
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: !!user?.authenticated
  });

  const { data: calendarData } = useQuery({
    queryKey: ['/api/next-events'],
    refetchInterval: 60000, // Refresh every minute
    enabled: !!user?.authenticated
  });

  useEffect(() => {
    if (!user?.authenticated) {
      login();
    }
  }, [user, login]);

  const taskList = Array.isArray(tasks) ? tasks : [];
  const completedTasks = taskList.filter((task: any) => task.completed).length;
  const totalTasks = taskList.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const currentTask = taskList.find((task: any) => !task.completed && task.pomodorosCompleted > 0);
  const completedPomodoros = taskList.reduce((sum: number, task: any) => sum + task.pomodorosCompleted, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground" data-testid="app-title">
              Alegra Time
            </h1>
            <span className="text-sm text-muted-foreground">Calendar-Aware Pomodoro</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search..."
                className="w-64"
                data-testid="input-search"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center" data-testid="avatar-user">
                <span className="text-accent-foreground text-sm font-medium">JD</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* Daily Progress */}
            <Progress
              completedTasks={completedTasks}
              totalTasks={totalTasks}
              progressPercentage={progressPercentage}
            />

            {/* Task List */}
            <TaskList tasks={taskList} />

            {/* Next Meeting */}
            <NextMeeting
              nextMeeting={calendarData?.nextMeeting}
              smartAdjustSuggestion={calendarData?.smartAdjustSuggestion}
            />
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Timer Interface */}
            <Card>
              <CardContent className="p-6">
                <Pomodoro currentTask={currentTask} />
                <Controls />
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary" data-testid="text-completed-pomodoros">
                      {completedPomodoros}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-accent" data-testid="text-focus-time">
                      {Math.floor(completedPomodoros * 25 / 60)}h {(completedPomodoros * 25) % 60}m
                    </div>
                    <div className="text-sm text-muted-foreground">Focus Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
