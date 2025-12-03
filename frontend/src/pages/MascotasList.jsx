import React, { useState, useEffect } from "react";
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Alert, Snackbar, MenuItem, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import PetsIcon from "@mui/icons-material/Pets";
import moment from "moment"; 

// 1. IMPORTAR CONTEXTO
import { useAuth } from "../context/AuthContext";

const API_URL_MASCOTAS = "http://localhost:8080/api/mascotas";
const API_URL_PROPIETARIOS = "http://localhost:8080/api/propietarios";

const MascotasList = () => {
  // 2. OBTENER TOKEN
  const { authHeader } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [propietarios, setPropietarios] = useState([]); 
  const [open, setOpen] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);
  const [mensaje, setMensaje] = useState({ open: false, text: "", type: "success" });

  const [formData, setFormData] = useState({
    idMascota: null, nombre: "", especie: "", raza: "", sexo: "", fechaNacimiento: "", idPropietario: "", 
  });

  // 3. EFECTO PROTEGIDO
  useEffect(() => {
    if (authHeader) {
        fetchMascotas();
        fetchPropietarios();
    }
  }, [authHeader]);

  const fetchMascotas = async () => {
    try {
      const response = await fetch(API_URL_MASCOTAS, {
        headers: { "Authorization": authHeader } // <--- CABECERA
      });
      if (!response.ok) throw new Error("Error al cargar las mascotas");
      const data = await response.json();
      setMascotas(data);
    } catch (error) {
      mostrarMensaje("Error al conectar con el servidor", "error");
    }
  };

  const fetchPropietarios = async () => {
    try {
      const response = await fetch(API_URL_PROPIETARIOS, {
        headers: { "Authorization": authHeader } // <--- CABECERA
      });
      if (!response.ok) throw new Error("Error al cargar propietarios");
      const data = await response.json();
      setPropietarios(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.especie || !formData.idPropietario) {
      mostrarMensaje("Nombre, Especie y Propietario son obligatorios", "warning");
      return;
    }

    try {
      let response;
      const payload = {
          ...formData,
          idPropietario: parseInt(formData.idPropietario)
      };

      const headers = { 
          "Content-Type": "application/json",
          "Authorization": authHeader // <--- CABECERA
      };

      if (isEditing) {
        response = await fetch(`${API_URL_MASCOTAS}/${formData.idMascota}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(API_URL_MASCOTAS, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        fetchMascotas(); 
        handleClose();
        mostrarMensaje(isEditing ? "Mascota actualizada" : "Mascota registrada", "success");
      } else {
        const errorText = await response.text(); 
        mostrarMensaje(`Error: ${errorText}`, "error");
      }
    } catch (error) {
      mostrarMensaje("Error de conexión", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta mascota?")) {
      try {
        const response = await fetch(`${API_URL_MASCOTAS}/${id}`, {
          method: "DELETE",
          headers: { "Authorization": authHeader } // <--- CABECERA
        });

        if (response.ok) {
          fetchMascotas();
          mostrarMensaje("Mascota eliminada", "success");
        } else {
          mostrarMensaje("Error al eliminar", "error");
        }
      } catch (error) {
        mostrarMensaje("Error de conexión", "error");
      }
    }
  };

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Especie/Raza</TableCell>
              <TableCell>Dueño</TableCell>
              <TableCell>Nacimiento</TableCell>
              <TableCell>Registro</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mascotas.length > 0 ? (
              mascotas.map((mascota) => (
                <TableRow key={mascota.idMascota}>
                  <TableCell>{mascota.idMascota}</TableCell>
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
                  <TableCell>{mascota.fechaRegistro ? moment(mascota.fechaRegistro).format("DD/MM/YYYY HH:mm") : "N/A"}</TableCell>
                  <TableCell>
                      <Chip label={mascota.estado} color="success" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="primary" onClick={() => handleOpenEdit(mascota)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(mascota.idMascota)}><DeleteIcon /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">No hay mascotas registradas.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Editar Mascota" : "Registrar Mascota"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: "300px" }}>
            <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
            <TextField select label="Propietario" name="idPropietario" value={formData.idPropietario} onChange={handleChange} fullWidth required>
              <MenuItem value="" disabled>Seleccione un propietario</MenuItem>
              {propietarios.map((prop) => (
                <MenuItem key={prop.idPropietario} value={prop.idPropietario}>
                  {prop.nombre} {prop.apellido}
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

      <Snackbar open={mensaje.open} autoHideDuration={6000} onClose={() => setMensaje({ ...mensaje, open: false })}>
        <Alert severity={mensaje.type} sx={{ width: '100%' }}>{mensaje.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default MascotasList;