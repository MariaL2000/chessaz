export interface SendReviewNotificationParams {
  adminEmail: string;
  teacherName: string | null;
  teacherEmail?: string | null;
  resourceTitle: string;
  category: string;
  type: string;
  price: number;
}
