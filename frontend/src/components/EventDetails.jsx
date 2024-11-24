import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
  } from '@mui/material';
  import { format } from 'date-fns';
  
  const EventDetails = ({ event, open, onClose, onEdit, onDelete }) => {
    if (!event) return null;
  
    const formatDate = (date) => {
      return format(new Date(date), 'PPpp'); // e.g., "Apr 29, 2023, 5:00 PM"
    };
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            {event.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Time
            </Typography>
            <Typography variant="body1" gutterBottom>
              Start: {formatDate(event.start_time)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              End: {formatDate(event.end_time)}
            </Typography>
            {event.reminder_time && (
              <Typography variant="body1" gutterBottom>
                Reminder: {formatDate(event.reminder_time)}
              </Typography>
            )}
  
            <Divider sx={{ my: 2 }} />
  
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {event.description || 'No description provided'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDelete} color="error">
            Delete
          </Button>
          <Button onClick={onEdit} color="primary">
            Edit
          </Button>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default EventDetails;