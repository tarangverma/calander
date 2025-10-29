import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import { format } from 'date-fns';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

const EventDetails = ({ event, open, onClose, onEdit, onDelete, onResendInvites }) => {
  if (!event) return null;

  const formatDate = (date) => {
    return format(new Date(date), 'PPpp'); // e.g., "Apr 29, 2023, 5:00 PM"
  };

  const formatTime = (date) => {
    return format(new Date(date), 'p'); // e.g., "5:00 PM"
  };

  const getAttendeeStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'declined': return 'error';
      case 'invited': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" fontWeight="bold">
          {event.title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          {/* Date and Time Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
              Date & Time
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Start:</strong> {formatDate(event.start_time)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>End:</strong> {formatDate(event.end_time)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </Typography>
              {event.reminder_time && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Reminder set for:</strong> {formatDate(event.reminder_time)}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Location Section */}
          {event.location && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon fontSize="small" />
                  Location
                </Typography>
                <Typography variant="body1" sx={{ pl: 1 }}>
                  {event.location}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Attendees Section */}
          {event.attendees && event.attendees.length > 0 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon fontSize="small" />
                  Attendees ({event.attendees.length})
                </Typography>
                <Stack direction="row" spacing={1} sx={{ pl: 1, flexWrap: 'wrap', gap: 1 }}>
                  {event.attendees.map((attendee, index) => (
                    <Chip
                      key={index}
                      label={attendee.email}
                      size="small"
                      color={getAttendeeStatusColor(attendee.status)}
                      variant={attendee.status === 'pending' ? 'outlined' : 'filled'}
                      title={`Status: ${attendee.status || 'pending'}`}
                    />
                  ))}
                </Stack>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Description Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
              Description
            </Typography>
            <Typography 
              variant="body1" 
              paragraph 
              sx={{ 
                pl: 1,
                p: 1.5,
                backgroundColor: 'grey.50',
                borderRadius: 1,
                minHeight: '60px'
              }}
            >
              {event.description || 'No description provided'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onDelete} color="error" variant="outlined">
          Delete
        </Button>
        
        {/* Resend Invites Button - Only show if there are attendees */}
        {event.attendees && event.attendees.length > 0 && (
          <Button 
            onClick={onResendInvites}
            color="secondary"
            variant="outlined"
            startIcon={<EmailIcon />}
          >
            Resend Invites
          </Button>
        )}
        
        <Box sx={{ flex: 1 }} /> {/* Spacer */}
        
        <Button onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit} variant="contained" color="primary">
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDetails;