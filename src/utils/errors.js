export const ErrorTypes = {
    INVALID_INPUT: 'INVALID_INPUT',
    NOT_FOUND: 'NOT_FOUND',
    DATABASE_ERROR: 'DATABASE_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR'
}

export const ErrorMessages = {
    PET: {
        INCOMPLETE_VALUES: 'All pet fields are required (name, specie, birthDate)',
        NOT_FOUND: 'Pet not found',
        ALREADY_ADOPTED: 'Pet is already adopted'
    },
    USER: {
        INCOMPLETE_VALUES: 'All user fields are required',
        INVALID_EMAIL: 'Invalid email format',
        EMAIL_EXISTS: 'Email already registered',
        NOT_FOUND: 'User not found',
        INVALID_PASSWORD: 'Invalid password'
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