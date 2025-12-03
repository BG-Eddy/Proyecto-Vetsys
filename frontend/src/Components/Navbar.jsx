import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets'; 
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Función para saber si un botón está activo
  const isActive = (path) => location.pathname === path;

  // Estilo  para botones
  const navButtonStyle = (path) => ({
    color: 'white',
    mx: 0.5,
    borderRadius: '20px',
    backgroundColor: isActive(path) ? 'rgba(255,255,255,0.2)' : 'transparent',
    border: isActive(path) ? '1px solid rgba(255,255,255,0.4)' : 'none',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.15)',
      transform: 'translateY(-2px)'
    }
  });

  return (
    // AppBar "Flotante" con margen superior
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', pt: 2, pb: 1 }}>
      <Container maxWidth="xl">
        <Box 
            sx={{ 
                bgcolor: 'primary.main', 
                borderRadius: '30px',    
                px: 2,
                boxShadow: '0 8px 20px rgba(30, 58, 95, 0.25)' 
            }}
        >
            <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 70 } }}>
                
                {/* LOGO */}
                <Box 
                    display="flex" 
                    alignItems="center" 
                    sx={{ flexGrow: 1, cursor: 'pointer', textDecoration: 'none', color: 'white' }} 
                    onClick={() => navigate('/')}
                >
                    <Box sx={{ bgcolor: 'white', p: 0.8, borderRadius: '50%', display: 'flex', mr: 1.5 }}>
                        <PetsIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    </Box>
                    <Typography 
                        variant="h5" 
                        noWrap 
                        component="div" 
                        sx={{ 
                            fontFamily: 'Poppins', 
                            fontWeight: 700, 
                            letterSpacing: '1px',
                            display: { xs: 'none', sm: 'block' }
                        }}
                    >
                        VETSYS
                    </Typography>
                </Box>

                {/* MENÚ CENTRAL */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
                    <Button sx={navButtonStyle('/propietarios')} onClick={() => navigate('/propietarios')}>Propietarios</Button>
                    <Button sx={navButtonStyle('/mascotas')} onClick={() => navigate('/mascotas')}>Mascotas</Button>
                    <Button sx={navButtonStyle('/veterinarios')} onClick={() => navigate('/veterinarios')}>Veterinarios</Button>
                    <Button sx={navButtonStyle('/citas')} onClick={() => navigate('/citas')}>Citas</Button>
                    <Button sx={navButtonStyle('/historial')} onClick={() => navigate('/historial')}>Historial</Button>
                    <Button sx={navButtonStyle('/facturas')} onClick={() => navigate('/facturas')}>Facturación</Button>
                </Box>

                {/* BOTÓN SALIR */}
                <Box sx={{ flexGrow: 0, ml: 2 }}>
                    <Tooltip title="Cerrar Sesión">
                        <Button 
                            onClick={handleLogout} 
                            variant="contained" 
                            color="secondary" 
                            startIcon={<LogoutIcon />}
                            sx={{ 
                                fontWeight: 'bold',
                                color: 'white', // 
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: '#b88b5e', 
                                    boxShadow: '0 4px 12px rgba(212, 163, 115, 0.4)'
                                }
                            }}
                        >
                            Salir
                        </Button>
                    </Tooltip>
                </Box>

            </Toolbar>
        </Box>
      </Container>
    </AppBar>
  );
};

export default Navbar;