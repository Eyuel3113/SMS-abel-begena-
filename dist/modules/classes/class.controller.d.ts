import { Request, Response } from 'express';
export declare const createClass: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listClasses: (req: Request, res: Response) => Promise<void>;
export declare const createSchedule: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listSchedules: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
