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
// 1. CORRECCIÓN: Agregamos useLocation aquí
import { useNavigate, useLocation } from "react-router-dom";

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
import SearchIcon from '@mui/icons-material/Search'; 
import ReceiptIcon from '@mui/icons-material/Receipt'; 
import DescriptionIcon from '@mui/icons-material/Description'; 

import { useAuth } from "../context/AuthContext"; 

const API_URL = "http://localhost:8080/api/citas";
const API_PROPIETARIOS = "http://localhost:8080/api/propietarios";
const API_VETERINARIOS = "http://localhost:8080/api/veterinarios"; 

const CitasList = () => {
  const { authHeader } = useAuth(); 
  const navigate = useNavigate(); 
  const location = useLocation(); // Hook para leer parámetros de navegación
  
  // Inicializa el filtro con lo que venga en el estado de la navegación (si existe)
  const [filtro, setFiltro] = useState(location.state?.filtro || ""); 

  // --- ESTADOS ---
  const [citas, setCitas] = useState([]);
  
  const [propietarios, setPropietarios] = useState([]);
  const [mascotasDelPropietario, setMascotasDelPropietario] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]); 

  const [open, setOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false); 
  
  const [openFinalizar, setOpenFinalizar] = useState(false);
  const [citaAFinalizar, setCitaAFinalizar] = useState(null);
  
  // Estado para Modal de Atención Directa
  const [openDirecta, setOpenDirecta] = useState(false);
  const [directaData, setDirectaData] = useState({
    idPropietarioSeleccionado: "",
    idMascota: "",
    idVeterinario: "",
    motivo: "",
    precio: "",
    observaciones: "",
    tratamiento: "",
    proximoControl: "",
    motivoProximoControl: ""
  });
  
  const [finalizarData, setFinalizarData] = useState({ 
    observaciones: "", 
    tratamiento: "",
    proximoControl: "",
    motivoProximoControl: "",
    precio: ""
  });

  const [mensaje, setMensaje] = useState({ open: false, text: "", type: "success" });

  const [formData, setFormData] = useState({
    idCita: null,
    fechaHora: "",
    motivo: "",
    idPropietarioSeleccionado: "", 
    idMascota: "",
    idVeterinario: ""
  });

  // --- 2. CORRECCIÓN: Funciones API definidas ANTES del useEffect ---
  const fetchCitas = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { "Authorization": authHeader }
      });
      if (!response.ok) throw new Error("Error al cargar citas");
      const data = await response.json();
      data.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      setCitas(data);
    } catch {
      mostrarMensaje("Error al conectar con el servidor", "error");
    }
  };

  const fetchPropietarios = async () => {
    try {
      const response = await fetch(API_PROPIETARIOS, {
        headers: { "Authorization": authHeader } 
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
            headers: { "Authorization": authHeader } 
        });
        if (!response.ok) throw new Error("Error al cargar veterinarios");
        const data = await response.json();
        setVeterinarios(data);
      } catch(error) {
        console.error("Error cargando veterinarios:", error);
      }
  };

  // --- EFECTO ---
  useEffect(() => {
    if (authHeader) {
        fetchCitas();
        fetchPropietarios();
        fetchVeterinarios();
    }
    // 3. CORRECCIÓN: Desactivamos la advertencia de dependencias
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  // --- HANDLERS ---

  const handleSave = async () => {
    if (!formData.fechaHora) {
      mostrarMensaje("La fecha es obligatoria", "warning");
      return;
    }

    if (!isRescheduling && (!formData.idMascota || !formData.idVeterinario)) {
        mostrarMensaje("Complete los campos requeridos", "warning");
        return;
    }

    try {
      let response;
      if (isRescheduling) {
        const urlReprogramar = `${API_URL}/${formData.idCita}/reprogramar`;
        response = await fetch(urlReprogramar, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": authHeader },
          body: JSON.stringify({ fechaHora: formData.fechaHora, motivo: formData.motivo }),
        });
      } else {
        const datosDTO = {
            fechaHora: formData.fechaHora,
            motivo: formData.motivo,
            idMascota: parseInt(formData.idMascota),
            idVeterinario: parseInt(formData.idVeterinario)
        };
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": authHeader },
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
    } catch {
      mostrarMensaje("Error de conexión", "error");
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm("¿Estás seguro de cancelar esta cita?")) {
      try {
        const response = await fetch(`${API_URL}/${id}/cancelar`, { 
            method: "PUT",
            headers: { "Authorization": authHeader } 
        });
        if (response.ok) {
          fetchCitas();
          mostrarMensaje("Cita cancelada correctamente", "success");
        }
      } catch (error) { console.error(error); }
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Eliminar definitivamente esta cita cancelada?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { 
                method: "DELETE",
                headers: { "Authorization": authHeader } 
            });
            if (response.ok) {
                fetchCitas();
                mostrarMensaje("Registro eliminado", "info");
            }
        } catch (error) { console.error(error); }
    }
  };

  // --- FINALIZAR ---
  const handleOpenFinalizar = (idCita) => {
    setCitaAFinalizar(idCita);
    setFinalizarData({ observaciones: "", tratamiento: "", proximoControl: "", motivoProximoControl: "", precio: "" });
    setOpenFinalizar(true);
  };

  const handleConfirmarFinalizacion = async () => {
    if(!citaAFinalizar) return;
    if (!finalizarData.precio || !finalizarData.observaciones) {
        mostrarMensaje("Precio y Diagnóstico son obligatorios", "warning");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/${citaAFinalizar}/finalizar`, { 
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": authHeader },
            body: JSON.stringify(finalizarData) 
        });
        if (response.ok) {
          fetchCitas();
          mostrarMensaje("Cita finalizada y cobrada", "success");
          setOpenFinalizar(false);
        } else {
          mostrarMensaje("Error al finalizar", "error");
        }
    } catch { mostrarMensaje("Error de conexión", "error"); }
  };

  const handleFinalizarChange = (e) => setFinalizarData({...finalizarData, [e.target.name]: e.target.value});

  // --- ATENCIÓN DIRECTA ---
  const handleOpenDirecta = () => {
    setMascotasDelPropietario([]);
    setDirectaData({
        idPropietarioSeleccionado: "", idMascota: "", idVeterinario: "",
        motivo: "Atención Inmediata", precio: "", observaciones: "",
        tratamiento: "", proximoControl: "", motivoProximoControl: ""
    });
    setOpenDirecta(true);
  };

  useEffect(() => {
    if (location.state?.openDirecta) {
        handleOpenDirecta();
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleDirectaChange = (e) => setDirectaData({...directaData, [e.target.name]: e.target.value});

  const handleOwnerChangeDirecta = (event) => {
      const ownerId = event.target.value;
      setDirectaData({ ...directaData, idPropietarioSeleccionado: ownerId, idMascota: "" });
      const prop = propietarios.find(p => p.idPropietario === ownerId);
      setMascotasDelPropietario(prop?.mascotas || []);
  };

  const handleSaveDirecta = async () => {
      if (!directaData.idMascota || !directaData.idVeterinario || !directaData.precio || !directaData.observaciones) {
          mostrarMensaje("Complete Mascota, Veterinario, Precio y Diagnóstico", "warning");
          return;
      }
      const payload = {
          idMascota: parseInt(directaData.idMascota),
          idVeterinario: parseInt(directaData.idVeterinario),
          motivo: directaData.motivo,
          precio: parseFloat(directaData.precio),
          observaciones: directaData.observaciones,
          tratamiento: directaData.tratamiento,
          proximoControl: directaData.proximoControl || null,
          motivoProximoControl: directaData.motivoProximoControl
      };
      try {
          const response = await fetch(`${API_URL}/urgencia`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": authHeader },
              body: JSON.stringify(payload)
          });
          if (response.ok) {
              fetchCitas();
              setOpenDirecta(false);
              mostrarMensaje("¡Atención registrada y facturada!", "success");
          } else {
              mostrarMensaje("Error al registrar atención", "error");
          }
      } catch { mostrarMensaje("Error de conexión", "error"); }
  };

  // --- AUXILIARES UI ---
  const handleOwnerChange = (event) => {
      const ownerId = event.target.value;
      setFormData({ ...formData, idPropietarioSeleccionado: ownerId, idMascota: "" });
      const prop = propietarios.find(p => p.idPropietario === ownerId);
      setMascotasDelPropietario(prop?.mascotas || []);
  };

  const handleOpenAgendar = () => {
    setIsRescheduling(false);
    setMascotasDelPropietario([]); 
    setFormData({ idCita: null, fechaHora: "", motivo: "", idPropietarioSeleccionado: "", idMascota: "", idVeterinario: "" });
    setOpen(true);
  };

  const handleOpenReprogramar = (cita) => {
    setIsRescheduling(true);
    const fechaInput = cita.fechaHora ? cita.fechaHora.substring(0, 16) : "";
    setFormData({
      idCita: cita.idCita,
      fechaHora: fechaInput,
      motivo: cita.motivo || "",
      idPropietarioSeleccionado: "", 
      idMascota: cita.mascota?.idMascota || "",
      idVeterinario: cita.veterinario?.idVeterinario || ""
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const mostrarMensaje = (text, type) => setMensaje({ open: true, text, type });

  // --- FILTRADO INTELIGENTE ---
  const citasFiltradas = citas.filter((cita) => {
    const busqueda = filtro.toLowerCase();
    const paciente = cita.mascota?.nombre?.toLowerCase() || "";
    const duenio = (cita.mascota?.propietario?.nombre + " " + cita.mascota?.propietario?.apellido)?.toLowerCase() || "";
    const vet = (cita.veterinario?.nombre + " " + cita.veterinario?.apellido)?.toLowerCase() || "";
    return paciente.includes(busqueda) || duenio.includes(busqueda) || vet.includes(busqueda);
  });

  const citasProgramadas = citasFiltradas.filter(c => c.estado === 'PROGRAMADA');
  const citasRealizadas = citasFiltradas.filter(c => c.estado === 'REALIZADA');
  const citasCanceladas = citasFiltradas.filter(c => c.estado === 'CANCELADA');

  const renderTabla = (titulo, listaCitas, icon) => (
    <Paper sx={{ mb: 5, p: 2, borderTop: `4px solid ${titulo === 'Citas Programadas' ? '#1976d2' : titulo === 'Citas Realizadas' ? '#2e7d32' : '#d32f2f'}` }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            {icon}
            <Typography variant="h6">{titulo} ({listaCitas.length})</Typography>
        </Stack>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Paciente</TableCell>
                        <TableCell>Dueño</TableCell>
                        <TableCell>Veterinario</TableCell>
                        <TableCell>Motivo</TableCell>
                        {titulo === 'Citas Realizadas' && (
                            <>
                                <TableCell>Diagnóstico</TableCell>
                                <TableCell>Precio</TableCell>
                            </>
                        )}
                        <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {listaCitas.length > 0 ? (
                        listaCitas.map((cita) => (
                            <TableRow key={cita.idCita} hover>
                                <TableCell>
                                    {new Date(cita.fechaHora).toLocaleDateString()} <br/>
                                    <Typography variant="caption" color="textSecondary">
                                        {new Date(cita.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </Typography>
                                </TableCell>
                                <TableCell fontWeight="bold">{cita.mascota?.nombre}</TableCell>
                                <TableCell>{cita.mascota?.propietario?.nombre} {cita.mascota?.propietario?.apellido}</TableCell>
                                <TableCell>{cita.veterinario?.nombre} {cita.veterinario?.apellido}</TableCell>
                                <TableCell>{cita.motivo}</TableCell>

                                {titulo === 'Citas Realizadas' && (
                                    <>
                                        <TableCell sx={{maxWidth: 150}}>
                                            <Tooltip title={cita.observaciones || ""}>
                                                <Typography noWrap variant="body2">{cita.observaciones || "-"}</Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell color="success.main">
                                            <b>${cita.precio}</b>
                                        </TableCell>
                                    </>
                                )}

                                <TableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        {titulo === 'Citas Programadas' && (
                                            <>
                                                <Tooltip title="Finalizar">
                                                    <IconButton color="success" onClick={() => handleOpenFinalizar(cita.idCita)}><CheckCircleIcon /></IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton color="primary" onClick={() => handleOpenReprogramar(cita)}><EditIcon /></IconButton>
                                                </Tooltip>
                                                <Tooltip title="Cancelar">
                                                    <IconButton color="error" onClick={() => handleCancelar(cita.idCita)}><CancelIcon /></IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        {titulo === 'Citas Realizadas' && (
                                            <>
                                                <Tooltip title="Ver Historial">
                                                    <IconButton color="primary" onClick={() => navigate('/historial')}><DescriptionIcon /></IconButton>
                                                </Tooltip>
                                                <Tooltip title="Ver Facturas">
                                                    <IconButton color="secondary" onClick={() => navigate('/facturas')}><ReceiptIcon /></IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        {titulo === 'Citas Canceladas' && (
                                            <Tooltip title="Eliminar Registro">
                                                <IconButton color="error" onClick={() => handleEliminar(cita.idCita)}><DeleteIcon /></IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={8} align="center">No hay registros.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">Agenda de Citas</Typography>
        <Stack direction="row" spacing={2}>
            <Button variant="contained" color="error" startIcon={<MedicalServicesIcon />} onClick={handleOpenDirecta}>Atención Directa</Button>
            <Button variant="contained" startIcon={<EventIcon />} onClick={handleOpenAgendar}>Agendar Cita</Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por Paciente, Dueño o Veterinario..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
          }}
        />
      </Paper>

      {renderTabla("Citas Programadas", citasProgramadas, <ScheduleIcon color="primary"/>)}
      {renderTabla("Citas Realizadas", citasRealizadas, <HistoryIcon color="success"/>)}
      {renderTabla("Citas Canceladas", citasCanceladas, <BlockIcon color="error"/>)}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isRescheduling ? "Reprogramar Cita" : "Agendar Nueva Cita"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Fecha y Hora" type="datetime-local" name="fechaHora" value={formData.fechaHora} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
            <TextField label="Motivo" name="motivo" value={formData.motivo} onChange={handleChange} fullWidth multiline rows={2} />
            {!isRescheduling && (
                <>
                    <TextField select label="Propietario" name="idPropietarioSeleccionado" value={formData.idPropietarioSeleccionado} onChange={handleOwnerChange} fullWidth required>
                        {propietarios.map((p) => <MenuItem key={p.idPropietario} value={p.idPropietario}>{p.nombre} {p.apellido}</MenuItem>)}
                    </TextField>
                    <TextField select label="Mascota" name="idMascota" value={formData.idMascota} onChange={handleChange} fullWidth required disabled={!formData.idPropietarioSeleccionado}>
                        {mascotasDelPropietario.map((m) => <MenuItem key={m.idMascota} value={m.idMascota}>{m.nombre}</MenuItem>)}
                    </TextField>
                    <TextField select label="Veterinario" name="idVeterinario" value={formData.idVeterinario} onChange={handleChange} fullWidth required>
                         {veterinarios.map((v) => <MenuItem key={v.idVeterinario} value={v.idVeterinario}>{v.nombre} {v.apellido}</MenuItem>)}
                    </TextField>
                </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cerrar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">{isRescheduling ? "Guardar" : "Agendar"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openFinalizar} onClose={() => setOpenFinalizar(false)} maxWidth="sm" fullWidth>
        <DialogTitle><Stack direction="row" gap={1}><MedicalServicesIcon color="success"/>Finalizar Consulta</Stack></DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, mt: 1 }}>Complete para cerrar y facturar.</Typography>
            <Stack spacing={3}>
                <TextField label="Precio Total" name="precio" type="number" value={finalizarData.precio} onChange={handleFinalizarChange} fullWidth required InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} autoFocus />
                <TextField label="Diagnóstico / Observaciones" name="observaciones" value={finalizarData.observaciones} onChange={handleFinalizarChange} fullWidth multiline rows={3} required />
                <TextField label="Tratamiento (Opcional)" name="tratamiento" value={finalizarData.tratamiento} onChange={handleFinalizarChange} fullWidth multiline rows={2} />
                <TextField label="Fecha Próximo Control (Opcional)" type="date" name="proximoControl" value={finalizarData.proximoControl} onChange={handleFinalizarChange} fullWidth InputLabelProps={{ shrink: true }} />
                {finalizarData.proximoControl && (
                    <TextField label="Concepto del Control" name="motivoProximoControl" value={finalizarData.motivoProximoControl} onChange={handleFinalizarChange} fullWidth />
                )}
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenFinalizar(false)} color="inherit">Cancelar</Button>
            <Button onClick={handleConfirmarFinalizacion} variant="contained" color="success">Finalizar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDirecta} onClose={() => setOpenDirecta(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#d32f2f', color: 'white' }}><Stack direction="row" gap={1} alignItems="center"><MedicalServicesIcon /> Registro de Atención Inmediata</Stack></DialogTitle>
        <DialogContent>
            <Typography variant="body2" sx={{ my: 2 }}>Ingrese los datos del paciente y el detalle clínico.</Typography>
            <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField select label="Propietario" name="idPropietarioSeleccionado" value={directaData.idPropietarioSeleccionado} onChange={handleOwnerChangeDirecta} fullWidth required>
                        {propietarios.map((p) => <MenuItem key={p.idPropietario} value={p.idPropietario}>{p.nombre} {p.apellido}</MenuItem>)}
                    </TextField>
                    <TextField select label="Mascota" name="idMascota" value={directaData.idMascota} onChange={handleDirectaChange} fullWidth required disabled={!directaData.idPropietarioSeleccionado}>
                        {mascotasDelPropietario.map((m) => <MenuItem key={m.idMascota} value={m.idMascota}>{m.nombre}</MenuItem>)}
                    </TextField>
                    <TextField select label="Veterinario" name="idVeterinario" value={directaData.idVeterinario} onChange={handleDirectaChange} fullWidth required>
                         {veterinarios.map((v) => <MenuItem key={v.idVeterinario} value={v.idVeterinario}>{v.nombre} {v.apellido}</MenuItem>)}
                    </TextField>
                </Stack>
                <TextField label="Motivo de Urgencia" name="motivo" value={directaData.motivo} onChange={handleDirectaChange} fullWidth />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField label="Precio Total" name="precio" type="number" value={directaData.precio} onChange={handleDirectaChange} fullWidth required InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                    <TextField label="Diagnóstico / Obs" name="observaciones" value={directaData.observaciones} onChange={handleDirectaChange} fullWidth required />
                </Stack>
                <TextField label="Tratamiento / Receta" name="tratamiento" value={directaData.tratamiento} onChange={handleDirectaChange} fullWidth multiline rows={2} />
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField label="Próximo Control" type="date" name="proximoControl" value={directaData.proximoControl} onChange={handleDirectaChange} sx={{ width: '200px' }} InputLabelProps={{ shrink: true }} />
                    {directaData.proximoControl && <TextField label="Motivo Control" name="motivoProximoControl" value={directaData.motivoProximoControl} onChange={handleDirectaChange} fullWidth placeholder="Ej: Retiro de puntos" />}
                </Stack>
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenDirecta(false)} color="inherit">Cancelar</Button>
            <Button onClick={handleSaveDirecta} variant="contained" color="error">Registrar y Finalizar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={mensaje.open} autoHideDuration={6000} onClose={() => setMensaje({ ...mensaje, open: false })}>
        <Alert severity={mensaje.type} sx={{ width: '100%' }}>{mensaje.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default CitasList;