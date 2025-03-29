import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { Card } from "@mantine/core";

export function EventCalendar({
  data,
  getLunarDate,
  onDateClick,
}: {
  data: any[];
  getLunarDate: (date: Date) => string;
  onDateClick: (info: DateClickArg) => void;
}) {
  return (
    <Card padding="md" radius="md" withBorder>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={viLocale}
        headerToolbar={{
          left: "prev",
          center: "title",
          right: "next",
        }}
        selectable
        selectMirror
        events={data.map((event) => ({
          title: event.event.eventName,
          start: event.event.startDate,
          color: "#FBBF24",
        }))}
        dayCellContent={(arg) => (
          <div>
            <span>{arg.dayNumberText}</span>
            <br />
            <span style={{ fontSize: "0.7em", color: "#E76F51" }}>
              {getLunarDate(arg.date)}
            </span>
          </div>
        )}
        dateClick={onDateClick}
        height="350px"
        contentHeight="auto"
      />
    </Card>
  );
}
