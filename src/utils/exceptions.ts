import { EXCEPTION_TYPES } from "@/constants/exceptions";

export class Exception extends Error {
    constructor(public message: string, public statusCode: number, public type: string, public data?: any) {
        super(message);
        this.statusCode = statusCode;
        this.type = type;
        this.data = data;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestException extends Exception {
    constructor(public message: string, public data?: any) {
        super(message, 400, EXCEPTION_TYPES.BAD_REQUEST, data);
    }
}

export class UnauthorizedException extends Exception {
    constructor(public message: string, public data?: any) {
        super(message, 401, EXCEPTION_TYPES.UNAUTHORIZED, data);
    }
}

export class ForbiddenException extends Exception {
    constructor(public message: string, public data?: any) {
        super(message, 403, EXCEPTION_TYPES.FORBIDDEN, data);
    }
}

export class NotFoundException extends Exception {
    constructor(public message: string, public data?: any) {
        super(message, 404, EXCEPTION_TYPES.NOT_FOUND, data);
    }
}

export class ConflictException extends Exception {
    constructor(public message: string, public data?: any) {
        super(message, 409, EXCEPTION_TYPES.CONFLICT, data);
    }
}

export class RequestTooLongException extends Exception {
    constructor(public message: string, public data?: any) {
        super(message, 413, EXCEPTION_TYPES.REQUEST_TOO_LONG, data);
    }
}

export class ServiceUnavailableException extends Exception {
    constructor(public message: string, public data?: any) {
        super(message, 503, EXCEPTION_TYPES.SERVICE_UNAVAILABLE, data);
    }
}
