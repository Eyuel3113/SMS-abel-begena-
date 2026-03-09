import { Request, Response } from 'express';
export declare const createTeacher: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listTeachers: (req: Request, res: Response) => Promise<void>;
export declare const updateTeacher: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
