<?php

// Incluir el archivo de conexión a la base de datos
include '../includes/db.php';

// Obtener los datos del formulario
$start = $_GET['start'];
$end = $_GET['end'];

// Verificar disponibilidad de la cancha
$sql = "SELECT fecha, hora, COUNT(*) as count FROM reservas WHERE fecha BETWEEN ? AND ? GROUP BY fecha, hora";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $start, $end);
$stmt->execute();
$result = $stmt->get_result();

// Crear un arreglo con la disponibilidad
$disponibilidad = [];
while ($row = $result->fetch_assoc()) {
    $key = $row['fecha'] . ' ' . $row['hora'];
    $disponibilidad[$key] = $row['count'];
}

// Enviar la respuesta en formato JSON
echo json_encode($disponibilidad);

// Cerrar la conexión
$conn->close();
?>