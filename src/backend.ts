import { Project, Task } from "./types";

export function priorityToStr(priority: 0 | 1 | 2): string {
    if (priority === 0) return "Low";
    else if (priority === 1) return "Medium";
    else return "High";
}

export function strToPriority(str: string) {
    if (str === "Low") return 0;
    else if (str === "Medium") return 1;
    else return 2;
}
export function parseProjectInfo(raw: string): Project | null {
    try {
        return JSON.parse(raw) as Project;
    } catch {
        return null;
    }
}

export function addTaskToProject(project: Project, task: Task) {
    project.tasks.push(task);
    return project;
}

export function removeTaskFromProject(project: Project, index: number) {
    project.tasks.splice(index, 1);
    return project;
}
