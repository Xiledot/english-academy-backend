import { Request, Response } from 'express';
import * as InquiryModel from '../models/Inquiry';

export const getAllInquiries = async (req: Request, res: Response) => {
  try {
    const inquiries = await InquiryModel.getAllInquiries();
    res.json(inquiries);
  } catch (error) {
    console.error('문의 목록 조회 오류:', error);
    res.status(500).json({ error: '문의 목록을 불러오는데 실패했습니다.' });
  }
};

export const getInquiryById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const inquiry = await InquiryModel.getInquiryById(id);
    
    if (!inquiry) {
      return res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
    }
    
    res.json(inquiry);
  } catch (error) {
    console.error('문의 조회 오류:', error);
    res.status(500).json({ error: '문의를 불러오는데 실패했습니다.' });
  }
};

export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { name, phone, inquiry_source, inquiry_content, status, scheduled_date, memo } = req.body;
    
    if (!name || !phone || !inquiry_source || !inquiry_content) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    
    const inquiry = await InquiryModel.createInquiry({
      name,
      phone,
      inquiry_source,
      inquiry_content,
      status: status || 'new',
      scheduled_date,
      memo
    });
    
    res.status(201).json(inquiry);
  } catch (error) {
    console.error('문의 생성 오류:', error);
    res.status(500).json({ error: '문의를 생성하는데 실패했습니다.' });
  }
};

export const updateInquiry = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    // created_at 필드는 업데이트에서 제외
    delete updateData.created_at;
    
    const inquiry = await InquiryModel.updateInquiry(id, updateData);
    
    if (!inquiry) {
      return res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
    }
    
    res.json(inquiry);
  } catch (error) {
    console.error('문의 수정 오류:', error);
    res.status(500).json({ error: '문의를 수정하는데 실패했습니다.' });
  }
};

export const deleteInquiry = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await InquiryModel.deleteInquiry(id);
    
    if (!success) {
      return res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '문의가 삭제되었습니다.' });
  } catch (error) {
    console.error('문의 삭제 오류:', error);
    res.status(500).json({ error: '문의를 삭제하는데 실패했습니다.' });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, scheduled_date } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: '상태가 누락되었습니다.' });
    }
    
    const inquiry = await InquiryModel.updateInquiryStatus(id, status, scheduled_date);
    
    if (!inquiry) {
      return res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
    }
    
    res.json(inquiry);
  } catch (error) {
    console.error('문의 상태 수정 오류:', error);
    res.status(500).json({ error: '문의 상태를 수정하는데 실패했습니다.' });
  }
};

export const getInquiriesByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const inquiries = await InquiryModel.getInquiriesByStatus(status);
    res.json(inquiries);
  } catch (error) {
    console.error('상태별 문의 조회 오류:', error);
    res.status(500).json({ error: '문의 목록을 불러오는데 실패했습니다.' });
  }
}; 