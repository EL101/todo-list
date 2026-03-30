import { format } from "date-fns";
import { Priority, Project } from "./types";
import { priorityToStr, parseProjectInfo, strToPriority } from "./backend";

const editSVG = `
<svg width="10px" height="10px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.56078 20.2501L20.5608 8.25011L15.7501 3.43945L3.75012 15.4395V20.2501H8.56078ZM15.7501 5.56077L18.4395 8.25011L16.5001 10.1895L13.8108 7.50013L15.7501 5.56077ZM12.7501 8.56079L15.4395 11.2501L7.93946 18.7501H5.25012L5.25012 16.0608L12.7501 8.56079Z" fill="#080341"/>
</svg>
`;

const parser = new DOMParser();
const sidebar = document.querySelector(".sidebar");
const sidebar_collapse_button = document.querySelector(".sidebar-collapse-button");
const projects_header = document.querySelector(".projects-header");
const projects_section = document.querySelector(".projects-section");
const add_projects_btn = document.querySelector(".add-projects");
const mainProjectContainer = document.querySelector(".main-project-container");

// ── Sidebar ──────────────────────────────────────────────
sidebar_collapse_button?.addEventListener("click", () => {
    sidebar?.classList.toggle("collapsed");
});

projects_header?.addEventListener("click", () => {
    projects_section?.classList.toggle("collapsed");
});

add_projects_btn?.addEventListener("click", e => e.stopPropagation());

// ── Task buttons ─────────────────────────────────────────
export function setTaskCompleteBtnEventListeners(btn: HTMLButtonElement) {
    btn.addEventListener("click", () => {
        btn.closest(".project-task")?.classList.toggle("done");
    });
}

export function setTaskLabelEventListeners(label: HTMLElement) {
    label.addEventListener("click", () => {
        (label.previousElementSibling as HTMLButtonElement)?.click();
    });
    label.addEventListener("mouseenter", () => {
        const btn = label.previousElementSibling as HTMLButtonElement;
        btn?.classList.add("hovered");
        label.classList.add("hovered");
    });
    label.addEventListener("mouseleave", () => {
        const btn = label.previousElementSibling as HTMLButtonElement;
        btn?.classList.remove("hovered");
        label.classList.remove("hovered");
    });
}

export function setDatePickerEventListeners(datePicker: HTMLInputElement) {
    datePicker.addEventListener("change", () => {
        if (!datePicker.value) return;
    });
}

export function setAddTaskEventListeners(btn: HTMLButtonElement, container: HTMLElement, elemAfter: HTMLElement) {
    btn.addEventListener("click", () => {
        if (btn.dataset.canceled === "false") return;
        btn.dataset.canceled = "false";

        const inputForm = document.createElement("form");
        inputForm.classList.add("task-input-form");

        const nameField = document.createElement("input");
        nameField.type = "text";
        nameField.required = true;
        nameField.placeholder = "Task name";
        nameField.name = "taskName";
        nameField.classList.add("task-name-input", "task-input-field");

        const tagInputContainer = document.createElement("div");
        tagInputContainer.classList.add("tag-input-container");

        const datePicker = document.createElement("input");
        datePicker.classList.add("date-picker", "task-input-field");
        datePicker.type = "datetime-local";
        datePicker.required = true;
        datePicker.name = "date";
        setDatePickerEventListeners(datePicker);

        const priorityPicker = document.createElement("select");
        priorityPicker.required = true;
        priorityPicker.classList.add("priority-picker", "task-input-field");
        for (const op of ["", "Low", "Medium", "High"]) {
            const option = document.createElement("option");
            option.value = op;
            option.textContent = op === "" ? "Select priority" : op;
            if (op === "") { option.selected = true; option.disabled = true; }
            priorityPicker.append(option);
        }
        priorityPicker.name = "priority";
        tagInputContainer.append(datePicker, priorityPicker);

        const btnContainer = document.createElement("div");
        btnContainer.classList.add("task-input-btn-container");

        const submitTaskBtn = document.createElement("button");
        submitTaskBtn.textContent = "Add Task";
        submitTaskBtn.classList.add("submit-task-btn");
        setSubmitTaskEventListeners(submitTaskBtn, inputForm, container, btn);

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("cancel-task-btn");
        cancelButton.addEventListener("click", () => {
            container.removeChild(inputForm);
            btn.dataset.canceled = "true";
        });

        btnContainer.append(submitTaskBtn, cancelButton);
        inputForm.append(nameField, tagInputContainer, btnContainer);
        container.insertBefore(inputForm, elemAfter);
    });
}
export function createTask(name: string, date: string, priority: Priority, project: string, index: number) {
    const taskElem = document.createElement("li");
    taskElem.classList.add("project-task");
    taskElem.dataset.index = "" + index;

    const labelTagContainer = document.createElement("div");
    labelTagContainer.classList.add("label-tag-container");

    const btnLabelContainer = document.createElement("div");
    btnLabelContainer.classList.add("btn-label-container");

    const btn = document.createElement("button");
    btn.classList.add("task-complete-btn");
    setTaskCompleteBtnEventListeners(btn);

    const label = document.createElement("span");
    label.classList.add("task-label");
    label.textContent = name;
    setTaskLabelEventListeners(label);
    btnLabelContainer.append(btn, label);

    const tags = document.createElement("div");
    tags.classList.add("tags-container");

    const dateTag = document.createElement("div");
    dateTag.classList.add("date-tag");
    dateTag.textContent = format(new Date(date), "MMM d, yyyy h:mm a");

    const priorityTag = document.createElement("div");
    priorityTag.classList.add("priority-tag", priorityToStr(priority).toLowerCase());
    priorityTag.textContent = priorityToStr(priority);

    const projectTag = document.createElement("div");
    projectTag.classList.add("project-tag");
    projectTag.textContent = project;

    tags.append(dateTag, priorityTag, projectTag);
    labelTagContainer.append(btnLabelContainer, tags);

    const editBtn = parser.parseFromString(editSVG, "image/svg+xml").documentElement;
    editBtn.classList.add("edit-btn");

    taskElem.append(labelTagContainer, editBtn);
    return taskElem;
}
export function setSubmitTaskEventListeners(btn: HTMLButtonElement, form: HTMLFormElement, container: HTMLElement, addTaskBtn: HTMLButtonElement) {
    btn.addEventListener("click", e => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        addTaskBtn.dataset.canceled = "true";
        const projectList = container.querySelector(".project-task-list");

        const prevElem = projectList?.lastChild as HTMLElement;
        let nextIndex = 0;
        if (prevElem.dataset.index) nextIndex = parseInt(prevElem.dataset.index) + 1;
        let projectName = "New Project";
        if (container.dataset.name) projectName = container.dataset.name;
        const formData = new FormData(form);
        const taskName = formData.get("taskName") as string;
        const date = formData.get("date") as string;
        const priority = strToPriority(formData.get("priority") as string);
        console.log(priority);
        const taskElem = createTask(taskName, date, priority, projectName, nextIndex);
        form.remove();

        console.log(container);
        projectList?.append(taskElem);
    });
}
// ── Render project ───────────────────────────────────────
export function addProject(projectInfo: Project, id: string) {
    const projectContainer = document.createElement("div");
    projectContainer.classList.add("project-container");
    projectContainer.dataset.id = id;
    projectContainer.dataset.name = projectInfo.title;

    const heading = document.createElement("h2");
    heading.classList.add("project-header-main");
    heading.textContent = projectInfo.title;

    const list = document.createElement("ul");
    list.classList.add("project-task-list");

    for (let i = 0; i < projectInfo.tasks.length; i++) {
        const task = projectInfo.tasks[i];
        const taskElem = createTask(task.name, task.date, task.priority, projectInfo.title, i);
        list.append(taskElem);
    }

    const addTaskContainer = document.createElement("div");
    addTaskContainer.classList.add("add-task-container");

    const addTaskButton = document.createElement("button");
    addTaskButton.classList.add("add-task-button");
    addTaskButton.id = id;
    addTaskButton.textContent = "+";
    addTaskButton.dataset.canceled = "true";
    setAddTaskEventListeners(addTaskButton, projectContainer, addTaskContainer);

    const addTaskButtonLabel = document.createElement("label");
    addTaskButtonLabel.classList.add("add-task-label");
    addTaskButtonLabel.htmlFor = id;
    addTaskButtonLabel.textContent = "Add Task";
    addTaskButtonLabel.addEventListener("click", () => addTaskButton.click());

    addTaskContainer.append(addTaskButton, addTaskButtonLabel);
    projectContainer.append(heading, list, addTaskContainer);
    mainProjectContainer?.append(projectContainer);
}

// ── Sidebar project checkboxes ───────────────────────────
document.querySelectorAll<HTMLInputElement>(".project-task-header input").forEach(child => {
    child.addEventListener("click", () => {
        if (!child.checked) {
            const childID = child.parentElement?.dataset.id;
            Array.from(mainProjectContainer?.children ?? [])
                .filter(elem => elem instanceof HTMLElement && elem.dataset.id === childID)
                .forEach(elem => mainProjectContainer?.removeChild(elem));
        } else {
            const container = child.parentElement as HTMLElement;
            const raw = container.dataset.projectInfo;
            const id = container.dataset.id;
            const projectInfo = raw ? parseProjectInfo(raw) : null;
            if (projectInfo && id) addProject(projectInfo, id);
        }
    });
});
