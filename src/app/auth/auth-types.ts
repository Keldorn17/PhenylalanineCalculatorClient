export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthRegisterRequest {
  email: string;
  username: string;
  password: string;
}
