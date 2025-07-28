import { Router } from 'express';
import { ScheduleController } from '../controllers/scheduleController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 시간표 목록 조회 (모든 역할 접근 가능)
router.get('/', ScheduleController.getAllSchedules);

// 시간대 목록 조회
router.get('/time-slots', ScheduleController.getTimeSlots);

// 시간표 통계 조회 (원장, 부원장만)
router.get('/stats', requireRole(['director', 'vice_director']), ScheduleController.getScheduleStats);

// 시간표 상세 조회
router.get('/:id', ScheduleController.getSchedule);

// 시간표 생성 (원장, 부원장, 강사만)
router.post('/', requireRole(['director', 'vice_director', 'teacher']), ScheduleController.createSchedule);

// 시간표 수정 (원장, 부원장, 강사만)
router.put('/:id', requireRole(['director', 'vice_director', 'teacher']), ScheduleController.updateSchedule);

// 시간대 수정 (원장, 부원장, 강사만)
router.put('/time-slots/:id', requireRole(['director', 'vice_director', 'teacher']), ScheduleController.updateTimeSlot);

// 시간대 삭제 (원장, 부원장만)
router.delete('/:id', requireRole(['director', 'vice_director']), ScheduleController.deleteSchedule);

export default router; 