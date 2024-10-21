-- Para crear la tabla usuarios vacía

CREATE TABLE usuarios (
    correo VARCHAR(100) PRIMARY KEY,    -- Campo para el correo que es el identificador del usuario
    nombre VARCHAR(100) NOT NULL,       -- Campo para el nombre completo del usuario
    telefono VARCHAR(15) NOT NULL,      -- Campo para el teléfono del usuario
    pass VARCHAR(255) NOT NULL          -- Campo para la contraseña del usuario
);
