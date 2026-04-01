import { Priority, Task } from "./types";

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

export class Project {
    private title: string;
    private tasks: Task[];
    private projectID: number;
    private nextTaskID: number;
    constructor(title: string, tasks: Task[], projectID: number) {
        this.title = title;
        this.tasks = tasks;
        this.projectID = projectID;
        this.nextTaskID = tasks.length > 0 ? Math.max(...tasks.map(task => parseInt(task.id.split('-')[1]))) + 1 : 0;
    }

    public addTask(name: string, description: string, date: string, priority: Priority) {
        this.tasks.push({name, date, priority, description, id: this.projectID + "-" + this.nextTaskID});
        this.nextTaskID++;
    }

    public removeTask(id: number) {
        this.tasks = this.tasks.filter(task => task.id !== this.projectID + "-" + id);
    }

    public getTasks() {
        return [...this.tasks];
    }

    public getTitle() {
        return this.title;
    }
    public setTitle(t: string) {
        this.title = t;
    }
    public getNextID() {
        return this.projectID + "-" + this.nextTaskID;
    }

    public updateTask(id: string, newTask: Task) {
        for (let i = 0; i < this.tasks.length; i++) {
            const task = this.tasks[i];
            if (task.id === id) {
                this.tasks[i] = newTask;
                return;
            }
        }
    }
    public static parse(raw: string) {
        try {
            const data = JSON.parse(raw);
            return new Project(data.title, data.tasks, data.projectID);
        } catch {
            return null;
        }
    }
    public toJSON() {
        return {
            title: this.title,
            tasks: this.tasks,
            projectID: this.projectID,
            nextTaskID: this.nextTaskID,
        };
    }
}
