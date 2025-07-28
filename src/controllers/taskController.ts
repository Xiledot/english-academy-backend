import { Request, Response } from 'express';
import * as TaskModel from '../models/Task';

// 모든 업무 조회
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await TaskModel.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('모든 업무 조회 오류:', error);
    res.status(500).json({ message: '업무 조회 중 오류가 발생했습니다.' });
  }
};

// 특정 업무 조회
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await TaskModel.getTaskById(parseInt(id));
    
    if (!task) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('업무 조회 오류:', error);
    res.status(500).json({ message: '업무 조회 중 오류가 발생했습니다.' });
  }
};

// 날짜별 업무 조회
export const getTasksByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const tasks = await TaskModel.getTasksByDate(date);
    res.json(tasks);
  } catch (error) {
    console.error('날짜별 업무 조회 오류:', error);
    res.status(500).json({ message: '업무 조회 중 오류가 발생했습니다.' });
  }
};

// 담당자별 업무 조회
export const getTasksByAssignee = async (req: Request, res: Response) => {
  try {
    const { assigneeId } = req.params;
    const tasks = await TaskModel.getTasksByAssignee(parseInt(assigneeId));
    res.json(tasks);
  } catch (error) {
    console.error('담당자별 업무 조회 오류:', error);
    res.status(500).json({ message: '업무 조회 중 오류가 발생했습니다.' });
  }
};

// 상태별 업무 조회
export const getTasksByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const tasks = await TaskModel.getTasksByStatus(status);
    res.json(tasks);
  } catch (error) {
    console.error('상태별 업무 조회 오류:', error);
    res.status(500).json({ message: '업무 조회 중 오류가 발생했습니다.' });
  }
};

// 새 업무 생성
export const createTask = async (req: Request, res: Response) => {
  try {
    const taskData = req.body;
    
    // 필수 필드 검증
    if (!taskData.title || !taskData.target_date) {
      return res.status(400).json({ 
        message: '업무명과 목표 날짜는 필수입니다.' 
      });
    }

    // 사용자 ID를 created_by로 설정
    taskData.created_by = (req as any).user.id;

    // 특정조교 타입일 때 assigned_name 설정
    if (taskData.assigned_type === '특정조교' && taskData.assigned_to) {
      // 여기서 실제로는 users 테이블에서 이름을 가져와야 하지만, 
      // 간단히 하기 위해 프론트엔드에서 전달받는 것으로 처리
    }

    const newTask = await TaskModel.createTask(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('업무 생성 오류:', error);
    res.status(500).json({ message: '업무 생성 중 오류가 발생했습니다.' });
  }
};

// 업무 수정
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taskData = req.body;
    
    const updatedTask = await TaskModel.updateTask(parseInt(id), taskData);
    
    if (!updatedTask) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('업무 수정 오류:', error);
    res.status(500).json({ message: '업무 수정 중 오류가 발생했습니다.' });
  }
};

// 업무 삭제
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await TaskModel.deleteTask(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '업무가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('업무 삭제 오류:', error);
    res.status(500).json({ message: '업무 삭제 중 오류가 발생했습니다.' });
  }
};

// 업무 상태 업데이트
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: '상태는 필수입니다.' });
    }

    const updatedTask = await TaskModel.updateTask(parseInt(id), { status });
    
    if (!updatedTask) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('업무 상태 업데이트 오류:', error);
    res.status(500).json({ message: '업무 상태 업데이트 중 오류가 발생했습니다.' });
  }
};

// 반복 업무 생성
export const createRecurringTasks = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      assigned_type,
      assigned_name,
      recurring_type,
      recurring_days,
      start_date,
      end_date
    } = req.body;

    // 필수 필드 검증
    if (!title || !start_date) {
      return res.status(400).json({ 
        message: '업무명과 시작 날짜는 필수입니다.' 
      });
    }

    const createdTasks = [];
    const startDate = new Date(start_date);
    const endDate = end_date ? new Date(end_date) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1년 후까지

    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      let shouldCreateTask = false;

      switch (recurring_type) {
        case '매일':
          shouldCreateTask = true;
          break;
        case '매주':
          shouldCreateTask = currentDate.getDay() === startDate.getDay();
          break;
        case '매월':
          shouldCreateTask = currentDate.getDate() === startDate.getDate();
          break;
        case '요일별':
          if (recurring_days && recurring_days.length > 0) {
            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
            const currentDayName = dayNames[currentDate.getDay()];
            shouldCreateTask = recurring_days.includes(currentDayName);
          }
          break;
      }

      if (shouldCreateTask) {
        const taskData = {
          title,
          description,
          category,
          priority,
          status: '미완료' as const,
          assigned_type,
          assigned_name,
          is_recurring: true,
          recurring_type,
          recurring_days,
          target_date: currentDate.toISOString().split('T')[0],
          created_by: (req as any).user.id
        };

        try {
          const newTask = await TaskModel.createTask(taskData);
          createdTasks.push(newTask);
        } catch (error) {
          console.error(`업무 생성 실패 (${currentDate.toISOString().split('T')[0]}):`, error);
        }
      }

      // 다음 날로 이동
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(201).json({
      message: `${createdTasks.length}개의 반복 업무가 생성되었습니다.`,
      tasks: createdTasks.slice(0, 10) // 처음 10개만 반환
    });
  } catch (error) {
    console.error('반복 업무 생성 오류:', error);
    res.status(500).json({ message: '반복 업무 생성 중 오류가 발생했습니다.' });
  }
};

// 고정 업무 생성 (모든 날짜에 생성)
export const createFixedTasks = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      assigned_type,
      assigned_name
    } = req.body;

    // 필수 필드 검증
    if (!title) {
      return res.status(400).json({ 
        message: '업무명은 필수입니다.' 
      });
    }

    const createdTasks = [];
    const startDate = new Date(); // 오늘부터
    const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1년 후까지

    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const taskData = {
        title,
        description,
        category: category || '고정업무',
        priority,
        status: '미완료' as const,
        assigned_type,
        assigned_name,
        is_recurring: true,
        recurring_type: '매일' as const,
        target_date: currentDate.toISOString().split('T')[0],
        created_by: (req as any).user.id
      };

      try {
        const newTask = await TaskModel.createTask(taskData);
        createdTasks.push(newTask);
      } catch (error) {
        console.error(`고정 업무 생성 실패 (${currentDate.toISOString().split('T')[0]}):`, error);
      }

      // 다음 날로 이동
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(201).json({
      message: `${createdTasks.length}개의 고정 업무가 생성되었습니다.`,
      tasks: createdTasks.slice(0, 10) // 처음 10개만 반환
    });
  } catch (error) {
    console.error('고정 업무 생성 오류:', error);
    res.status(500).json({ message: '고정 업무 생성 중 오류가 발생했습니다.' });
  }
}; 