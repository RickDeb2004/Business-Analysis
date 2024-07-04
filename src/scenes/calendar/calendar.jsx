import { useState, useEffect } from "react";
import FullCalendar, { formatDate } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { database, auth } from "../../firebase";
import { ref, set, get, remove } from "firebase/database";
import EventDialog from "../../components/EventDialouge"; // Adjust the import path if necessary
import GradientBox from "../../components/GradientBox";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const user = auth.currentUser;

  // Fetch events from Firebase when the component mounts
  useEffect(() => {
    if (user) {
      const fetchEvents = async () => {
        const eventsRef = ref(database, `events/${user.uid}`);
        const snapshot = await get(eventsRef);
        if (snapshot.exists()) {
          const events = Object.values(snapshot.val());
          setCurrentEvents(events);
        }
      };
      fetchEvents();
    }
  }, [user]);

  // Add event to Firebase
  const addEventToFirebase = async (event) => {
    if (user) {
      const eventRef = ref(database, `events/${user.uid}/${event.id}`);
      await set(eventRef, event);
    }
  };

  // Remove event from Firebase
  const removeEventFromFirebase = async (eventId) => {
    if (user) {
      const eventRef = ref(database, `events/${user.uid}/${eventId}`);
      await remove(eventRef);
    }
  };

  // Handle date click
  const handleDateClick = (selected) => {
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const handleSaveEvent = (title) => {
    const calendarApi = selectedDate.view.calendar;
    calendarApi.unselect();

    if (title) {
      const newEvent = {
        id: `${selectedDate.dateStr}-${title}`,
        title,
        start: selectedDate.startStr,
        end: selectedDate.endStr,
        allDay: selectedDate.allDay,
      };
      calendarApi.addEvent(newEvent);
      addEventToFirebase(newEvent);
    }

    setIsDialogOpen(false);
  };

  // Handle event click
  const handleEventClick = (selected) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${selected.event.title}'`
      )
    ) {
      const eventId = selected.event.id;
      selected.event.remove();
      removeEventFromFirebase(eventId);
    }
  };

  return (
    <Box m="20px">
      <Header title="Calendar" subtitle="Full Calendar Interactive Page" />

      <Box display="flex" justifyContent="space-between">
        {/* CALENDAR SIDEBAR */}
        <Box
          flex="1 1 20%"
          backgroundColor="#0A0A0A"
          p="15px"
          borderRadius="4px"
          sx={{
            border: `1px solid ${colors.purpleAccent[600]}`,
            boxShadow: `0 0 3px ${colors.purpleAccent[600]}`,
          }}
        >
          <Typography variant="h5">Events</Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  backgroundColor: `linear-gradient(135deg, ${colors.tealAccent[600]} 30%, ${colors.greenAccent[600]} 100%)`,
                  margin: "10px 0",
                  border: `2px solid ${colors.tealAccent[600]}`,
                  boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Typography>
                      {formatDate(event.start, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* CALENDAR */}
        <Box
          flex="1 1 100%"
          ml="15px"
          sx={{
            border: `2px solid ${colors.tealAccent[600]}`,
            boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
          }}
        >
          <FullCalendar
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            initialEvents={currentEvents}
          />
        </Box>
      </Box>

      {/* Event Dialog */}
      <EventDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveEvent}
      />
    </Box>
  );
};

export default Calendar;
