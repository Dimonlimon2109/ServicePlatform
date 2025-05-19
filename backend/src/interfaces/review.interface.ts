export interface Review {
  id: string;
  rating: number;
  comment: string;
  serviceId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  service?: any;
  user?: any;
}
