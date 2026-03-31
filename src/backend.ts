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
    private nextID: number;
    constructor(title: string, tasks: Task[]) {
        this.title = title;
        this.tasks = tasks;
        this.nextID = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 0;
    }

    public addTask(name: string, date: string, priority: Priority) {
        this.tasks.push({name, date, priority, id: this.nextID});
        this.nextID++;
    }

    public removeTask(id: number) {
        this.tasks = this.tasks.filter(task => task.id !== id);
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
        return this.nextID;
    }

    public updateTask(id: number, newTask: Task) {
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
            return new Project(data.title, data.tasks);
        } catch {
            return null;
        }
    }
}
