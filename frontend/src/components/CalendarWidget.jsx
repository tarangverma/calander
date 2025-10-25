import { Box, Typography, IconButton, Paper } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarWidget = () => {
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = [
    [null, null, null, null, null, null, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, 29],
    [30, 31, null, null, null, null, null]
  ];

  const highlightedDates = [10, 11, 12, 13];
  const fadedDates = [21, 22, 28, 29];

  return (
    <Paper 
      elevation={3}
      sx={{ 
        backgroundColor: 'white',
        borderRadius: '20px',
        p: 3,
        width: { xs: '280px', md: '320px' },
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#FF9F43',
          fontWeight: 700,
          mb: 2,
          textAlign: 'center'
        }}
      >
        Make an Appointment
      </Typography>

      {/* Month Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <IconButton size="small">
          <ChevronLeft size={20} />
        </IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2C3E50' }}>
          September 2023
        </Typography>
        <IconButton size="small">
          <ChevronRight size={20} />
        </IconButton>
      </Box>

      {/* Days of Week */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1,
        mb: 1
      }}>
        {daysOfWeek.map((day, index) => (
          <Box 
            key={index}
            sx={{ 
              textAlign: 'center',
              color: index >= 5 ? '#FF9F43' : '#2C3E50',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* Calendar Dates */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1
      }}>
        {dates.flat().map((date, index) => {
          const isHighlighted = date && highlightedDates.includes(date);
          const isFaded = date && fadedDates.includes(date);
          
          return (
            <Box
              key={index}
              sx={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                backgroundColor: isHighlighted ? '#FF9F43' : 'transparent',
                color: isHighlighted ? 'white' : isFaded ? '#BDC3C7' : '#2C3E50',
                fontWeight: isHighlighted ? 700 : 500,
                fontSize: '0.875rem',
                cursor: date ? 'pointer' : 'default',
                transition: 'all 0.2s',
                '&:hover': date && !isHighlighted ? {
                  backgroundColor: '#FFF3E6'
                } : {}
              }}
            >
              {date || ''}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default CalendarWidget;