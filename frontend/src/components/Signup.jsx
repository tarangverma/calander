import { useState } from 'react';
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

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateForm = () => {
    const newErrors = {
      email: !formData.email || !/\S+@\S+\.\S+/.test(formData.email),
      password: !formData.password || formData.password.length < 6,
      confirmPassword: formData.password !== formData.confirmPassword,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please check your input');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
      });
      toast.success('Registration successful!');
      navigate('/calendar');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
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
                mb: 2,
              }}
            >
              Create an Account
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
              Join us today and get access to your personalized calendar.
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
                error={errors.email}
                helperText={errors.email && 'Invalid email format'}
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
                autoComplete="new-password"
                error={errors.password}
                helperText={
                  errors.password &&
                  'Password must be at least 6 characters long'
                }
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
                label="Confirm Password"
                type="password"
                margin="normal"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                autoComplete="new-password"
                error={errors.confirmPassword}
                helperText={errors.confirmPassword && 'Passwords do not match'}
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
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                Already have an account?{' '}
                <MuiLink
                  component={Link}
                  to="/login"
                  sx={{ color: '#FF9F43', fontWeight: 600 }}
                >
                  Login here
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Signup;
