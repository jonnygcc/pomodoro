import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Settings } from "lucide-react";

interface ControlsProps {
  timerState?: 'idle' | 'running' | 'paused' | 'finished';
  onToggleTimer?: () => void;
  onResetTimer?: () => void;
  onOpenSettings?: () => void;
}

export function Controls({ 
  timerState = 'idle', 
  onToggleTimer = () => {}, 
  onResetTimer = () => {},
  onOpenSettings = () => {}
}: ControlsProps) {
  const getButtonIcon = () => {
    if (timerState === 'running') {
      return <Pause className="h-4 w-4" />;
    }
    return <Play className="h-4 w-4" />;
  };

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
    <div className="flex items-center justify-center space-x-4 mt-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={onResetTimer}
        title="Reset Timer"
        data-testid="button-reset-timer"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>
      
      <Button
        onClick={onToggleTimer}
        className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 flex items-center space-x-2"
        data-testid="button-toggle-timer"
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSettings}
        title="Settings"
        data-testid="button-settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
}
