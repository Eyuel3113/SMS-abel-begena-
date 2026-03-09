export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashed: string) => Promise<boolean>;
export declare const generateAccessToken: (payload: object) => string;
export declare const generateRefreshToken: (payload: object) => string;
export declare const verifyAccessToken: (token: string) => any;
export declare const verifyRefreshToken: (token: string) => any;
