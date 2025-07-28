import express from 'express';
import * as calendarController from '../controllers/calendarController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 다가오는 일정 조회 (대시보드용)
router.get('/upcoming', calendarController.getUpcomingEvents);

// 월별 일정 조회
router.get('/month/:year/:month', calendarController.getEventsByMonth);

// 날짜 범위별 일정 조회
router.get('/range', calendarController.getEventsByDateRange);

// 일정 검색
router.get('/search', calendarController.searchEvents);

// 특정 일정 조회
router.get('/events/:id', calendarController.getEventById);

// 새 일정 생성
router.post('/events', calendarController.createEvent);

// 일정 수정
router.put('/events/:id', calendarController.updateEvent);

// 일정 삭제
router.delete('/events/:id', calendarController.deleteEvent);

export default router; 