import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import scheduleRoutes from './routes/schedules';
import timetableRoutes from './routes/timetable';
import notificationsRoutes from './routes/notifications';
import inquiryRoutes from './routes/inquiries';
import consultationRoutes from './routes/consultations';
import withdrawalRoutes from './routes/withdrawals';
import taskRoutes from './routes/tasks';
import todoRoutes from './routes/todos';
import calendarRoutes from './routes/calendar';
import attendanceRoutes from './routes/attendance';
import newAttendanceRoutes from './routes/newAttendance';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/newAttendance', newAttendanceRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: '영어 학원 관리 시스템 API 서버' });
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📡 API 주소: http://localhost:${PORT}`);
  console.log(`🔐 인증 API: http://localhost:${PORT}/api/auth`);
  console.log(`👥 학생 관리 API: http://localhost:${PORT}/api/students`);
  console.log(`📅 시간표 관리 API: http://localhost:${PORT}/api/schedules`);
  console.log(`⏰ 시간표 API: http://localhost:${PORT}/api/timetable`);
  console.log(`🔔 알림 API: http://localhost:${PORT}/api/notifications`);
}); 