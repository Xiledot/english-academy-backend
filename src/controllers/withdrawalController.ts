import { Request, Response } from 'express';
import * as WithdrawalModel from '../models/Withdrawal';

export const getAllWithdrawals = async (req: Request, res: Response) => {
  try {
    const withdrawals = await WithdrawalModel.getAllWithdrawals();
    res.json(withdrawals);
  } catch (error) {
    console.error('퇴원 목록 조회 오류:', error);
    res.status(500).json({ error: '퇴원 목록을 불러오는데 실패했습니다.' });
  }
};

export const getWithdrawalById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const withdrawal = await WithdrawalModel.getWithdrawalById(id);
    
    if (!withdrawal) {
      return res.status(404).json({ error: '퇴원 기록을 찾을 수 없습니다.' });
    }
    
    res.json(withdrawal);
  } catch (error) {
    console.error('퇴원 조회 오류:', error);
    res.status(500).json({ error: '퇴원 기록을 불러오는데 실패했습니다.' });
  }
};

export const createWithdrawal = async (req: Request, res: Response) => {
  try {
    const {
      withdrawal_date, student_name, withdrawal_reason, withdrawal_content, teacher
    } = req.body;
    
    if (!withdrawal_date || !student_name || !withdrawal_reason) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    
    // 현재 로그인한 사용자 ID 가져오기 (실제로는 JWT 토큰에서 추출)
    const created_by = (req as any).user?.id || 1;
    
    const withdrawal = await WithdrawalModel.createWithdrawal({
      withdrawal_date,
      student_name,
      withdrawal_reason,
      withdrawal_content: withdrawal_content || '',
      teacher,
      created_by
    });
    
    res.status(201).json(withdrawal);
  } catch (error) {
    console.error('퇴원 생성 오류:', error);
    res.status(500).json({ error: '퇴원 기록을 생성하는데 실패했습니다.' });
  }
};

export const updateWithdrawal = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const withdrawal = await WithdrawalModel.updateWithdrawal(id, updateData);
    
    if (!withdrawal) {
      return res.status(404).json({ error: '퇴원 기록을 찾을 수 없습니다.' });
    }
    
    res.json(withdrawal);
  } catch (error) {
    console.error('퇴원 수정 오류:', error);
    res.status(500).json({ error: '퇴원 기록을 수정하는데 실패했습니다.' });
  }
};

export const deleteWithdrawal = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await WithdrawalModel.deleteWithdrawal(id);
    
    if (!success) {
      return res.status(404).json({ error: '퇴원 기록을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '퇴원 기록이 삭제되었습니다.' });
  } catch (error) {
    console.error('퇴원 삭제 오류:', error);
    res.status(500).json({ error: '퇴원 기록을 삭제하는데 실패했습니다.' });
  }
};

export const updateWithdrawalStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: '상태가 누락되었습니다.' });
    }
    
    const withdrawal = await WithdrawalModel.updateWithdrawalStatus(id, status);
    
    if (!withdrawal) {
      return res.status(404).json({ error: '퇴원 기록을 찾을 수 없습니다.' });
    }
    
    res.json(withdrawal);
  } catch (error) {
    console.error('퇴원 상태 수정 오류:', error);
    res.status(500).json({ error: '퇴원 상태를 수정하는데 실패했습니다.' });
  }
};

export const getWithdrawalsByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const withdrawals = await WithdrawalModel.getWithdrawalsByStatus(status);
    res.json(withdrawals);
  } catch (error) {
    console.error('상태별 퇴원 조회 오류:', error);
    res.status(500).json({ error: '퇴원 목록을 불러오는데 실패했습니다.' });
  }
}; 