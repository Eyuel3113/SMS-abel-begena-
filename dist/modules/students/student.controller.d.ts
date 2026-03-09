import { Request, Response } from 'express';
export declare const createStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listStudents: (req: Request, res: Response) => Promise<void>;
export declare const getStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteStudent: (req: Request, res: Response) => Promise<void>;
