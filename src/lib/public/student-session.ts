const KEY = "invok.student";

export type StudentSession = {
  code: string;
  pin: string;
  student: {
    id: string;
    code: string;
    first_name: string | null;
    last_name: string | null;
    grade: number | null;
    school_id: string;
    class_id: string | null;
  };
};

export function getStudentSession(): StudentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StudentSession) : null;
  } catch {
    return null;
  }
}

export function setStudentSession(s: StudentSession) {
  sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function clearStudentSession() {
  sessionStorage.removeItem(KEY);
}
