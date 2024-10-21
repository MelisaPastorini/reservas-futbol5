<?php

// Incluir el archivo de conexión a la base de datos
include '../includes/db.php';

// Obtener los datos del formulario
$usuario = $_POST['correo'];
$cancha = $_POST['cancha'];
$fecha = $_POST['fecha'];
$hora = $_POST['hora'];

// Verificar si existe el usuario
$sql = "SELECT COUNT(*) as count FROM usuarios WHERE correo = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $usuario);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if ($row['count'] < 1) {
    http_response_code(404);
    echo "Usuario no encontrado";
    exit();
}

// Verificar disponibilidad de la cancha
$sql = "SELECT COUNT(*) as count FROM reservas WHERE cancha = ? AND fecha = ? AND hora = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $cancha, $fecha, $hora);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

// Verificar si hay disponibilidad
if ($row['count'] < 1) {
    // Insertar nueva reserva
    $sql = "INSERT INTO reservas (usuario, cancha, fecha, hora) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("siss", $usuario, $cancha, $fecha, $hora);
    $stmt->execute();
    if ($stmt->affected_rows > 0) {
        echo "Reserva confirmada";
    } else {
        http_response_code(500);
        echo "Error al realizar la reserva: " . $stmt->error;
    }    
} else {
    http_response_code(409);
    echo "No hay disponibilidad";
}

// Cerrar la conexión
$conn->close();
?>