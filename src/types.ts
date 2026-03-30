export type Priority = 0 | 1 | 2;

export type Task = {
    name: string,
    date: string,
    priority: Priority,
};

export type Project = {
    title: string,
    tasks: Task[]
};