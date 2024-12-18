import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, AppBar, Toolbar } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { eventService } from '../services/api';
import EventForm from './EventForm';
import EventDetails from './EventDetails';
import toast from 'react-hot-toast';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const Calendar = () => {
  const {logout} = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch events when component mounts
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents();
      // Transform the events data to match FullCalendar's format
      const formattedEvents = response.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        description: event.description,
        reminder_time: event.reminder_time,
        // Add any additional fields you need
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventSubmit = async (eventData) => {
    try {
      // Check if it's a new event by checking for isNew flag
      if (selectedEvent && !selectedEvent.isNew) {
        // This is an update operation
        await eventService.updateEvent(selectedEvent.id, eventData);
        toast.success('Event updated successfully');
      } else {
        // This is a create operation
        await eventService.createEvent(eventData);
        toast.success('Event created successfully');
      }
      await fetchEvents(); // Refresh the events list
      setIsFormOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Event submission error:', error);
      toast.error(error.response?.data?.error || 'Failed to save event');
    }
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      description: event.extendedProps.description,
      start_time: event.start,
      end_time: event.end,
      reminder_time: event.extendedProps.reminder_time,
    });
    setIsDetailsOpen(true);
  };

  const handleDateSelect = (selectInfo) => {
    console.log('Date selected:', selectInfo);

    // Get the selected date
    const selectedDate = new Date(selectInfo.start);
    
    // Check if there are any events on this date
    const existingEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === selectedDate.toDateString();
    });

    if (existingEvents.length > 0) {
      toast.info('Events already exist on this date. Please select another date or edit existing events.');
      return;
    }
    
    // Set default times for the selected date (9 AM - 10 AM)
    const startTime = new Date(selectedDate);
    startTime.setHours(9, 0, 0);
    
    const endTime = new Date(selectedDate);
    endTime.setHours(10, 0, 0);
    
    const reminderTime = new Date(startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30);

    // Create a new empty event with just the times
    const newEvent = {
      title: '',
      description: '',
      start_time: startTime,
      end_time: endTime,
      reminder_time: reminderTime,
      isNew: true
    };

    setSelectedEvent(newEvent);
    setIsFormOpen(true);
  };

  const handleEventDelete = async () => {
    if (!selectedEvent) return;

    try {
      await eventService.deleteEvent(selectedEvent.id);
      toast.success('Event deleted successfully');
      await fetchEvents();
      setIsDetailsOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleEditClick = () => {
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">Calendar App</Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedEvent(null);
              setIsFormOpen(true);
            }}
            sx={{ mb: 2 }}
          >
            Create Event
          </Button>

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            selectConstraint={{
              start: new Date().toISOString()
            }}
            eventContent={(eventInfo) => (
              <Box sx={{ 
                p: '2px 4px', 
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 }
              }}>
                <Typography variant="subtitle2" noWrap>
                  {eventInfo.event.title}
                </Typography>
                {eventInfo.timeText && (
                  <Typography variant="caption" display="block">
                    {eventInfo.timeText}
                  </Typography>
                )}
              </Box>
            )}
          />

          {/* Event Form Dialog */}
          <EventForm
            open={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedEvent(null);
            }}
            onSubmit={handleEventSubmit}
            event={selectedEvent}
            isNewEvent={!selectedEvent?.id}
          />

          {/* Event Details Dialog */}
          <EventDetails
            open={isDetailsOpen}
            event={selectedEvent}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedEvent(null);
            }}
            onEdit={handleEditClick}
            onDelete={handleEventDelete}
          />
        </Box>
      </Container>
    </>
  );
};

export default Calendar;