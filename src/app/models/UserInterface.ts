export interface UserInterface {
  id: number;
  username: string;
  email: string;
  profilePictureUrl: string | null;
  password?: string;
  createdAt: string;
  coursesTaken: any[];
  role: 'ADMIN' | 'USER';
}
