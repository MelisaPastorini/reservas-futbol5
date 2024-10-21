-- Para crear la tabla reservas vacía

CREATE TABLE reservas (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,                      -- Campo para el ID de la reserva (autoincremental)
    hora TIME NOT NULL,                                         -- Campo para la hora de la reserva
    cancha INT(11) NOT NULL CHECK (cancha BETWEEN 1 AND 10),    -- Campo para la cancha (solo valores entre 1 y 10)
    fecha DATE NOT NULL,                                        -- Campo para la fecha de la reserva
    estado ENUM('disponible', 'reservado') DEFAULT 'disponible', -- Campo para el estado de la reserva
    usuario VARCHAR(255) NOT NULL,                              -- Campo para almacenar el correo del usuario (referencia a la sesión)
    FOREIGN KEY (usuario) REFERENCES usuarios(correo)           -- Relación con la tabla usuarios (correo del usuario logueado)
);
