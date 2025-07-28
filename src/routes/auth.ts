import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 회원가입
router.post('/register', AuthController.register);

// 로그인
router.post('/login', AuthController.login);

// 프로필 조회 (인증 필요)
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router; 