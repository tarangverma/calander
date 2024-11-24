import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { eventService } from '../services/api';
import EventForm from './EventForm';
import EventDetails from './EventDetails';
import toast from 'react-hot-toast';

const Calendar = () => {
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
      if (selectedEvent) {
        await eventService.updateEvent(selectedEvent.id, eventData);
        toast.success('Event updated successfully');
      } else {
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
    setSelectedEvent(null);
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

  return (
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
          eventClick={handleEventClick}
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
            !isDetailsOpen && setSelectedEvent(null);
          }}
          onSubmit={handleEventSubmit}
          event={selectedEvent}
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
  );
};

export default Calendar;