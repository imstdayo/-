import { ClassroomCourse, ClassroomCourseWork, ClassroomAnnouncement } from '../types';

const CLASSROOM_BASE_URL = 'https://classroom.googleapis.com/v1';

// Helper to format due date into YYYY-MM-DD
export function formatClassroomDueDate(dueDate?: { year?: number; month?: number; day?: number }): string | undefined {
  if (!dueDate || !dueDate.year || !dueDate.month || !dueDate.day) return undefined;
  const y = dueDate.year;
  const m = dueDate.month.toString().padStart(2, '0');
  const d = dueDate.day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatClassroomDueTime(dueTime?: { hours?: number; minutes?: number }): string | undefined {
  if (!dueTime || dueTime.hours === undefined) return undefined;
  const h = dueTime.hours.toString().padStart(2, '0');
  const m = (dueTime.minutes || 0).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Fetch active courses for current user
export async function getCourses(accessToken: string): Promise<ClassroomCourse[]> {
  const url = `${CLASSROOM_BASE_URL}/courses?courseStates=ACTIVE`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Classroom コース取得エラー (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const courses: ClassroomCourse[] = (data.courses || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    section: c.section,
    descriptionHeading: c.descriptionHeading,
    room: c.room,
    alternateLink: c.alternateLink,
    courseState: c.courseState,
    teacherGroupEmail: c.teacherGroupEmail,
    courseColor: getCourseColor(c.name)
  }));

  return courses;
}

// Fetch coursework (assignments, questions, etc.) for a course
export async function getCourseWork(
  accessToken: string, 
  courseId: string, 
  courseName?: string
): Promise<ClassroomCourseWork[]> {
  const url = `${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`課題取得エラー (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawList = data.courseWork || [];

  // Concurrently fetch student submission status for each coursework
  const works: ClassroomCourseWork[] = await Promise.all(
    rawList.map(async (cw: any) => {
      let submissionState: string | undefined;
      let submissionId: string | undefined;
      let assignedGrade: number | undefined;

      try {
        const subRes = await fetch(`${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork/${cw.id}/studentSubmissions`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          const firstSub = (subData.studentSubmissions || [])[0];
          if (firstSub) {
            submissionState = firstSub.state;
            submissionId = firstSub.id;
            assignedGrade = firstSub.assignedGrade;
          }
        }
      } catch {
        // Fallback silently if submissions cannot be fetched
      }

      return {
        id: cw.id,
        courseId,
        courseName,
        title: cw.title,
        description: cw.description,
        state: cw.state,
        alternateLink: cw.alternateLink,
        dueDate: cw.dueDate,
        dueTime: cw.dueTime,
        formattedDueDate: formatClassroomDueDate(cw.dueDate),
        maxPoints: cw.maxPoints,
        workType: cw.workType,
        materials: cw.materials,
        submissionState,
        submissionId,
        assignedGrade
      };
    })
  );

  return works;
}

// Fetch announcements for a course
export async function getCourseAnnouncements(
  accessToken: string,
  courseId: string,
  courseName?: string
): Promise<ClassroomAnnouncement[]> {
  try {
    const url = `${CLASSROOM_BASE_URL}/courses/${courseId}/announcements`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) return [];
    const data = await response.json();
    return (data.announcements || []).map((a: any) => ({
      id: a.id,
      courseId,
      courseName,
      text: a.text,
      updateTime: a.updateTime,
      alternateLink: a.alternateLink,
      materials: a.materials
    }));
  } catch {
    return [];
  }
}

// Turn in assignment (Student Submission) with mandatory confirmation requirement
export async function turnInCourseWork(
  accessToken: string,
  courseId: string,
  courseWorkId: string,
  submissionId: string,
  assignmentTitle: string
): Promise<boolean> {
  // CRITICAL MANDATORY REQUIREMENT: Confirmation dialog before mutating/submitting
  const confirmed = window.confirm(
    `Google Classroomへ課題「${assignmentTitle}」を提出（Turn in）しますか？\n提出すると担当教員に通知され、提出ステータスが更新されます。`
  );
  if (!confirmed) return false;

  const url = `${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId}:turnIn`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`提出処理に失敗しました: ${errorText}`);
  }

  return true;
}

// Assign aesthetically pleasing badge colors to course subjects
function getCourseColor(courseName: string): string {
  const name = courseName.toLowerCase();
  if (name.includes('数学') || name.includes('math')) return 'emerald';
  if (name.includes('英語') || name.includes('english')) return 'blue';
  if (name.includes('理科') || name.includes('物理') || name.includes('化学') || name.includes('science')) return 'purple';
  if (name.includes('国語') || name.includes('古典') || name.includes('japanese')) return 'rose';
  if (name.includes('社会') || name.includes('歴史') || name.includes('地理') || name.includes('公民')) return 'amber';
  if (name.includes('情報') || name.includes('プログラミング') || name.includes('it')) return 'cyan';
  return 'indigo';
}
