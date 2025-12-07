import React, { useState, useEffect } from "react";
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Stack, TextField, 
  InputAdornment, Tooltip, Chip
} from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

// 1. IMPORTAR CONTEXTO DE SEGURIDAD
import { useAuth } from "../context/AuthContext";

const API_URL_CITAS = "http://localhost:8080/api/citas";

function HistorialClinico() {
  // 2. OBTENER TOKEN
  const { authHeader } = useAuth();

  const [historial, setHistorial] = useState([]);
  const [filtro, setFiltro] = useState("");

  // --- 1. CARGAR DATOS (Solo citas REALIZADAS) ---
  const cargarHistorial = async () => {
    try {
      const response = await fetch(API_URL_CITAS, {
        headers: { "Authorization": authHeader }
      });
      if (response.ok) {
          const data = await response.json();
          
          // Filtramos solo las citas completadas (REALIZADA)
          const citasPasadas = data.filter(c => c.estado === 'REALIZADA');
          
          // Ordenamos por fecha (la más reciente primero)
          citasPasadas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
          
          setHistorial(citasPasadas);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  // 3. EFECTO PROTEGIDO
  useEffect(() => {
    if (authHeader) {
        cargarHistorial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  // --- 2. FILTRADO (Por Paciente, Dueño o Veterinario) ---
  const historialFiltrado = historial.filter((item) => {
    const texto = filtro.toLowerCase();
    const nombreMascota = item.mascota?.nombre?.toLowerCase() || "";
    const nombreDuenio = item.mascota?.propietario?.nombre?.toLowerCase() || "";
    const nombreVet = item.veterinario?.nombre?.toLowerCase() || "";

    return nombreMascota.includes(texto) || nombreDuenio.includes(texto) || nombreVet.includes(texto);
  });

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" color="primary" fontWeight="bold">
          Historial Clínico
        </Typography>
      </Stack>
      
      {/* BARRA DE BÚSQUEDA */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por Paciente, Dueño o Veterinario..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* TABLA DE RESULTADOS */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          {/* Encabezado Azul */}
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Atención</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Paciente</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Motivo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Veterinario</TableCell>
              
              {/* --- COLUMNAS SEPARADAS --- */}
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diagnóstico / Obs.</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tratamiento</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Próximo Control</TableCell>
              {/* -------------------------- */}
              
            </TableRow>
          </TableHead>
          <TableBody>
            {historialFiltrado.length > 0 ? (
              historialFiltrado.map((item) => (
                <TableRow key={item.idCita} hover>
                  
                  {/* FECHA Y HORA DE LA CITA */}
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                        {new Date(item.fechaHora).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {new Date(item.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Typography>
                  </TableCell>

                  {/* INFO PACIENTE Y DUEÑO */}
                  <TableCell>
                    <Stack>
                        <Typography fontWeight="bold" color="primary">{item.mascota?.nombre}</Typography>
                        <Typography variant="caption">{item.mascota?.especie}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Dueño: {item.mascota?.propietario?.nombre} {item.mascota?.propietario?.apellido}
                        </Typography>
                    </Stack>
                  </TableCell>

                  {/* MOTIVO */}
                  <TableCell>
                    <Typography variant="body2">{item.motivo}</Typography>
                  </TableCell>

                  {/* VETERINARIO */}
                  <TableCell>
                    Dr. {item.veterinario?.nombre}
                  </TableCell>

                  {/* 1. DIAGNÓSTICO / OBSERVACIONES */}
                  <TableCell sx={{ maxWidth: 250 }}>
                    {item.observaciones ? (
                        <Tooltip title={item.observaciones} arrow placement="top">
                             <Stack direction="row" alignItems="center" spacing={0.5}>
                                <InfoIcon fontSize="small" color="info"/>
                                <Typography variant="body2" noWrap sx={{maxWidth: 200}}>
                                    {item.observaciones}
                                </Typography>
                             </Stack>
                        </Tooltip>
                    ) : (
                        <Typography variant="caption" color="text.disabled">Sin observaciones</Typography>
                    )}
                  </TableCell>

                  {/* 2. TRATAMIENTO (Separado) */}
                  <TableCell sx={{ maxWidth: 250 }}>
                     {item.tratamiento ? (
                        <Tooltip title={item.tratamiento} arrow placement="top">
                             <Stack direction="row" alignItems="center" spacing={0.5}>
                                <MedicalServicesIcon fontSize="small" color="success"/>
                                <Typography variant="body2" noWrap sx={{maxWidth: 200}}>
                                    {item.tratamiento}
                                </Typography>
                             </Stack>
                        </Tooltip>
                    ) : (
                        <Typography variant="caption" color="text.disabled">N/A</Typography>
                    )}
                  </TableCell>

                  {/* 3. PRÓXIMO CONTROL (Separado) */}
                  <TableCell>
                    {item.proximoControl ? (
                        <Chip 
                            icon={<CalendarMonthIcon fontSize="small"/>} 
                            label={new Date(item.proximoControl + 'T00:00:00').toLocaleDateString()} 
                            color="primary" 
                            variant="outlined" 
                            size="small"
                        />
                    ) : (
                        <Typography variant="caption" color="text.disabled">No asignado</Typography>
                    )}
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay registros en el historial clínico.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default HistorialClinico;