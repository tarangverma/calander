import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Link as MuiLink,
} from '@mui/material';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      navigate('/calendar');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/calendar');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE4C4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            backgroundColor: '#FFF8F0',
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(44, 62, 80, 0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 159, 67, 0.2)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#2C3E50',
                mb: 3,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              align="center"
              sx={{
                color: '#2C3E50',
                opacity: 0.8,
                mb: 3,
              }}
            >
              Log in to access your calendar and stay organized.
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                autoComplete="email"
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(255, 159, 67, 0.1)',
                  },
                  '& label.Mui-focused': { color: '#FF9F43' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#FF9F43',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                autoComplete="current-password"
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(255, 159, 67, 0.1)',
                  },
                  '& label.Mui-focused': { color: '#FF9F43' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#FF9F43',
                  },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.2,
                  background: 'linear-gradient(90deg, #FF9F43, #FF8C1A)',
                  fontWeight: 600,
                  color: '#2C3E50',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #FF8C1A, #FF9F43)',
                    boxShadow: '0 4px 12px rgba(255, 159, 67, 0.3)',
                  },
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                Don’t have an account?{' '}
                <MuiLink
                  component={Link}
                  to="/signup"
                  sx={{ color: '#FF9F43', fontWeight: 600 }}
                >
                  Sign up here
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
