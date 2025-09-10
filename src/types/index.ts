import { Request } from "express";

// Enums
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

// Base types from schema
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  projects: Project[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  priced?: number | null;
  isOpenBidding: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: User;
  message?: Message | null;
}

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  project: Project;
}

// Input types for API operations
export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  budget: number;
  priced?: number;
  isOpenBidding?: boolean;
  userId: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  budget?: number;
  priced?: number;
  isOpenBidding?: boolean;
  isCompleted?: boolean;
}

export interface CreateMessageInput {
  content: string;
  projectId: string;
}

export interface UpdateMessageInput {
  content?: string;
}

// Response types
export interface AuthResponse {
  message: string;
  token?: string;
  user?: Omit<User, "password">;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Utility types
export type UserWithoutPassword = Omit<User, "password">;
export type ProjectWithUser = Project & { user: UserWithoutPassword };
export type MessageWithProject = Message & { project: ProjectWithUser };

// JWT Payload type
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
}

// Socket.IO event types
export interface SocketEvents {
  webmsg: (message: string) => void;
  discordmsg: (message: string) => void;
  connect: () => void;
  disconnect: () => void;
}

// Request types with user context
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
