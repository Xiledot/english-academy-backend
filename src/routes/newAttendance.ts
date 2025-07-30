import { Router } from 'express';
import { NewAttendanceController } from '../controllers/newAttendanceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 카테고리 관련 라우트
router.get('/categories', NewAttendanceController.getCategories);

// 그룹 관련 라우트
router.get('/categories/:categoryId/groups', NewAttendanceController.getGroupsByCategory);
router.post('/groups', NewAttendanceController.createGroup);

// 세션 관련 라우트
router.get('/groups/:groupId/sessions', NewAttendanceController.getSessionsByGroup);
router.post('/sessions', NewAttendanceController.createSession);
router.put('/sessions/:sessionId', NewAttendanceController.updateSession);
router.delete('/sessions/:sessionId', NewAttendanceController.deleteSession);

// 학생 관련 라우트
router.get('/sessions/:sessionId/students', NewAttendanceController.getStudentsBySession);
router.post('/students', NewAttendanceController.createStudent);
router.put('/students/:studentId', NewAttendanceController.updateStudent);
router.delete('/students/:studentId', NewAttendanceController.deleteStudent);

// 출석 기록 관련 라우트
router.get('/sessions/:sessionId/records', NewAttendanceController.getAttendanceRecords);
router.put('/students/:studentId/sessions/:sessionId/attendance', NewAttendanceController.updateAttendanceRecord);

// 통계 관련 라우트
router.get('/sessions/:sessionId/stats', NewAttendanceController.getAttendanceStats);

// 검색 관련 라우트
router.get('/search', NewAttendanceController.searchSessions);

export default router; 