import User from '../interfaces/user.interface';

declare module 'express-session' {
    interface SessionData {
        user?: User;
    }
}
