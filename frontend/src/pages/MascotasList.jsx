import React, { useState, useEffect } from "react";
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Alert, Snackbar, MenuItem, Chip, InputAdornment, Tooltip, Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import PetsIcon from "@mui/icons-material/Pets";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History"; // Icono Historial
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"; // Icono Citas
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import moment from "moment"; 

// Importar navegación
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Endpoints
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const API_URL_MASCOTAS = `${BASE_URL}/mascotas`;
const API_URL_PROPIETARIOS = `${BASE_URL}/propietarios`;
const API_URL_CITAS = `${BASE_URL}/citas`;

const MascotasList = () => {
  const { authHeader } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- ESTADOS ---
  const [mascotas, setMascotas] = useState([]);
  const [propietarios, setPropietarios] = useState([]); 
  const [filtro, setFiltro] = useState(location.state?.filtro || "");

  // Estados para Modales de Visualización
  const [openHistory, setOpenHistory] = useState(false);
  const [openPending, setOpenPending] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [relatedCitas, setRelatedCitas] = useState([]); // Guarda las citas (Historial o Pendientes)

  // Estados CRUD
  const [open, setOpen] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);
  const [mensaje, setMensaje] = useState({ open: false, text: "", type: "success" });

  const [formData, setFormData] = useState({
    idMascota: null, nombre: "", especie: "", raza: "", sexo: "", fechaNacimiento: "", idPropietario: "", 
  });

  // --- API FETCH (Definidas ANTES del useEffect) ---
  const fetchMascotas = async () => {
    try {
      const response = await fetch(API_URL_MASCOTAS, { headers: { "Authorization": authHeader } });
      if (response.ok) setMascotas(await response.json());
    } catch { 
      // Error removido porque no se usaba
      mostrarMensaje("Error de conexión", "error"); 
    }
  };

  const fetchPropietarios = async () => {
    try {
      const response = await fetch(API_URL_PROPIETARIOS, { headers: { "Authorization": authHeader } });
      if (response.ok) setPropietarios(await response.json());
    } catch (error) { 
      console.error("Error:", error); 
    }
  };

  useEffect(() => {
    if (authHeader) {
        fetchMascotas();
        fetchPropietarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  useEffect(() => {
    if (location.state?.filtro) {
      setFiltro(location.state.filtro);
    }
  }, [location.state]);

  // Función auxiliar para traer citas (se llama solo al abrir modales)
  const fetchCitasDeMascota = async (mascotaId, estado) => {
      try {
          const response = await fetch(API_URL_CITAS, { headers: { "Authorization": authHeader } });
          if (response.ok) {
              const todasLasCitas = await response.json();
              // Filtramos por ID de Mascota y por Estado (REALIZADA o PROGRAMADA)
              const citasFiltradas = todasLasCitas.filter(c => 
                  c.mascota?.idMascota === mascotaId && c.estado === estado
              );
              // Ordenar por fecha (descendente para historial, ascendente para pendientes)
              citasFiltradas.sort((a, b) => 
                  estado === 'REALIZADA' 
                      ? new Date(b.fechaHora) - new Date(a.fechaHora) 
                      : new Date(a.fechaHora) - new Date(b.fechaHora)
              );
              return citasFiltradas;
          }
          return [];
      } catch { 
        return []; 
      }
  };

  // --- LÓGICA DE VISUALIZACIÓN (Historial y Pendientes) ---
  const handleVerHistorial = async (mascota) => {
      setSelectedMascota(mascota);
      const historial = await fetchCitasDeMascota(mascota.idMascota, 'REALIZADA');
      setRelatedCitas(historial);
      setOpenHistory(true);
  };

  const handleVerPendientes = async (mascota) => {
      setSelectedMascota(mascota);
      const pendientes = await fetchCitasDeMascota(mascota.idMascota, 'PROGRAMADA');
      setRelatedCitas(pendientes);
      setOpenPending(true);
  };

  const handleRedirigirCitas = () => {
      // Redirigimos al módulo de citas pasando el nombre de la mascota como filtro inicial
      navigate('/citas', { state: { filtro: selectedMascota?.nombre } });
  };

  // --- FILTRO DE BÚSQUEDA ---
  const mascotasFiltradas = mascotas.filter((m) => {
      const texto = filtro.toLowerCase();
      const nombre = m.nombre?.toLowerCase() || "";
      const duenio = (m.propietario?.nombre + " " + m.propietario?.apellido)?.toLowerCase() || "";
      const raza = m.raza?.toLowerCase() || "";
      const especie = m.especie?.toLowerCase() || "";
      
      return nombre.includes(texto) || duenio.includes(texto) || raza.includes(texto) || especie.includes(texto);
  });

  // --- CRUD HANDLERS ---
  const handleSave = async () => {
    if (!formData.nombre || !formData.especie || !formData.idPropietario) {
      mostrarMensaje("Nombre, Especie y Propietario son obligatorios", "warning");
      return;
    }
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API_URL_MASCOTAS}/${formData.idMascota}` : API_URL_MASCOTAS;
      
      const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", "Authorization": authHeader },
          body: JSON.stringify({ ...formData, idPropietario: parseInt(formData.idPropietario) }),
      });

      if (response.ok) {
        fetchMascotas(); 
        handleClose();
        mostrarMensaje(isEditing ? "Mascota actualizada" : "Mascota registrada", "success");
      } else {
        mostrarMensaje("Error al guardar", "error");
      }
    } catch { 
      mostrarMensaje("Error de conexión", "error"); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar mascota?")) {
      try {
        const response = await fetch(`${API_URL_MASCOTAS}/${id}`, {
          method: "DELETE", headers: { "Authorization": authHeader }
        });
        if (response.ok) { fetchMascotas(); mostrarMensaje("Mascota eliminada", "success"); }
      } catch (error) { console.error(error); }
    }
  };

  // --- UI HANDLERS ---
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ idMascota: null, nombre: "", especie: "", raza: "", sexo: "", fechaNacimiento: "", idPropietario: "" });
    setOpen(true);
  };

  const handleOpenEdit = (mascota) => {
    setIsEditing(true);
    setFormData({
      idMascota: mascota.idMascota,
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza || "",
      sexo: mascota.sexo || "",
      fechaNacimiento: mascota.fechaNacimiento || "",
      idPropietario: mascota.propietario ? mascota.propietario.idPropietario : "", 
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const mostrarMensaje = (text, type) => setMensaje({ open: true, text, type });

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          <PetsIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> 
          Gestión de Mascotas
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nueva Mascota
        </Button>
      </Stack>

      {/* --- BARRA DE BÚSQUEDA --- */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por Nombre, Raza, Especie o Dueño..."
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

      <TableContainer component={Paper}>
        <Table>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Especie/Raza</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dueño</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nacimiento</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Historial / Pendientes</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Editar / Eliminar</TableCell>
            </TableRow>
          <TableBody>
            {mascotasFiltradas.length > 0 ? (
              mascotasFiltradas.map((mascota) => (
                <TableRow key={mascota.idMascota}>
                  <TableCell style={{ fontWeight: 'bold' }}>{mascota.nombre}</TableCell>
                  <TableCell>{mascota.especie} {mascota.raza ? `(${mascota.raza})` : ''}</TableCell>
                  <TableCell>
                    {mascota.propietario ? (
                        `${mascota.propietario.nombre} ${mascota.propietario.apellido}`
                    ) : (
                        <span style={{color: 'red'}}>Sin Propietario</span>
                    )}
                  </TableCell>
                  <TableCell>{mascota.fechaNacimiento ? moment(mascota.fechaNacimiento).format("DD/MM/YYYY") : "N/A"}</TableCell>
                  <TableCell>
                      <Chip label={mascota.estado} color="success" size="small" variant="outlined" />
                  </TableCell>
                  
                  {/* --- ACCIONES DE CITA --- */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Ver Historial Clínico">
                            <IconButton color="primary" onClick={() => handleVerHistorial(mascota)}>
                                <HistoryIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver Citas Pendientes">
                            <IconButton color="warning" onClick={() => handleVerPendientes(mascota)}>
                                <CalendarMonthIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                  </TableCell>

                  {/* --- ACCIONES CRUD --- */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="default" onClick={() => handleOpenEdit(mascota)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(mascota.idMascota)}><DeleteIcon /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No hay mascotas registradas.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- MODAL FORMULARIO --- */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Editar Mascota" : "Registrar Mascota"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: "300px" }}>
            <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
            <TextField select label="Propietario" name="idPropietario" value={formData.idPropietario} onChange={handleChange} fullWidth required>
              <MenuItem value="" disabled>Seleccione un propietario</MenuItem>
              {propietarios.map((prop) => (
                <MenuItem key={prop.idPropietario} value={prop.idPropietario}>
                  {prop.nombre} {prop.apellido} ({prop.cedula})
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
                 <TextField label="Especie" name="especie" value={formData.especie} onChange={handleChange} fullWidth required />
                 <TextField label="Raza" name="raza" value={formData.raza} onChange={handleChange} fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
                <TextField select label="Sexo" name="sexo" value={formData.sexo} onChange={handleChange} fullWidth >
                    <MenuItem value="MACHO">Macho</MenuItem>
                    <MenuItem value="HEMBRA">Hembra</MenuItem>
                </TextField>
                <TextField label="Fecha Nacimiento" name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">{isEditing ? "Actualizar" : "Registrar"}</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL HISTORIAL CLÍNICO --- */}
      <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>Historial Clínico: {selectedMascota?.nombre}</DialogTitle>
        <DialogContent dividers>
            {relatedCitas.length > 0 ? (
                <Stack spacing={2}>
                    {relatedCitas.map((cita) => (
                        <Paper key={cita.idCita} variant="outlined" sx={{ p: 2 }}>
                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {new Date(cita.fechaHora).toLocaleDateString()} - {new Date(cita.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </Typography>
                                <Chip label="Realizada" color="success" size="small"/>
                            </Stack>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                <strong>Veterinario:</strong> {cita.veterinario?.nombre} {cita.veterinario?.apellido}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}><strong>Diagnóstico:</strong> {cita.observaciones}</Typography>
                            <Typography variant="body2"><strong>Tratamiento:</strong> {cita.tratamiento || "Ninguno"}</Typography>
                        </Paper>
                    ))}
                </Stack>
            ) : (
                <Alert severity="info">No hay atenciones pasadas registradas.</Alert>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenHistory(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL CITAS PENDIENTES --- */}
      <Dialog open={openPending} onClose={() => setOpenPending(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Próximas Citas: {selectedMascota?.nombre}</DialogTitle>
        <DialogContent dividers>
            {relatedCitas.length > 0 ? (
                <Stack spacing={2}>
                    {relatedCitas.map((cita) => (
                        <Paper key={cita.idCita} variant="outlined" sx={{ p: 2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <Box>
                                <Typography variant="h6" color="primary">
                                    {new Date(cita.fechaHora).toLocaleDateString()} 
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {new Date(cita.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">{cita.motivo}</Typography>
                            </Box>
                            <Chip label="Programada" color="primary" variant="outlined" />
                        </Paper>
                    ))}
                </Stack>
            ) : (
                <Alert severity="info">No tiene citas programadas.</Alert>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenPending(false)} color="inherit">Cerrar</Button>
            <Button 
                onClick={handleRedirigirCitas} 
                variant="contained" 
                color="primary"
                endIcon={<ArrowForwardIcon />}
            >
                Gestionar en Citas
            </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={mensaje.open} autoHideDuration={6000} onClose={() => setMensaje({ ...mensaje, open: false })}>
        <Alert severity={mensaje.type} sx={{ width: '100%' }}>{mensaje.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default MascotasList;