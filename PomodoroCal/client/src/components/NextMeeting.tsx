import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Lightbulb } from "lucide-react";
import { formatTimeUntil } from "@/lib/time";
import type { CalendarEvent } from "@shared/schema";

interface NextMeetingProps {
  nextMeeting?: CalendarEvent;
  smartAdjustSuggestion?: {
    originalMeeting: CalendarEvent;
    suggestedDuration: number;
    reason: string;
  };
}

export function NextMeeting({ nextMeeting, smartAdjustSuggestion }: NextMeetingProps) {
  if (!nextMeeting) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Next Meeting</h3>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming meetings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const meetingTime = new Date(nextMeeting.start.dateTime || nextMeeting.start.date!);
  const timeUntil = formatTimeUntil(meetingTime);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Next Meeting</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-3 h-3 bg-accent rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-foreground" data-testid="text-meeting-title">
                  {nextMeeting.summary}
                </div>
                <div className="text-sm text-muted-foreground" data-testid="text-meeting-time">
                  {timeUntil} ({meetingTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })})
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {smartAdjustSuggestion && (
        <Card className="border" style={{backgroundColor: 'hsl(var(--accent) / 0.1)', borderColor: 'hsl(var(--accent) / 0.2)'}}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <Lightbulb className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">Smart Adjust Recommended</h4>
                <p className="text-sm text-muted-foreground mb-3" data-testid="text-smart-adjust-suggestion">
                  {smartAdjustSuggestion.suggestedDuration === 0
                    ? "Your next meeting starts very soon. Consider taking a break instead."
                    : `Adjust your Pomodoro to ${smartAdjustSuggestion.suggestedDuration} minutes to ${smartAdjustSuggestion.reason}.`
                  }
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    data-testid="button-accept-smart-adjust"
                  >
                    {smartAdjustSuggestion.suggestedDuration === 0 ? "Take Break" : "Adjust Timer"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid="button-dismiss-smart-adjust"
                  >
                    Keep Current
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}