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

export type AuthBroadcastMessage =
  | { type: 'REFRESH_SUCCESS'; accessToken: string; expiresIn: number; expiresAt: number }
  | { type: 'REFRESH_FAILURE' }
  | { type: 'LOGIN_SUCCESS'; accessToken: string; expiresIn: number; expiresAt: number }
  | { type: 'LOGOUT' };


export interface AuthUsernameChangeRequest {
  username: string;
  password: string;
}

export interface AuthPasswordChangeRequest {
  oldPassword: string;
  password: string;
}
