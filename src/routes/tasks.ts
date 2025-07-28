import express from 'express';
import * as taskController from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 업무 목록 조회
router.get('/', taskController.getAllTasks);

// 특정 업무 조회
router.get('/:id', taskController.getTaskById);

// 날짜별 업무 조회
router.get('/date/:date', taskController.getTasksByDate);

// 담당자별 업무 조회
router.get('/assignee/:assigneeId', taskController.getTasksByAssignee);

// 상태별 업무 조회
router.get('/status/:status', taskController.getTasksByStatus);

// 새 업무 생성
router.post('/', taskController.createTask);

// 업무 수정
router.put('/:id', taskController.updateTask);

// 업무 삭제
router.delete('/:id', taskController.deleteTask);

// 업무 상태 업데이트
router.patch('/:id/status', taskController.updateTaskStatus);

// 반복 업무 생성
router.post('/recurring', taskController.createRecurringTasks);

// 고정 업무 생성
router.post('/fixed', taskController.createFixedTasks);

export default router; 