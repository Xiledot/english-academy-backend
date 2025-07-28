import express from 'express';
import * as withdrawalController from '../controllers/withdrawalController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 퇴원 목록 조회
router.get('/', withdrawalController.getAllWithdrawals);

// 특정 퇴원 조회
router.get('/:id', withdrawalController.getWithdrawalById);

// 새 퇴원 생성
router.post('/', withdrawalController.createWithdrawal);

// 퇴원 수정
router.put('/:id', withdrawalController.updateWithdrawal);

// 퇴원 삭제
router.delete('/:id', withdrawalController.deleteWithdrawal);

// 퇴원 상태 업데이트
router.patch('/:id/status', withdrawalController.updateWithdrawalStatus);

// 상태별 퇴원 조회
router.get('/status/:status', withdrawalController.getWithdrawalsByStatus);

export default router; 