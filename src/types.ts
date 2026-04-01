export type Priority = 0 | 1 | 2;

export type Task = {
    name: string,
    description: string,
    date: string,
    priority: Priority,
    project: string,
    id: string
};
