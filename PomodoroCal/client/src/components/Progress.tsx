import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProgressProps {
  completedTasks: number;
  totalTasks: number;
  progressPercentage: number;
}

export function Progress({ completedTasks, totalTasks, progressPercentage }: ProgressProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Daily Progress</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Badge variant="default" className="bg-accent text-accent-foreground" data-testid="badge-task-count">
              {completedTasks}/{totalTasks}
            </Badge>
            <span className="text-muted-foreground">Tasks was done</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground" data-testid="text-current-date">
              {currentDate}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium" data-testid="text-progress-percentage">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-accent h-3 rounded-full transition-all duration-500 progress-circle"
              style={{ width: `${progressPercentage}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
