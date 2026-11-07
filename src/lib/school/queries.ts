import { queryOptions } from "@tanstack/react-query";
import { getSchoolDashboard } from "./school.functions";

export const schoolDashboardOptions = queryOptions({
  queryKey: ["school-dashboard"],
  queryFn: () => getSchoolDashboard(),
  staleTime: 0,
});