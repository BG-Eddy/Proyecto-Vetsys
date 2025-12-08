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
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Divider,
  TextField,
  InputAdornment
} from "@mui/material";

// Iconos
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PetsIcon from '@mui/icons-material/Pets';
import PrintIcon from '@mui/icons-material/Print';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const API_URL = `${BASE_URL}/facturas`;

const FacturasList = () => {
  const { authHeader } = useAuth();
  const location = useLocation();

  const [facturas, setFacturas] = useState([]);
  const [filtro, setFiltro] = useState(location.state?.filtro || "");
  
  // Estados para el Modal
  const [openDetalle, setOpenDetalle] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  // --- 1. DEFINIR FUNCIÓN FETCH ANTES DEL USEEFFECT ---
  const fetchFacturas = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { 
            "Authorization": authHeader,
            "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ordenar: la más reciente primero
        data.sort((a, b) => new Date(b.fechaFactura) - new Date(a.fechaFactura));
        setFacturas(data);
      } else {
        console.error("Error al cargar facturas");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  useEffect(() => {
    if (authHeader) {
        fetchFacturas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  useEffect(() => {
    if (location.state?.filtro) {
        setFiltro(location.state.filtro);
    }
  }, [location.state]);

  // --- 2. FILTRADO ---
  const facturasFiltradas = facturas.filter((f) => {
      const texto = filtro.toLowerCase();
      const id = f.idFactura.toString();
      const cliente = `${f.propietario?.nombre} ${f.propietario?.apellido}`.toLowerCase();
      const cedula = f.propietario?.cedula || ""; // Buscamos también por cédula
      
      return id.includes(texto) || cliente.includes(texto) || cedula.includes(texto);
  });

  // --- MANEJO DEL MODAL ---
  const handleOpenDetalle = (factura) => {
    setFacturaSeleccionada(factura);
    setOpenDetalle(true);
  };

  const handleCloseDetalle = () => {
    setOpenDetalle(false);
    setFacturaSeleccionada(null);
  };

  // --- 3. FUNCIÓN DE IMPRESIÓN ACTUALIZADA ---
  const imprimirFactura = () => {
    if (!facturaSeleccionada) return;

    let nombreMascota = "No especificado";
    if (facturaSeleccionada.cita?.mascota) {
        nombreMascota = `${facturaSeleccionada.cita.mascota.nombre} (${facturaSeleccionada.cita.mascota.especie})`;
    } else if (facturaSeleccionada.detalles?.length > 0) {
        nombreMascota = facturaSeleccionada.detalles[0].mascota?.nombre || "Varios";
    }

    let detallesClinicosHTML = '';
    if (facturaSeleccionada.cita) {
        detallesClinicosHTML = `
            <div class="section-box clinical">
                <h3>DETALLE DE LA ATENCIÓN CLÍNICA</h3>
                <table class="info-table">
                    <tr>
                        <td class="label"><strong>PACIENTE:</strong></td>
                        <td class="highlight">${nombreMascota}</td>
                    </tr>
                    <tr>
                        <td class="label"><strong>TRATAMIENTO:</strong></td> <td>${facturaSeleccionada.cita.tratamiento || 'No registrado'}</td>
                    </tr>
                    <tr>
                        <td class="label"><strong>Motivo Consulta:</strong></td>
                        <td>${facturaSeleccionada.cita.motivo || '-'}</td>
                    </tr>
                    <tr>
                        <td class="label"><strong>Diagnóstico / Obs:</strong></td>
                        <td>${facturaSeleccionada.cita.observaciones || 'Sin observaciones'}</td>
                    </tr>
                </table>
            </div>
        `;
    }

    const ventanaImpresion = window.open('', 'PRINT', 'height=600,width=800');

    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Factura #${facturaSeleccionada.idFactura}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; font-size: 14px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1976d2; padding-bottom: 15px; }
            .header h1 { margin: 0; color: #1976d2; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 5px 0; color: #666; font-size: 12px; }
            .info-grid { display: flex; gap: 20px; margin-bottom: 25px; }
            .box { flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #fdfdfd; }
            .box h4 { margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #555; text-transform: uppercase; font-size: 12px; }
            .box p { margin: 4px 0; }
            .section-box.clinical { margin-bottom: 25px; border: 1px solid #90caf9; background-color: #e3f2fd; padding: 15px; border-radius: 5px; }
            .clinical h3 { margin-top: 0; color: #1565c0; font-size: 14px; border-bottom: 1px solid #bbdefb; padding-bottom: 8px; margin-bottom: 10px; }
            .info-table { width: 100%; border-collapse: collapse; }
            .info-table td { padding: 4px; vertical-align: top; }
            .info-table .label { width: 180px; font-weight: bold; color: #444; }
            .info-table .highlight { font-weight: bold; font-size: 15px; color: #000; }
            .total-section { text-align: right; margin-top: 40px; font-size: 26px; font-weight: bold; color: #2e7d32; border-top: 2px solid #eee; padding-top: 15px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Clínica Veterinaria VetSys</h1>
            <p>Comprobante de Servicio Veterinario</p>
          </div>

          <div class="info-grid">
            <div class="box">
              <h4>Cliente (Propietario)</h4>
              <p><strong>Nombre:</strong> ${facturaSeleccionada.propietario?.nombre} ${facturaSeleccionada.propietario?.apellido}</p>
              <p><strong>Cédula:</strong> ${facturaSeleccionada.propietario?.cedula || 'N/A'}</p> <p><strong>Email:</strong> ${facturaSeleccionada.propietario?.email || 'N/A'}</p>
            </div>
            <div class="box">
              <h4>Datos del Comprobante</h4>
              <p><strong>N° Factura:</strong> ${facturaSeleccionada.idFactura}</p>
              <p><strong>Fecha:</strong> ${new Date(facturaSeleccionada.fechaFactura).toLocaleString()}</p>
            </div>
          </div>

          ${detallesClinicosHTML}

          <div class="total-section">
            TOTAL PAGADO: $${facturaSeleccionada.total?.toFixed(2)}
          </div>

          <div class="footer">
            Gracias por confiar en nosotros.<br>
            Sistema VetSys
          </div>
        </body>
      </html>
    `);

    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    setTimeout(() => {
        ventanaImpresion.print();
        ventanaImpresion.close();
    }, 500);
  };

  const getOrigenEtiqueta = (cita) => {
      // Si no hay cita asociada, es una venta de mostrador
      if (!cita) return <Chip label="Venta Directa" color="default" size="small" variant="outlined"/>;
      
      const motivo = cita.motivo?.toUpperCase() || "";
      
      // Lógica de detección por palabras clave
      if (motivo.includes("CONTROL")) {
          return <Chip label="Control / Seguimiento" color="info" size="small" variant="outlined"/>;
      } else if (motivo.includes("URGENCIA") || motivo.includes("INMEDIATA") || motivo.includes("EMERGENCIA")) {
          return <Chip label="Urgencia" color="error" size="small" variant="outlined"/>;
      } else {
          return <Chip label="Consulta General" color="primary" size="small" variant="outlined"/>;
      }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Gestión de Facturación
        </Typography>
      </Stack>

      {/* --- BARRA DE BÚSQUEDA --- */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por N° Factura, Cédula o Nombre del Cliente..."
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

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>N°</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cédula</TableCell> {/* NUEVA COLUMNA */}
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mascota Ref.</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Origen</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturasFiltradas.length > 0 ? (
              facturasFiltradas.map((factura) => (
                <TableRow key={factura.idFactura} hover>
                  <TableCell>#{factura.idFactura}</TableCell>
                  <TableCell>{new Date(factura.fechaFactura).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {factura.propietario?.nombre} {factura.propietario?.apellido}
                  </TableCell>
                  <TableCell>{factura.propietario?.cedula || "N/A"}</TableCell>
                  <TableCell>
                     <Stack direction="row" alignItems="center" spacing={1}>
                        <PetsIcon fontSize="small" color="action"/>
                        <Typography variant="body2">
                            {factura.cita?.mascota?.nombre || (factura.detalles.length > 0 ? factura.detalles[0].mascota?.nombre : "Varios")}
                        </Typography>
                     </Stack>
                  </TableCell>
                  <TableCell aling="center">
                    {getOrigenEtiqueta(factura.cita)}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="success.main">
                        ${factura.total?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenDetalle(factura)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  No se encontraron facturas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- MODAL DE DETALLE --- */}
      <Dialog open={openDetalle} onClose={handleCloseDetalle} maxWidth="md" fullWidth>
        {facturaSeleccionada && (
            <>
                <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <ReceiptIcon color="primary"/>
                            <Typography variant="h6">Factura #{facturaSeleccionada.idFactura}</Typography>
                        </Stack>
                        <Typography variant="body2" color="textSecondary">
                            {new Date(facturaSeleccionada.fechaFactura).toLocaleString()}
                        </Typography>
                    </Stack>
                </DialogTitle>
                
                <DialogContent sx={{ mt: 2 }}>
                    
                    {/* DATOS CLIENTE */}
                    <Box mb={2} p={2} sx={{ bgcolor: '#fff', border: '1px solid #eee', borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <PersonIcon color="action"/>
                            <Typography variant="subtitle2" fontWeight="bold">DATOS DEL CLIENTE</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Nombre:</Typography>
                                <Typography variant="body1">
                                    {facturaSeleccionada.propietario?.nombre} {facturaSeleccionada.propietario?.apellido}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Cédula:</Typography>
                                <Typography variant="body1">
                                    {facturaSeleccionada.propietario?.cedula || "N/A"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary">Email:</Typography>
                                <Typography variant="body2">
                                    {facturaSeleccionada.propietario?.email || "Sin email registrado"}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* INFO CLÍNICA */}
                    {facturaSeleccionada.cita && (
                        <Box mb={3} p={2} sx={{ bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                <MedicalInformationIcon color="primary" />
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                    DETALLE DE LA ATENCIÓN CLÍNICA
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2, borderColor: '#bbdefb' }} />
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary">PACIENTE:</Typography>
                                    <Typography variant="h6" color="textPrimary">
                                        {facturaSeleccionada.cita.mascota?.nombre} ({facturaSeleccionada.cita.mascota?.especie})
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary">TRATAMIENTO:</Typography> {/* TEXTO CORREGIDO */}
                                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.7)', mt: 0.5, border:'1px solid #bbdefb' }}>
                                        <Typography variant="body1" fontWeight="medium">
                                            {facturaSeleccionada.cita.tratamiento || "No especificado"}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="textSecondary">MOTIVO CONSULTA:</Typography>
                                    <Typography variant="body2">{facturaSeleccionada.cita.motivo || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="textSecondary">DIAGNÓSTICO / OBS:</Typography>
                                    <Typography variant="body2">{facturaSeleccionada.cita.observaciones || '-'}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* TOTAL */}
                    <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mt={3}>
                        <Typography variant="h6" color="textSecondary">TOTAL PAGADO:</Typography>
                        <Stack direction="row" alignItems="center">
                            <MonetizationOnIcon color="success" fontSize="large"/>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                ${facturaSeleccionada.total?.toFixed(2)}
                            </Typography>
                        </Stack>
                    </Stack>

                </DialogContent>
                
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={imprimirFactura} 
                        variant="contained" 
                        color="primary"
                        startIcon={<PrintIcon />}
                        sx={{ mr: 1 }}
                    >
                        IMPRIMIR COMPROBANTE
                    </Button>
                    <Button onClick={handleCloseDetalle} color="inherit" variant="outlined">
                        CERRAR
                    </Button>
                </DialogActions>
            </>
        )}
      </Dialog>
    </Container>
  );
};

export default FacturasList;