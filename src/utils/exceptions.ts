import { EXCEPTION_TYPES } from "@/constants/exceptions";

export class Exception extends Error {
    constructor(public message: string, public statusCode: number, public type: string) {
        super(message);
        this.statusCode = statusCode;
        this.type = type;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestException extends Exception {
    constructor(public message: string) {
        super(message, 400, EXCEPTION_TYPES.BAD_REQUEST);
    }
}

export class UnauthorizedException extends Exception {
    constructor(public message: string) {
        super(message, 401, EXCEPTION_TYPES.UNAUTHORIZED);
    }
}

export class ForbiddenException extends Exception {
    constructor(public message: string) {
        super(message, 403, EXCEPTION_TYPES.FORBIDDEN);
    }
}

export class NotFoundException extends Exception {
    constructor(public message: string) {
        super(message, 404, EXCEPTION_TYPES.NOT_FOUND);
    }
}

export class ConflictException extends Exception {
    constructor(public message: string) {
        super(message, 409, EXCEPTION_TYPES.CONFLICT);
    }
}

export class RequestTooLongException extends Exception {
    constructor(public message: string) {
        super(message, 413, EXCEPTION_TYPES.REQUEST_TOO_LONG);
    }
}
