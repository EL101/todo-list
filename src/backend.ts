import { Priority, Task } from "./types";
import {compareAsc} from "date-fns";
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
    private sortOrder: string;
    private cmp: (a: Task, b: Task) => number;
    constructor(title: string, tasks: Task[], projectID: number) {
        this.title = title;
        this.tasks = tasks;
        this.projectID = projectID;
        this.sortOrder = "";
        this.cmp = this.getCmp();
        tasks.sort(this.cmp);
        this.nextTaskID = tasks.length > 0 ? Math.max(...tasks.map(task => parseInt(task.id.split('-')[1]))) + 1 : 0;
    }

    private getCmp() {
        switch (this.sortOrder) {
            case "Date":
                return((a: Task, b: Task) => compareAsc(new Date(a.date), new Date(b.date)));
            case "Priority":
                return ((a: Task, b: Task) => b.priority - a.priority);
            default:
                return ((a: Task, b: Task) => parseInt(a.id.split("-")[1]) - parseInt(b.id.split("-")[1]));
        }
    }

    public setSortOrder(order: string) {
        this.sortOrder = order;
        this.cmp = this.getCmp();
        this.tasks.sort(this.cmp);
    }

    public getSortOrder() {
        return this.sortOrder;
    }

    public addTask(name: string, description: string, date: string, priority: Priority, project=this.title) {
        this.tasks.push({name, date, priority, description, project, id: this.projectID + "-" + this.nextTaskID});
        console.log(this.tasks);
        this.tasks.sort(this.cmp);
        console.log(this.tasks);
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
    public getProjectID() {
        return this.projectID;
    }
    public updateTask(id: string, newTask: Task) {
        for (let i = 0; i < this.tasks.length; i++) {
            const task = this.tasks[i];
            if (task.id === id) {
                this.tasks[i] = newTask;
                this.tasks.sort(this.cmp);
                return;
            }
        }
    }
    public static parse(raw: string) {
        try {
            const data = JSON.parse(raw);
            const proj = new Project(data.title, data.tasks, data.projectID);
            proj.setSortOrder(data.sortOrder ?? "");
            return proj;
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
            sortOrder: this.sortOrder
        };
    }
}
