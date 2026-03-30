import { Project } from "./types";

export function priorityToStr(priority: 0 | 1 | 2): string {
    if (priority === 0) return "Low";
    else if (priority === 1) return "Medium";
    else return "High";
}

export function parseProjectInfo(raw: string): Project | null {
    try {
        return JSON.parse(raw) as Project;
    } catch {
        return null;
    }
}