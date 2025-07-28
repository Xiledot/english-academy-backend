import express from 'express';
import * as todoController from '../controllers/todoController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// === 투두리스트 관련 라우트 ===

// 날짜별 투두 목록 조회
router.get('/date/:date', todoController.getTodosByDate);

// 모든 투두 조회
router.get('/', todoController.getAllTodos);

// 새 투두 생성
router.post('/', todoController.createTodo);

// 투두 수정
router.put('/:id', todoController.updateTodo);

// 투두 삭제
router.delete('/:id', todoController.deleteTodo);

// 투두 상태 토글
router.patch('/:id/toggle', todoController.toggleTodoStatus);

// 다른 사용자에게 투두 전송 (원장 기능)
router.post('/send', todoController.sendTodoToUser);

// === 조례사항 관련 라우트 ===

// 날짜별 조례사항 조회
router.get('/announcements/date/:date', todoController.getAnnouncementsByDate);

// 새 조례사항 생성
router.post('/announcements', todoController.createAnnouncement);

// 조례사항 수정
router.put('/announcements/:id', todoController.updateAnnouncement);

// 조례사항 삭제
router.delete('/announcements/:id', todoController.deleteAnnouncement);

// === 개인 메모 관련 라우트 ===

// 날짜별 개인 메모 조회
router.get('/memo/date/:date', todoController.getMemoByDate);

// 메모 수정 또는 생성 (Upsert)
router.put('/memo/date/:date', todoController.upsertMemo);

// === 사용자 관련 라우트 ===

// 모든 사용자 조회 (투두 전송용)
router.get('/users', todoController.getAllUsers);

export default router; 