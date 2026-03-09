import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare const recordAttendance: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAttendanceSummary: (req: Request, res: Response) => Promise<void>;
