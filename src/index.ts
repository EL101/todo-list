import "./styles.css"
import "./sidebar.css"
import "./main.css"

type project = {
    title: string,
    tasks: string[]
};

const sidebar = document.querySelector(".sidebar");
const sidebar_collapse_button = document.querySelector(".sidebar-collapse-button");
sidebar_collapse_button?.addEventListener("click", e => {
    sidebar?.classList.toggle("collapsed");
});

const projects_header = document.querySelector(".projects-header");
const projects_section = document.querySelector(".projects-section");
projects_header?.addEventListener("click", e => {
    projects_section?.classList.toggle("collapsed");
});

const add_projects_btn = document.querySelector(".add-projects");
add_projects_btn?.addEventListener("hover", e => e.stopPropagation());
add_projects_btn?.addEventListener("click", e => e.stopPropagation());

const project_container = document.querySelector(".main-project-container");

function setTaskCompleteBtnEventListeners(btn: HTMLInputElement) {
    btn.addEventListener('click', () => {
        btn.closest('.project-task')?.classList.toggle('done');
    });
}

function setTaskLabelEventListeners(label: HTMLElement) {
    label.addEventListener("click", () => {
        if (label.previousElementSibling != null) {
            const btn = label.previousElementSibling as HTMLButtonElement;
            btn.click();
        }
    });
    label.addEventListener("mouseenter", () => {
        if (label.previousElementSibling != null) {
            const btn = label.previousElementSibling as HTMLButtonElement;
            btn.classList.add("hovered");
            label.classList.add("hovered");
        }
    });
    label.addEventListener("mouseleave", () => {
        if (label.previousElementSibling != null) {
            const btn = label.previousElementSibling as HTMLButtonElement;
            btn.classList.remove("hovered");
            label.classList.remove("hovered");
        }
    });
}
document.querySelectorAll<HTMLInputElement>('.task-complete-btn').forEach(btn => {
    setTaskCompleteBtnEventListeners(btn);
});

document.querySelectorAll<HTMLElement>('.task-label').forEach(label => {
    setTaskLabelEventListeners(label);
});

function addProject(projectInfo: project, id:string) {
    const heading = document.createElement("h2");
    heading.classList.add("project-header-main");
    heading.textContent = projectInfo.title;

    const list = document.createElement("ul");
    list.classList.add("project-task-list");

    for (let i = 0; i < projectInfo.tasks.length; i++) {
        const task = projectInfo.tasks[i];
        const taskElem = document.createElement("li");
        taskElem.classList.add("project-task");
        taskElem.dataset.index = "" + i;
        const btn = document.createElement("button");
        btn.classList.add("task-complete-btn");
        setTaskCompleteBtnEventListeners(btn as HTMLInputElement);

        const label = document.createElement("span");
        label.classList.add("task-label");
        label.textContent = task;
        setTaskLabelEventListeners(label as HTMLElement);

        taskElem.append(btn, label);
        list.append(taskElem);
    }
    heading.dataset.id=id;
    list.dataset.id=id;
    project_container?.append(heading, list);
}

document.querySelectorAll<HTMLInputElement>(".project-task-header input").forEach(child => {
        child.addEventListener("click", e => {
            if (!child.checked) {
                if (project_container?.children) {
                    const childID = child.parentElement?.dataset.id;
                    const children = Array.from(project_container?.children);
                    const filtered = children.filter(elem => elem instanceof HTMLElement && elem.dataset.id === childID);
                    for (let c of filtered) {
                        project_container.removeChild(c);
                    }
                }
            } else {
                const container = child.parentElement as HTMLElement;
                const stringProjectInfo = container.dataset.projectInfo;
                const id = container.dataset.id;
                if (stringProjectInfo) addProject(JSON.parse(stringProjectInfo) as project, id as string);
            }
        });
    }
);