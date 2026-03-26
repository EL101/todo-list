import "./styles.css"
import "./sidebar.css"
import "./main.css"

const editSVG = `
<svg width="10px" height="10px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.56078 20.2501L20.5608 8.25011L15.7501 3.43945L3.75012 15.4395V20.2501H8.56078ZM15.7501 5.56077L18.4395 8.25011L16.5001 10.1895L13.8108 7.50013L15.7501 5.56077ZM12.7501 8.56079L15.4395 11.2501L7.93946 18.7501H5.25012L5.25012 16.0608L12.7501 8.56079Z" fill="#080341"/>
</svg>
`

const parser = new DOMParser();

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

        const editBtn = parser.parseFromString(editSVG, "image/svg+xml").documentElement;
        editBtn.classList.add("edit-btn");

        taskElem.append(btn, label, editBtn);
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