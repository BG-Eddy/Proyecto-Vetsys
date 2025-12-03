import React, { useState, useEffect } from "react";
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Alert, Snackbar
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

// 1. IMPORTAR CONTEXTO DE SEGURIDAD
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:8080/api/propietarios";

const PropietarioList = () => {
  // 2. OBTENER TOKEN
  const { authHeader } = useAuth();

  const [propietarios, setPropietarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mensaje, setMensaje] = useState({ open: false, text: "", type: "success" });

  const [formData, setFormData] = useState({
    idPropietario: null, nombre: "", apellido: "", telefono: "", email: ""
  });

  // 3. EFECTO PROTEGIDO
  useEffect(() => {
    if (authHeader) {
        fetchPropietarios();
    }
  }, [authHeader]);

  const fetchPropietarios = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { "Authorization": authHeader } // <--- CABECERA
      });
      if (!response.ok) throw new Error("Error al cargar datos");
      const data = await response.json();
      setPropietarios(data);
    } catch (error) {
      mostrarMensaje("Error al conectar con el servidor", "error");
    }
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.apellido) {
        mostrarMensaje("Nombre y Apellido son obligatorios", "warning");
        return;
    }

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${API_URL}/${formData.idPropietario}`, {
          method: "PUT",
          headers: { 
              "Content-Type": "application/json",
              "Authorization": authHeader // <--- CABECERA
          },
          body: JSON.stringify(formData),
        });
      } else {
        const datosParaEnviar = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            email: formData.email
        };
        response = await fetch(API_URL, {
          method: "POST",
          headers: { 
              "Content-Type": "application/json",
              "Authorization": authHeader // <--- CABECERA
          },
          body: JSON.stringify(datosParaEnviar),
        });
      }

      if (response.ok) {
        fetchPropietarios();
        handleClose();
        mostrarMensaje(isEditing ? "Propietario actualizado" : "Propietario registrado", "success");
      } else {
        mostrarMensaje("Error al guardar.", "error");
      }
    } catch (error) {
      mostrarMensaje("Error de conexión", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este propietario?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { "Authorization": authHeader } // <--- CABECERA
        });

        if (response.ok) {
          fetchPropietarios();
          mostrarMensaje("Propietario eliminado", "success");
        } else {
          mostrarMensaje("Error al eliminar.", "error");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ idPropietario: null, nombre: "", apellido: "", telefono: "", email: "" });
    setOpen(true);
  };

  const handleOpenEdit = (propietario) => {
    setIsEditing(true);
    setFormData({
      idPropietario: propietario.idPropietario,
      nombre: propietario.nombre,
      apellido: propietario.apellido,
      telefono: propietario.telefono || "",
      email: propietario.email || ""
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const mostrarMensaje = (text, type) => setMensaje({ open: true, text, type });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">Gestión de Propietarios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Nuevo Propietario</Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {propietarios.length > 0 ? (
              propietarios.map((prop) => (
                <TableRow key={prop.idPropietario}>
                  <TableCell>{prop.idPropietario}</TableCell>
                  <TableCell>{prop.nombre}</TableCell>
                  <TableCell>{prop.apellido}</TableCell>
                  <TableCell>{prop.telefono}</TableCell>
                  <TableCell>{prop.email}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="primary" onClick={() => handleOpenEdit(prop)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(prop.idPropietario)}><DeleteIcon /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No hay propietarios registrados.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Editar Propietario" : "Registrar Propietario"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: "300px" }}>
            <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
            <TextField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} fullWidth required />
            <TextField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth type="email" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={mensaje.open} autoHideDuration={6000} onClose={() => setMensaje({ ...mensaje, open: false })}>
        <Alert severity={mensaje.type} sx={{ width: '100%' }}>{mensaje.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default PropietarioList;