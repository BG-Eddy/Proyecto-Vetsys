import React, { useState, useEffect } from "react";
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Alert, Snackbar, InputAdornment, Tooltip, Box, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import PetsIcon from "@mui/icons-material/Pets";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// APIs
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const API_URL = `${BASE_URL}/propietarios`;
const API_MASCOTAS = `${BASE_URL}/mascotas`;
const API_FACTURAS = `${BASE_URL}/facturas`;

const PropietarioList = () => {
  const { authHeader } = useAuth();
  const navigate = useNavigate(); 

  // --- ESTADOS ---
  const [propietarios, setPropietarios] = useState([]);
  
  const [filtro, setFiltro] = useState(""); 
  const [openForm, setOpenForm] = useState(false);
  const [openMascotas, setOpenMascotas] = useState(false);
  const [openFacturas, setOpenFacturas] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mensaje, setMensaje] = useState({ open: false, text: "", type: "success" });
  
  const [selectedPropietario, setSelectedPropietario] = useState(null);
  const [relatedData, setRelatedData] = useState([]); 

  const [formData, setFormData] = useState({
    idPropietario: null, cedula: "", nombre: "", apellido: "", telefono: "", email: ""
  });

  // --- CARGA DE DATOS ---
  const fetchPropietarios = async () => {
    try {
      const response = await fetch(API_URL, { headers: { "Authorization": authHeader } });
      if (response.ok) setPropietarios(await response.json());
    } catch { mostrarMensaje("Error de conexión", "error"); }
  };

  const fetchMascotas = async () => {
      try {
          const response = await fetch(API_MASCOTAS, { headers: { "Authorization": authHeader } });
          if (response.ok) return await response.json();
      } catch { return []; }
  };

  const fetchFacturas = async () => {
      try {
          const response = await fetch(API_FACTURAS, { headers: { "Authorization": authHeader } });
          if (response.ok) return await response.json();
      } catch { return []; }
  };

  useEffect(() => {
    if (authHeader) {
        fetchPropietarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  // --- FILTRO ---
  const propietariosFiltrados = propietarios.filter((p) => 
    p.cedula?.includes(filtro) || 
    p.nombre?.toLowerCase().includes(filtro.toLowerCase()) || 
    p.apellido?.toLowerCase().includes(filtro.toLowerCase())
  );

  // --- HANDLERS ACCIONES ---
  const handleVerMascotas = async (propietario) => {
      setSelectedPropietario(propietario);
      const listaMascotas = await fetchMascotas(); 
      const mascotasDelDueño = listaMascotas ? listaMascotas.filter(m => m.propietario?.idPropietario === propietario.idPropietario) : [];
      setRelatedData(mascotasDelDueño);
      setOpenMascotas(true);
  };

  const handleVerFacturas = async (propietario) => {
      setSelectedPropietario(propietario);
      const listaFacturas = await fetchFacturas();
      const facturasDelDueño = listaFacturas ? listaFacturas.filter(f => f.propietario?.idPropietario === propietario.idPropietario) : [];
      facturasDelDueño.sort((a, b) => new Date(b.fechaFactura) - new Date(a.fechaFactura));
      setRelatedData(facturasDelDueño);
      setOpenFacturas(true);
  };

  const handleRedirigirMascota = (mascota) => {
      navigate('/mascotas', { state: { filtro: mascota.nombre } });
  };

  const handleRedirigirFactura = (factura) => {
      navigate('/facturas', { state: { filtro: factura.idFactura.toString() } });
  };

  // --- ABM ---
  const handleSave = async () => {
    if (!formData.cedula || !formData.nombre || !formData.apellido) {
        mostrarMensaje("Cédula, Nombre y Apellido son obligatorios", "warning");
        return;
    }
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API_URL}/${formData.idPropietario}` : API_URL;
      
      const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", "Authorization": authHeader },
          body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPropietarios();
        setOpenForm(false);
        mostrarMensaje(isEditing ? "Propietario actualizado" : "Propietario registrado", "success");
      } else {
        const msg = await response.text();
        mostrarMensaje(msg || "Error al guardar", "error");
      }
    } catch { mostrarMensaje("Error de conexión", "error"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar propietario?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { 
            method: "DELETE", headers: { "Authorization": authHeader } 
        });
        if (response.ok) { fetchPropietarios(); mostrarMensaje("Eliminado", "success"); }
      } catch { console.error("Error al eliminar"); }
    }
  };

  // --- UI ---
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ idPropietario: null, cedula: "", nombre: "", apellido: "", telefono: "", email: "" });
    setOpenForm(true);
  };

  const handleOpenEdit = (prop) => {
    setIsEditing(true);
    setFormData(prop);
    setOpenForm(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const mostrarMensaje = (text, type) => setMensaje({ open: true, text, type });

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">Gestión de Propietarios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Nuevo Propietario</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por Cédula, Nombre o Apellido..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cédula</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre Completo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Relaciones</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {propietariosFiltrados.length > 0 ? (
              propietariosFiltrados.map((prop) => (
                <TableRow key={prop.idPropietario} hover>
                  <TableCell><Chip label={prop.cedula} size="small" variant="outlined" /></TableCell>
                  <TableCell>{prop.nombre} {prop.apellido}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{prop.telefono}</Typography>
                    <Typography variant="caption" color="textSecondary">{prop.email}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Ver Mascotas">
                            <IconButton color="secondary" onClick={() => handleVerMascotas(prop)}><PetsIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title="Ver Facturas">
                            <IconButton color="success" onClick={() => handleVerFacturas(prop)}><ReceiptIcon /></IconButton>
                        </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Editar"><IconButton color="primary" onClick={() => handleOpenEdit(prop)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Eliminar"><IconButton color="error" onClick={() => handleDelete(prop.idPropietario)}><DeleteIcon /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} align="center">No se encontraron resultados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{isEditing ? "Editar Propietario" : "Registrar Propietario"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: "350px" }}>
            <TextField label="Cédula / Documento" name="cedula" value={formData.cedula} onChange={handleChange} fullWidth required autoFocus />
            <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
            <TextField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} fullWidth required />
            <TextField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth type="email" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL MASCOTAS (Corregido) --- */}
      <Dialog open={openMascotas} onClose={() => setOpenMascotas(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mascotas de {selectedPropietario?.nombre}</DialogTitle>
        <DialogContent dividers>
            {relatedData.length > 0 ? (
                <Stack spacing={2}>
                    {relatedData.map((m) => (
                        <Paper key={m.idMascota} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">{m.nombre}</Typography>
                                <Typography variant="body2" color="textSecondary">{m.especie} - {m.raza}</Typography>
                            </Box>
                            <Button endIcon={<ArrowForwardIcon />} size="small" onClick={() => handleRedirigirMascota(m)}>
                                Ver Detalle
                            </Button>
                        </Paper>
                    ))}
                </Stack>
            ) : (<Alert severity="info">Este propietario no tiene mascotas registradas.</Alert>)}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenMascotas(false)}>Cerrar</Button></DialogActions>
      </Dialog>

      {/* --- MODAL FACTURAS (Corregido) --- */}
      <Dialog open={openFacturas} onClose={() => setOpenFacturas(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Facturas de {selectedPropietario?.nombre}</DialogTitle>
        <DialogContent dividers>
            {relatedData.length > 0 ? (
                <Stack spacing={2}>
                    {relatedData.map((f) => (
                        <Paper key={f.idFactura} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">Factura #{f.idFactura}</Typography>
                                <Typography variant="body2">{new Date(f.fechaFactura).toLocaleDateString()}</Typography>
                            </Box>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Typography color="success.main" fontWeight="bold">${f.total?.toFixed(2)}</Typography>
                                <IconButton color="primary" size="small" onClick={() => handleRedirigirFactura(f)}>
                                    <ArrowForwardIcon />
                                </IconButton>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            ) : (<Alert severity="info">No hay facturas registradas.</Alert>)}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenFacturas(false)}>Cerrar</Button></DialogActions>
      </Dialog>

      <Snackbar open={mensaje.open} autoHideDuration={6000} onClose={() => setMensaje({ ...mensaje, open: false })}>
        <Alert severity={mensaje.type} sx={{ width: '100%' }}>{mensaje.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default PropietarioList;