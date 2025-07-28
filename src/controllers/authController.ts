import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, CreateUserData } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthController {
  // 회원가입
  static async register(req: Request, res: Response) {
    try {
      const { name, role } = req.body;

      // 입력 검증
      if (!name || !role) {
        return res.status(400).json({ 
          error: '이름과 역할을 모두 입력해주세요.' 
        });
      }

      // 이미 존재하는 사용자인지 확인
      const existingUser = await UserModel.findByName(name);
      if (existingUser) {
        return res.status(400).json({ 
          error: '이미 존재하는 이름입니다.' 
        });
      }

      // 사용자 생성 (원장이 아닌 경우 비밀번호 없음)
      const userData: CreateUserData = {
        name,
        role,
        password_hash: undefined // 원장이 아닌 경우 비밀번호 없음
      };

      const user = await UserModel.create(userData);

      res.status(201).json({
        message: '회원가입이 완료되었습니다.',
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });

    } catch (error) {
      console.error('회원가입 오류:', error);
      res.status(500).json({ 
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }

  // 로그인
  static async login(req: Request, res: Response) {
    try {
      const { name, password } = req.body;

      // 입력 검증
      if (!name) {
        return res.status(400).json({ 
          error: '이름을 입력해주세요.' 
        });
      }

      // 사용자 찾기
      const user = await UserModel.findByName(name);
      if (!user) {
        return res.status(401).json({ 
          error: '존재하지 않는 사용자입니다.' 
        });
      }

      // 원장인 경우 비밀번호 확인
      if (user.role === 'director') {
        if (!password) {
          return res.status(400).json({ 
            error: '비밀번호를 입력해주세요.' 
          });
        }

        // 비밀번호 확인 (원장 비밀번호: 1234)
        const isValidPassword = password === '1234';
        if (!isValidPassword) {
          return res.status(401).json({ 
            error: '비밀번호가 올바르지 않습니다.' 
          });
        }
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { 
          id: user.id, 
          name: user.name, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: '로그인 성공',
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        token
      });

    } catch (error) {
      console.error('로그인 오류:', error);
      res.status(500).json({ 
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }

  // 사용자 정보 조회
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          error: '인증이 필요합니다.' 
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          error: '사용자를 찾을 수 없습니다.' 
        });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });

    } catch (error) {
      console.error('프로필 조회 오류:', error);
      res.status(500).json({ 
        error: '서버 오류가 발생했습니다.' 
      });
    }
  }
} 