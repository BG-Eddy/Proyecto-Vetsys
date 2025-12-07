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
  MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

// --- 1. IMPORTAR CONTEXTO DE SEGURIDAD ---
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:8080/api/veterinarios";
const API_CITAS = "http://localhost:8080/api/citas"; // Necesario para el historial

const VeterinariosList = () => {
  // --- 2. OBTENER TOKEN ---
  const { authHeader } = useAuth();

  // --- ESTADOS ---
  const [veterinarios, setVeterinarios] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mensaje, setMensaje] = useState({ open: false, text: "", type: "success" });

  const [formData, setFormData] = useState({
    idVeterinario: null,
    cedula: "",
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    especialidad: "",
    estado: "ACTIVO"
  });

  const [historialAtenciones, setHistorialAtenciones] = useState([]);
  const [selectedVetName, setSelectedVetName] = useState("");

  // --- FUNCIONES DEFINIDAS ANTES DEL EFFECT ---
  const fetchVeterinarios = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { "Authorization": authHeader } 
      });
      if (!response.ok) throw new Error("Error al cargar datos");
      const data = await response.json();
      setVeterinarios(data);
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error al conectar con el servidor", "error");
    }
  };

  useEffect(() => {
    if (authHeader) {
        fetchVeterinarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  // --- LOGICA DE GUARDADO ---
  const handleSave = async () => {
    if (!formData.cedula || !formData.nombre || !formData.apellido || !formData.especialidad) {
      mostrarMensaje("Cédula, Nombre, Apellido y Especialidad son obligatorios", "warning");
      return;
    }

    try {
      let response;
      const headers = { 
          "Content-Type": "application/json",
          "Authorization": authHeader
      };

      if (isEditing) {
        response = await fetch(`${API_URL}/${formData.idVeterinario}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        fetchVeterinarios();
        handleCloseForm();
        mostrarMensaje(isEditing ? "Veterinario actualizado correctamente" : "Veterinario registrado correctamente", "success");
      } else {
        mostrarMensaje("Error al guardar la información", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error de conexión", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este veterinario?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { "Authorization": authHeader }
        });

        if (response.ok) {
          fetchVeterinarios();
          mostrarMensaje("Veterinario eliminado correctamente", "success");
        } else {
          mostrarMensaje("Error al eliminar", "error");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleToggleEstado = async (veterinario) => {
    const nuevoEstado = veterinario.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    
    try {
      const vetActualizado = { ...veterinario, estado: nuevoEstado };
      
      const response = await fetch(`${API_URL}/${veterinario.idVeterinario}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": authHeader
        },
        body: JSON.stringify(vetActualizado),
      });

      if (response.ok) {
        fetchVeterinarios();
        mostrarMensaje(`Veterinario marcado como ${nuevoEstado}`, "info");
      } else {
        mostrarMensaje("No se pudo cambiar el estado", "error");
      }
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error de conexión", "error");
    }
  };

  const handleOpenHistory = async (veterinario) => {
    setSelectedVetName(`${veterinario.nombre} ${veterinario.apellido}`);
    
    try {
        const response = await fetch(API_CITAS, {
            headers: { "Authorization": authHeader }
        });
        if (response.ok) {
            const todasLasCitas = await response.json();
            // Filtramos: Que sean de este veterinario Y que ya estén realizadas
            const atencionesDelVet = todasLasCitas.filter(c => 
                c.veterinario?.idVeterinario === veterinario.idVeterinario && 
                c.estado === 'REALIZADA'
            );
            // Ordenar por fecha reciente
            atencionesDelVet.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
            setHistorialAtenciones(atencionesDelVet);
        }
    } catch (error) {
        console.error("Error cargando atenciones:", error);
        setHistorialAtenciones([]);
    }
    setOpenHistory(true);
  };

  // --- MANEJO DE UI ---

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ idVeterinario: null, cedula: "", nombre: "", apellido: "", telefono: "", email: "", especialidad: "", estado: "ACTIVO" });
    setOpenForm(true);
  };

  const handleOpenEdit = (vet) => {
    setIsEditing(true);
    setFormData(vet);
    setOpenForm(true);
  };

  const handleCloseForm = () => setOpenForm(false);
  const handleCloseHistory = () => setOpenHistory(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const mostrarMensaje = (text, type) => {
    setMensaje({ open: true, text, type });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          👨‍⚕️ Gestión de Veterinarios
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nuevo Veterinario
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cédula</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre Completo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Especialidad</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {veterinarios.length > 0 ? (
              veterinarios.map((vet) => (
                <TableRow key={vet.idVeterinario}>
                  <TableCell>{vet.idVeterinario}</TableCell>
                  <TableCell>{vet.cedula}</TableCell> {/* Dato de Cédula */}
                  <TableCell>{vet.nombre} {vet.apellido}</TableCell> {/* Dato de Nombre */}
                  <TableCell>
                    <Chip label={vet.especialidad} color="info" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>
                    <div>{vet.telefono}</div>
                    <div style={{ fontSize: "0.8em", color: "gray" }}>{vet.email}</div>
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                        size="small" 
                        variant={vet.estado === "ACTIVO" ? "contained" : "outlined"}
                        color={vet.estado === "ACTIVO" ? "success" : "error"}
                        onClick={() => handleToggleEstado(vet)}
                        sx={{ fontSize: "0.7rem", minWidth: "80px" }}
                    >
                        {vet.estado}
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="secondary" title="Ver Atenciones" onClick={() => handleOpenHistory(vet)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleOpenEdit(vet)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(vet.idVeterinario)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay veterinarios registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- MODAL 1: FORMULARIO --- */}
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>{isEditing ? "Editar Veterinario" : "Registrar Veterinario"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: "350px" }}>
            <TextField label="Cédula / Documento" name="cedula" value={formData.cedula} onChange={handleChange} fullWidth required autoFocus />
            <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
            <TextField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} fullWidth required />
            <TextField label="Especialidad" name="especialidad" value={formData.especialidad} onChange={handleChange} fullWidth required placeholder="Ej: Cirugía, General" />
            <TextField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth type="email" />
            
            <TextField select label="Estado" name="estado" value={formData.estado} onChange={handleChange} fullWidth>
                <MenuItem value="ACTIVO">Activo</MenuItem>
                <MenuItem value="INACTIVO">Inactivo</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 2: HISTORIAL --- */}
      <Dialog open={openHistory} onClose={handleCloseHistory} maxWidth="md" fullWidth>
        <DialogTitle>
            <Stack direction="row" alignItems="center" gap={1}>
                <MedicalServicesIcon color="primary"/> 
                Historial de Atenciones: {selectedVetName}
            </Stack>
        </DialogTitle>
        <DialogContent dividers>
            {historialAtenciones.length > 0 ? (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Mascota</TableCell>
                                <TableCell>Motivo</TableCell>
                                <TableCell>Diagnóstico</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {historialAtenciones.map((cita) => (
                                <TableRow key={cita.idCita}>
                                    <TableCell>
                                        {new Date(cita.fechaHora).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{cita.mascota?.nombre}</TableCell>
                                    <TableCell>{cita.motivo}</TableCell>
                                    <TableCell>{cita.observaciones || "Sin diagnóstico"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Alert severity="info">
                    No se encontraron atenciones registradas.
                </Alert>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseHistory}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={mensaje.open} 
        autoHideDuration={6000} 
        onClose={() => setMensaje({ ...mensaje, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity={mensaje.type} sx={{ width: '100%' }} onClose={() => setMensaje({ ...mensaje, open: false })}>
          {mensaje.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VeterinariosList;