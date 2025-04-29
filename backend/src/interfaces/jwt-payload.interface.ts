export interface JwtPayload {
    sub: string;
    email: string;
    userType: 'USER' | 'ADMIN';
  }