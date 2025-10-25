import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'transparent',
        color: '#2C3E50'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%',
              backgroundColor: '#FF9F43',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Calendar size={24} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: '#2C3E50',
                fontSize: '1.5rem'
              }}
            >
              Evently
            </Typography>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
            <Button 
              sx={{ 
                color: '#FF9F43',
                textTransform: 'none',
                fontWeight: 600,
                borderBottom: '2px solid #FF9F43',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              Home
            </Button>
          </Box>

          {/* Contact Button */}
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: '#FF9F43',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: '25px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#FF8C1A'
              }
            }}
          >
            Contact Us
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;