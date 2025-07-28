import express from 'express';
import { authMiddleware } from '../middleware/auth';
import * as attendanceController from '../controllers/attendanceController';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 출석부 유형 관련 라우트
router.get('/types', attendanceController.getAttendanceTypes);
router.post('/types', attendanceController.createAttendanceType);
router.delete('/types/:id', attendanceController.deleteAttendanceType);

// 학생 관리 라우트
router.get('/types/:typeId/students', attendanceController.getStudentsByType);
router.post('/students', attendanceController.createStudent);
router.put('/students/:id', attendanceController.updateStudent);
router.delete('/students/:id', attendanceController.deleteStudent);

// 세션 관련 라우트
router.get('/sessions', attendanceController.getAttendanceSessions);
router.get('/sessions/check-duplicate', attendanceController.checkDuplicateSession);
router.get('/sessions/:id', attendanceController.getAttendanceSessionById);
router.post('/sessions', attendanceController.createAttendanceSession);
router.delete('/sessions/:id', attendanceController.deleteAttendanceSession);

// 출석 기록 관련 라우트
router.get('/sessions/:sessionId/records', attendanceController.getAttendanceRecords);
router.post('/records', attendanceController.createAttendanceRecord);
router.put('/records/:id', attendanceController.updateAttendanceRecord);
router.delete('/records/:id', attendanceController.deleteAttendanceRecord);

// 통계 관련 라우트
router.get('/sessions/:sessionId/stats', attendanceController.getAttendanceStatsBySession);
router.get('/types/:typeId/stats', attendanceController.getAttendanceStatsByType);

export default router; 