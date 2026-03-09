import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare const recordPayment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getStudentPayments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPaymentReports: (req: AuthRequest, res: Response) => Promise<void>;
