export interface CourseSchedule {
  startDate: string;
  endDate: string;
  location: string;
  days: string[];
  schedule: string;
  vacancies: number;
}

export interface Course {
  courseId: string;
  name: string;
  modality: string;
  price: number;
  schedules: CourseSchedule[];
}

export interface CourseClass {
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
}

export interface CourseScheduleDetail {
  scheduleId: string;
  location: string;
  startDate: string;
  endDate: string;
  days: string[];
  schedule: string;
  vacancies: number;
  promotion?: string;
  classes: CourseClass[];
}

export interface CourseDetail {
  courseId: string;
  name: string;
  description: string;
  contents: string;
  requirements: string;
  duration: string;
  modality: string;
  price: number;
  schedules: CourseScheduleDetail[];
}

export interface CourseEnrollment {
  courseId: string;
  scheduleId: string;
}

export interface StudentEnrollment {
  enrollmentId: string;
  paymentStatus: string;
  attendance: boolean;
  course: {
    courseId: string;
    name: string;
    modality: string;
    price: number;
  };
  schedule: {
    scheduleId: string;
    location: string;
    startDate: string;
    endDate: string;
    schedule: string;
    days: string[];
    classes: CourseClass[];
  };
}

export interface AttendanceRequest {
  present: boolean;
}

export interface AttendanceResponse {
  message: string;
  attendancePercentage: string;
  attendance: {
    attendanceId: string;
    date: string;
    present: boolean;
  };
} 