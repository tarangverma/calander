import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import toast from 'react-hot-toast';

const EventForm = ({ open, onClose, onSubmit, event = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: new Date(),
    end_time: new Date(),
    reminder_time: new Date(),
  });

  // Reset form data when event prop changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_time: new Date(event.start_time),
        end_time: new Date(event.end_time),
        reminder_time: event.reminder_time ? new Date(event.reminder_time) : new Date(),
      });
    } else {
      // Reset form for new event
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData({
        title: '',
        description: '',
        start_time: now,
        end_time: oneHourLater,
        reminder_time: now,
      });
    }
  }, [event, open]);

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }

    if (formData.end_time <= formData.start_time) {
      toast.error('End time must be after start time');
      return false;
    }

    if (formData.reminder_time >= formData.start_time) {
      toast.error('Reminder time must be before start time');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(event ? 'Event updated successfully' : 'Event created successfully');
      onClose();
    } catch (error) {
      console.error('Event form error:', error);
      toast.error(error.response?.data?.error || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { overflowY: 'visible' }
      }}
    >
      <DialogTitle>
        {event ? 'Edit Event' : 'Create Event'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ overflowY: 'visible' }}>
          <Stack spacing={3}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              fullWidth
              error={!formData.title.trim()}
              helperText={!formData.title.trim() ? 'Title is required' : ''}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={4}
              fullWidth
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Time"
                value={formData.start_time}
                onChange={(newValue) => {
                  if (newValue) {
                    setFormData({ ...formData, start_time: newValue });
                  }
                }}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
              <DateTimePicker
                label="End Time"
                value={formData.end_time}
                onChange={(newValue) => {
                  if (newValue) {
                    setFormData({ ...formData, end_time: newValue });
                  }
                }}
                minDateTime={formData.start_time}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
              <DateTimePicker
                label="Reminder Time"
                value={formData.reminder_time}
                onChange={(newValue) => {
                  if (newValue) {
                    setFormData({ ...formData, reminder_time: newValue });
                  }
                }}
                maxDateTime={formData.start_time}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : event ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventForm;