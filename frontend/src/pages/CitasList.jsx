import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
  MenuItem,
  InputAdornment
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import EventIcon from "@mui/icons-material/Event";
import CancelIcon from "@mui/icons-material/Cancel";
import HistoryIcon from "@mui/icons-material/History";
import BlockIcon from "@mui/icons-material/Block";
import ScheduleIcon from "@mui/icons-material/Schedule";
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// --- 1. IMPORTAR EL CONTEXTO DE SEGURIDAD ---
import { useAuth } from "../context/AuthContext"; 

// ENDPOINTS
const API_URL = "http://localhost:8080/api/citas";
const API_PROPIETARIOS = "http://localhost:8080/api/propietarios";
const API_VETERINARIOS = "http://localhost:8080/api/veterinarios"; 

const CitasList = () => {
  // --- 2. OBTENER LA CREDENCIAL DEL CONTEXTO ---
  const { authHeader } = useAuth(); 

  // --- ESTADOS ---
  const [citas, setCitas] = useState([]);
  
  // Estados para los Selects
  const [propietarios, setPropietarios] = useState([]);
  const [mascotasDelPropietario, setMascotasDelPropietario] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]); 

  // Estado Modal Agendar/Reprogramar
  const [open, setOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false); 
  
  // Estado Modal Finalizar
  const [openFinalizar, setOpenFinalizar] = useState(false);
  const [citaAFinalizar, setCitaAFinalizar] = useState(null);
  
  const [finalizarData, setFinalizarData] = useState({ 
    observaciones: "", 
    tratamiento: "",
    proximoControl: "" 
  });

  const [mensaje, setMensaje] = useState({ open: false, text: "", type: "success" });

  const [formData, setFormData] = useState({
    idCita: null,
    fechaHora: "",
    motivo: "",
    precio: "", 
    idPropietarioSeleccionado: "", 
    idMascota: "",
    idVeterinario: ""
  });

  // --- EFECTOS ---
  useEffect(() => {
    // Solo cargamos datos si tenemos la credencial
    if (authHeader) {
        fetchCitas();
        fetchPropietarios();
        fetchVeterinarios();
    }
  }, [authHeader]); // Agregamos dependencia

  // --- FUNCIONES API (CON SEGURIDAD INYECTADA) ---

  const fetchCitas = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { "Authorization": authHeader } // <--- CABECERA AGREGADA
      });
      if (!response.ok) throw new Error("Error al cargar citas");
      const data = await response.json();
      setCitas(data);
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al conectar con el servidor", "error");
    }
  };

  const fetchPropietarios = async () => {
    try {
      const response = await fetch(API_PROPIETARIOS, {
        headers: { "Authorization": authHeader } // <--- CABECERA AGREGADA
      });
      if (response.ok) {
        const data = await response.json();
        setPropietarios(data);
      }
    } catch (error) {
      console.error("Error cargando propietarios:", error);
    }
  };

  const fetchVeterinarios = async () => {
      try {
        const response = await fetch(API_VETERINARIOS, {
            headers: { "Authorization": authHeader } // <--- CABECERA AGREGADA
        });
        if (!response.ok) throw new Error("Error al cargar veterinarios");
        const data = await response.json();
        setVeterinarios(data);
      } catch(error) {
        console.error("Error cargando veterinarios:", error);
      }
  };

  const handleSave = async () => {
    if (!formData.fechaHora) {
      mostrarMensaje("La fecha es obligatoria", "warning");
      return;
    }

    if (!isRescheduling && (!formData.idMascota || !formData.idVeterinario || !formData.precio)) {
        mostrarMensaje("Complete todos los campos (Mascota, Veterinario, Precio)", "warning");
        return;
    }

    try {
      let response;
      
      if (isRescheduling) {
        const urlReprogramar = `${API_URL}/${formData.idCita}/reprogramar`;
        response = await fetch(urlReprogramar, {
          method: "PUT",
          headers: { 
              "Content-Type": "application/json",
              "Authorization": authHeader // <--- CABECERA AGREGADA
          },
          body: JSON.stringify({ fechaHora: formData.fechaHora, motivo: formData.motivo }),
        });

      } else {
        const datosDTO = {
            fechaHora: formData.fechaHora,
            motivo: formData.motivo,
            precio: parseFloat(formData.precio),
            idMascota: parseInt(formData.idMascota),
            idVeterinario: parseInt(formData.idVeterinario)
        };

        response = await fetch(API_URL, {
          method: "POST",
          headers: { 
              "Content-Type": "application/json",
              "Authorization": authHeader // <--- CABECERA AGREGADA
          },
          body: JSON.stringify(datosDTO),
        });
      }

      if (response.ok) {
        fetchCitas();
        handleClose();
        mostrarMensaje(isRescheduling ? "Cita reprogramada" : "Cita agendada con éxito", "success");
      } else {
        const errorText = await response.text();
        mostrarMensaje(`Error: ${errorText}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error de conexión", "error");
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm("¿Estás seguro de cancelar esta cita?")) {
      try {
        const response = await fetch(`${API_URL}/${id}/cancelar`, { 
            method: "PUT",
            headers: { "Authorization": authHeader } // <--- CABECERA AGREGADA
        });
        if (response.ok) {
          fetchCitas();
          mostrarMensaje("Cita cancelada correctamente", "success");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // --- LÓGICA DE FINALIZAR ---
  const handleOpenFinalizar = (idCita) => {
    setCitaAFinalizar(idCita);
    setFinalizarData({ observaciones: "", tratamiento: "", proximoControl: "" });
    setOpenFinalizar(true);
  };

  const handleConfirmarFinalizacion = async () => {
    if(!citaAFinalizar) return;
    
    try {
        const response = await fetch(`${API_URL}/${citaAFinalizar}/finalizar`, { 
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": authHeader // <--- CABECERA AGREGADA
            },
            body: JSON.stringify(finalizarData) 
        });
        
        if (response.ok) {
          fetchCitas();
          mostrarMensaje("Cita finalizada y enviada al historial", "success");
          setOpenFinalizar(false);
        } else {
          mostrarMensaje("Error al finalizar la cita", "error");
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje("Error de conexión", "error");
    }
  };

  const handleFinalizarChange = (e) => {
      setFinalizarData({...finalizarData, [e.target.name]: e.target.value});
  }

  // --- LÓGICA DE SELECCIÓN EN CASCADA ---
  const handleOwnerChange = (event) => {
      const ownerId = event.target.value;
      setFormData({ 
          ...formData, 
          idPropietarioSeleccionado: ownerId, 
          idMascota: "" 
      });

      const propietarioEncontrado = propietarios.find(p => p.idPropietario === ownerId);
      if (propietarioEncontrado && propietarioEncontrado.mascotas) {
          setMascotasDelPropietario(propietarioEncontrado.mascotas);
      } else {
          setMascotasDelPropietario([]);
      }
  };

  // --- UI HANDLERS ---
  const handleOpenAgendar = () => {
    setIsRescheduling(false);
    setMascotasDelPropietario([]); 
    setFormData({ 
        idCita: null, 
        fechaHora: "", 
        motivo: "", 
        precio: "",
        idPropietarioSeleccionado: "", 
        idMascota: "", 
        idVeterinario: "" 
    });
    setOpen(true);
  };

  const handleOpenReprogramar = (cita) => {
    setIsRescheduling(true);
    const fechaInput = cita.fechaHora ? cita.fechaHora.substring(0, 16) : "";
    setFormData({
      idCita: cita.idCita,
      fechaHora: fechaInput,
      motivo: cita.motivo || "",
      precio: cita.precio || "",
      idPropietarioSeleccionado: "", 
      idMascota: cita.mascota?.idMascota || "",
      idVeterinario: cita.veterinario?.idVeterinario || ""
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const mostrarMensaje = (text, type) => {
    setMensaje({ open: true, text, type });
  };

  const getStatusColor = (estado) => {
      switch(estado) {
          case 'PROGRAMADA': return 'primary';
          case 'REALIZADA': return 'success';
          case 'CANCELADA': return 'error';
          default: return 'default';
      }
  };

  const citasProgramadas = citas.filter(c => c.estado === 'PROGRAMADA');
  const citasRealizadas = citas.filter(c => c.estado === 'REALIZADA');
  const citasCanceladas = citas.filter(c => c.estado === 'CANCELADA');

  const renderTabla = (titulo, listaCitas, icon) => (
    <Paper sx={{ mb: 5, p: 2, borderTop: `4px solid ${titulo === 'Citas Programadas' ? '#1976d2' : titulo === 'Citas Realizadas' ? '#2e7d32' : '#d32f2f'}` }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            {icon}
            <Typography variant="h6" component="div">
                {titulo} ({listaCitas.length})
            </Typography>
        </Stack>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Motivo</TableCell>
                        {titulo === 'Citas Realizadas' && (
                            <>
                                <TableCell>Observaciones</TableCell>
                                <TableCell>Tratamiento</TableCell>
                            </>
                        )}
                        <TableCell>Precio</TableCell>
                        <TableCell>Mascota</TableCell>
                        <TableCell>Dueño</TableCell>
                        <TableCell>Veterinario</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {listaCitas.length > 0 ? (
                        listaCitas.map((cita) => (
                            <TableRow key={cita.idCita} hover>
                                <TableCell>{cita.idCita}</TableCell>
                                <TableCell>{new Date(cita.fechaHora).toLocaleString()}</TableCell>
                                <TableCell>{cita.motivo}</TableCell>
                                {titulo === 'Citas Realizadas' && (
                                    <>
                                        <TableCell sx={{maxWidth: 150, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                            <Tooltip title={cita.observaciones || ""}>
                                                <span>{cita.observaciones || "-"}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{maxWidth: 150, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                            <Tooltip title={cita.tratamiento || ""}>
                                                <span>{cita.tratamiento || "-"}</span>
                                            </Tooltip>
                                        </TableCell>
                                    </>
                                )}
                                <TableCell>${cita.precio || 0}</TableCell>
                                <TableCell>{cita.mascota?.nombre || "N/A"}</TableCell>
                                <TableCell>
                                    {cita.mascota?.propietario 
                                        ? `${cita.mascota.propietario.nombre} ${cita.mascota.propietario.apellido}` 
                                        : "N/A"}
                                </TableCell>
                                <TableCell>{cita.veterinario?.nombre || "N/A"}</TableCell>
                                <TableCell>
                                    <Chip label={cita.estado} color={getStatusColor(cita.estado)} size="small" />
                                </TableCell>
                                <TableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        {cita.estado === 'PROGRAMADA' && (
                                            <>
                                                <Tooltip title="Finalizar Consulta">
                                                    <IconButton color="success" onClick={() => handleOpenFinalizar(cita.idCita)}>
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reprogramar">
                                                    <IconButton color="primary" onClick={() => handleOpenReprogramar(cita)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Cancelar">
                                                    <IconButton color="error" onClick={() => handleCancelar(cita.idCita)}>
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        {cita.estado !== 'PROGRAMADA' && (
                                            <Typography variant="caption" color="textSecondary">-</Typography>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={titulo === 'Citas Realizadas' ? 11 : 9} align="center">
                                No hay {titulo.toLowerCase()}.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Agenda de Citas
        </Typography>
        <Button variant="contained" startIcon={<EventIcon />} onClick={handleOpenAgendar}>
          Agendar Cita
        </Button>
      </Stack>

      {renderTabla("Citas Programadas", citasProgramadas, <ScheduleIcon color="primary"/>)}
      {renderTabla("Citas Realizadas", citasRealizadas, <HistoryIcon color="success"/>)}
      {renderTabla("Citas Canceladas", citasCanceladas, <BlockIcon color="error"/>)}

      {/* MODAL AGENDAR */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isRescheduling ? "Reprogramar Cita" : "Agendar Nueva Cita"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Fecha y Hora"
              type="datetime-local"
              name="fechaHora"
              value={formData.fechaHora}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Motivo"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
            {!isRescheduling && (
                <>
                    <TextField
                        select
                        label="Seleccionar Propietario"
                        name="idPropietarioSeleccionado"
                        value={formData.idPropietarioSeleccionado}
                        onChange={handleOwnerChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="" disabled>Busque un propietario</MenuItem>
                        {propietarios.map((prop) => (
                            <MenuItem key={prop.idPropietario} value={prop.idPropietario}>
                                {prop.nombre} {prop.apellido}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Seleccionar Mascota"
                        name="idMascota"
                        value={formData.idMascota}
                        onChange={handleChange}
                        fullWidth
                        required
                        disabled={!formData.idPropietarioSeleccionado} 
                        helperText={!formData.idPropietarioSeleccionado ? "Primero seleccione un dueño" : ""}
                    >
                        {mascotasDelPropietario.length > 0 ? (
                            mascotasDelPropietario.map((mascota) => (
                                <MenuItem key={mascota.idMascota} value={mascota.idMascota}>
                                    {mascota.nombre} ({mascota.especie})
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value="" disabled>Este dueño no tiene mascotas</MenuItem>
                        )}
                    </TextField>

                    <TextField
                        select
                        label="Veterinario"
                        name="idVeterinario"
                        value={formData.idVeterinario}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                         {veterinarios.map((vet) => (
                            <MenuItem key={vet.idVeterinario} value={vet.idVeterinario}>
                                {vet.nombre} {vet.apellido ? vet.apellido : ''}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Precio Consulta"
                        name="precio"
                        type="number"
                        value={formData.precio}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                    />
                </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cerrar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {isRescheduling ? "Guardar Cambios" : "Agendar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL FINALIZAR */}
      <Dialog open={openFinalizar} onClose={() => setOpenFinalizar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
            <Stack direction="row" alignItems="center" gap={1}>
                <MedicalServicesIcon color="success"/>
                Finalizar Consulta Médica
            </Stack>
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, mt: 1 }}>
                Complete los detalles clínicos para cerrar la historia.
            </Typography>

            <Stack spacing={3}>
                <TextField
                    label="Diagnóstico / Observaciones"
                    name="observaciones"
                    value={finalizarData.observaciones}
                    onChange={handleFinalizarChange}
                    fullWidth
                    multiline
                    rows={3}
                    required
                    variant="outlined"
                />
                <TextField
                    label="Tratamiento Recetado"
                    name="tratamiento"
                    value={finalizarData.tratamiento}
                    onChange={handleFinalizarChange}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Ej: Amoxicilina 500mg c/8h por 5 días..."
                    helperText="Indique medicamentos y dosis."
                />
                <TextField
                    label="Fecha Sugerida Próximo Control"
                    type="date"
                    name="proximoControl"
                    value={finalizarData.proximoControl}
                    onChange={handleFinalizarChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon color="action" />
                          </InputAdornment>
                        ),
                    }}
                />
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenFinalizar(false)} color="inherit">Cancelar</Button>
            <Button 
                onClick={handleConfirmarFinalizacion} 
                variant="contained" 
                color="success"
                disabled={!finalizarData.observaciones}
            >
                Guardar y Finalizar
            </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={mensaje.open} autoHideDuration={6000} onClose={() => setMensaje({ ...mensaje, open: false })}>
        <Alert severity={mensaje.type} sx={{ width: '100%' }}>{mensaje.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default CitasList;