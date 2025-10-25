import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Footprints, Twitter, Linkedin, Github } from 'lucide-react';
import Header from './Header';
import CalendarWidget from './CalendarWidget';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFF8F0' }}>
      <Header />
      
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'calc(100vh - 80px)',
          py: 4,
          gap: 4,
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Left Content */}
          <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '50%' } }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#FF9F43',
                fontWeight: 600,
                letterSpacing: '1px',
                mb: 2,
                display: 'block'
              }}
            >
              We Care
            </Typography>
            
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                color: '#2C3E50',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2
              }}
            >
              Your Schedule is Our Priority
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#7F8C8D',
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              At our center, we prioritize your events and schedules above all else.
              Your joy and well-being are at the heart of everything we do.
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: '#FF9F43',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: '25px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#FF8C1A'
                  }
                }}
              >
                Make an Appointment
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/signup')}
                sx={{
                  borderColor: '#FF9F43',
                  color: '#FF9F43',
                  px: 4,
                  py: 1.5,
                  borderRadius: '25px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#FF8C1A',
                    backgroundColor: 'rgba(255, 159, 67, 0.1)'
                  }
                }}
              >
                Book a Services
              </Button>
            </Stack>
            
            {/* Social Media Icons */}
            <Stack direction="row" spacing={2}>
              <Box 
                component="a" 
                href="https://www.linkedin.com/in/tarang-verma-33324121a/" 
                sx={{ 
                  color: '#2C3E50',
                  transition: 'color 0.3s',
                  '&:hover': { color: '#FF9F43' }
                }}
              >
                <Linkedin size={24} />
              </Box>
              <Box 
                component="a" 
                href="https://github.com/tarangverma" 
                sx={{ 
                  color: '#2C3E50',
                  transition: 'color 0.3s',
                  '&:hover': { color: '#FF9F43' }
                }}
              >
                <Github size={24} />
              </Box>
              <Box 
                component="a" 
                href="https://twitter.com/TarangVerma19" 
                sx={{ 
                  color: '#2C3E50',
                  transition: 'color 0.3s',
                  '&:hover': { color: '#FF9F43' }
                }}
              >
                <Twitter size={24} />
              </Box>
            </Stack>
          </Box>

          {/* Right Content - Images and Calendar */}
          <Box sx={{ 
            flex: 1, 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: { xs: '100%', md: '50%' }
          }}>
            {/* Decorative Paw Prints */}
            <Box sx={{ 
              position: 'absolute',
              top: '10%',
              left: '15%',
              color: '#FFE4C4',
              opacity: 0.6,
              transform: 'rotate(-15deg)'
            }}>
              <Footprints size={60} />
            </Box>
            
            {/* Cat Image */}
            <Box sx={{
              position: 'absolute',
              top: -40,
              right: '10%',
              width: { xs: '150px', md: '200px' },
              height: { xs: '150px', md: '200px' },
              borderRadius: '50% 50% 0 50%',
              backgroundColor: '#FFD4A3',
              overflow: 'hidden',
              zIndex: 2
            }}>
              <img 
                src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1332"
                alt="Adorable orange tabby kitten - The3dragons on Unsplash"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>

            {/* Pug Image */}
            <Box sx={{
              position: 'relative',
              width: { xs: '250px', md: '350px' },
              height: { xs: '250px', md: '350px' },
              mt: { xs: 20, md: 25 },
              ml: { xs: 0, md: -30 }
            }}>
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNvcnBvcmF0ZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"
                alt="Cheerful pug dog - Diana Parkhouse on Unsplash"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
              />
            </Box>

            {/* Calendar Widget */}
            <Box sx={{
              position: 'absolute',
              bottom: { xs: -50, md: 0 },
              right: { xs: '5%', md: '-5%' },
              zIndex: 3
            }}>
              <CalendarWidget />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Landing;