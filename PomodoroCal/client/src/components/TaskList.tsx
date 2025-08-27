import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Search, MoreVertical } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const queryClient = useQueryClient();

  const { mutate: updateTask } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      apiRequest('PATCH', `/api/tasks/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  const toggleTaskCompletion = (task: Task) => {
    updateTask({
      id: task.id,
      updates: { completed: !task.completed }
    });
  };

  const getTaskItemClass = (task: Task) => {
    if (task.completed) return "task-item completed";
    if (!task.completed && task.pomodorosCompleted > 0) return "task-item active";
    return "task-item";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Task List{" "}
            <span className="text-muted-foreground font-normal" data-testid="text-task-count">
              ({tasks.length} Task{tasks.length !== 1 ? 's' : ''})
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" data-testid="button-search-tasks">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-task-menu">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className={getTaskItemClass(task)}>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleTaskCompletion(task)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-primary border-primary"
                      : !task.completed && task.pomodorosCompleted > 0
                      ? "bg-accent border-accent"
                      : "bg-muted border-border hover:border-primary"
                  }`}
                  data-testid={`button-toggle-task-${task.id}`}
                >
                  {task.completed && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                  {!task.completed && task.pomodorosCompleted > 0 && (
                    <div className="w-2 h-2 bg-accent-foreground rounded-full" />
                  )}
                </button>
                <div>
                  <div 
                    className={`font-medium ${
                      task.completed ? "line-through opacity-70" : ""
                    }`}
                    data-testid={`text-task-title-${task.id}`}
                  >
                    {task.title}
                  </div>
                  <div 
                    className={`text-sm ${
                      !task.completed && task.pomodorosCompleted > 0
                        ? "text-accent font-medium"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`text-task-pomodoros-${task.id}`}
                  >
                    Pomos {task.pomodorosCompleted}/{task.pomodorosRequired}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`button-task-options-${task.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
