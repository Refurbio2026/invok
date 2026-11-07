import { queryOptions } from "@tanstack/react-query";
import { getTeacherDashboard } from "./teacher.functions";
export const teacherDashboardOptions = queryOptions({ queryKey: ["teacher-dashboard"], queryFn: () => getTeacherDashboard(), staleTime: 0 });