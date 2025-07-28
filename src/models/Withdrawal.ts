import pool from '../config/database';

export interface Withdrawal {
  id: number;
  withdrawal_date: string;
  student_name: string;
  withdrawal_reason: string;
  withdrawal_content: string;
  teacher?: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  created_by_name?: string;
}

export const getAllWithdrawals = async (): Promise<Withdrawal[]> => {
  const res = await pool.query(`
    SELECT w.*, u.name as created_by_name
    FROM withdrawals w
    LEFT JOIN users u ON w.created_by = u.id
    ORDER BY w.withdrawal_date DESC
  `);
  return res.rows;
};

export const getWithdrawalById = async (id: number): Promise<Withdrawal | null> => {
  const res = await pool.query(`
    SELECT w.*, u.name as created_by_name
    FROM withdrawals w
    LEFT JOIN users u ON w.created_by = u.id
    WHERE w.id = $1
  `, [id]);
  return res.rows[0] || null;
};

export const createWithdrawal = async (withdrawal: Omit<Withdrawal, 'id'>): Promise<Withdrawal> => {
  const {
    withdrawal_date, student_name, withdrawal_reason, withdrawal_content, teacher, created_by
  } = withdrawal;
  
  const res = await pool.query(
    `INSERT INTO withdrawals (withdrawal_date, student_name, withdrawal_reason, withdrawal_content, teacher, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [withdrawal_date, student_name, withdrawal_reason, withdrawal_content, teacher, created_by]
  );
  return res.rows[0];
};

export const updateWithdrawal = async (id: number, withdrawal: Partial<Withdrawal>): Promise<Withdrawal | null> => {
  // 허용된 필드만 필터링
  const allowedFields = ['withdrawal_date', 'student_name', 'withdrawal_reason', 'withdrawal_content', 'teacher'];
  const fields = Object.keys(withdrawal).filter(f => allowedFields.includes(f));
  const values = fields.map(f => (withdrawal as any)[f]);
  if (fields.length === 0) return getWithdrawalById(id);
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const res = await pool.query(
    `UPDATE withdrawals SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return res.rows[0] || null;
};

export const deleteWithdrawal = async (id: number): Promise<boolean> => {
  const res = await pool.query('DELETE FROM withdrawals WHERE id = $1', [id]);
  return !!res.rowCount && res.rowCount > 0;
};

export const updateWithdrawalStatus = async (id: number, status: string): Promise<Withdrawal | null> => {
  const res = await pool.query(
    'UPDATE withdrawals SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id, status]
  );
  return res.rows[0] || null;
};

export const getWithdrawalsByStatus = async (status: string): Promise<Withdrawal[]> => {
  const res = await pool.query(`
    SELECT w.*, u.name as created_by_name
    FROM withdrawals w
    LEFT JOIN users u ON w.created_by = u.id
    WHERE w.status = $1
    ORDER BY w.withdrawal_date DESC
  `, [status]);
  return res.rows;
}; 