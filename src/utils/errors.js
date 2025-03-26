export const ErrorTypes = {
    INVALID_INPUT: 'Input invalido',
    NOT_FOUND: 'No encontrado',
    DATABASE_ERROR: 'Error de la base de datos',
    AUTHENTICATION_ERROR: 'Error de autenticación'
}

export const ErrorMessages = {
    PET: {
        INCOMPLETE_VALUES: 'Todos los campos son requeridos (nombre, especie, fecha de nacimiento)',
        NOT_FOUND: 'Mascota no encontrada',
        ALREADY_ADOPTED: 'La mascota ya ha sido adoptada'
    },
    USER: {
        INCOMPLETE_VALUES: 'Todos los campos del usuario son requeridos',
        INVALID_EMAIL: 'Formato de Emain invalido',
        EMAIL_EXISTS: 'Este Email ya se ha registrado',
        NOT_FOUND: 'Usuario no encontrado',
        INVALID_PASSWORD: 'Contraseña invalida'
    }
}

export class CustomError {
    constructor(type, message) {
        this.type = type;
        this.message = message;
    }

    static createError({ type, message }) {
        return new CustomError(type, message);
    }
}