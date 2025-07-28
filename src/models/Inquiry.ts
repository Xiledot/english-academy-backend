import pool from '../config/database';

export interface Inquiry {
  id: number;
  name: string;
  phone: string;
  inquiry_source: string;
  inquiry_content: string;
  status: string;
  scheduled_date?: string;
  memo?: string;
  created_at?: string;
  updated_at?: string;
}

export const getAllInquiries = async (): Promise<Inquiry[]> => {
  const res = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
  return res.rows;
};

export const getInquiryById = async (id: number): Promise<Inquiry | null> => {
  const res = await pool.query('SELECT * FROM inquiries WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const createInquiry = async (inquiry: Omit<Inquiry, 'id'>): Promise<Inquiry> => {
  const { name, phone, inquiry_source, inquiry_content, status, scheduled_date, memo } = inquiry;
  const res = await pool.query(
    `INSERT INTO inquiries (name, phone, inquiry_source, inquiry_content, status, scheduled_date, memo)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, phone, inquiry_source, inquiry_content, status, scheduled_date, memo]
  );
  return res.rows[0];
};

export const updateInquiry = async (id: number, inquiry: Partial<Inquiry>): Promise<Inquiry | null> => {
  // 허용된 필드만 필터링 (created_at 제외)
  const allowedFields = ['name', 'phone', 'inquiry_source', 'inquiry_content', 'status', 'scheduled_date', 'memo'];
  const fields = Object.keys(inquiry).filter(f => allowedFields.includes(f));
  const values = fields.map(f => (inquiry as any)[f]);
  if (fields.length === 0) return getInquiryById(id);
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const res = await pool.query(
    `UPDATE inquiries SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return res.rows[0] || null;
};

export const deleteInquiry = async (id: number): Promise<boolean> => {
  const res = await pool.query('DELETE FROM inquiries WHERE id = $1', [id]);
  return !!res.rowCount && res.rowCount > 0;
};

export const getInquiriesByStatus = async (status: string): Promise<Inquiry[]> => {
  const res = await pool.query('SELECT * FROM inquiries WHERE status = $1 ORDER BY created_at DESC', [status]);
  return res.rows;
};

export const updateInquiryStatus = async (id: number, status: string, scheduled_date?: string): Promise<Inquiry | null> => {
  const res = await pool.query(
    'UPDATE inquiries SET status = $2, scheduled_date = $3, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id, status, scheduled_date]
  );
  return res.rows[0] || null;
}; 