import { format, sub } from "date-fns";
import { Priority, Task } from "./types";
import { priorityToStr, strToPriority, Project} from "./backend";

const editSVG = `
<svg width="10px" height="10px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.56078 20.2501L20.5608 8.25011L15.7501 3.43945L3.75012 15.4395V20.2501H8.56078ZM15.7501 5.56077L18.4395 8.25011L16.5001 10.1895L13.8108 7.50013L15.7501 5.56077ZM12.7501 8.56079L15.4395 11.2501L7.93946 18.7501H5.25012L5.25012 16.0608L12.7501 8.56079Z" fill="#080341"/>
</svg>
`;

const deleteProjectSVG = `
<svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const parser = new DOMParser();
const sidebar = document.querySelector(".sidebar");
const sidebar_collapse_button = document.querySelector(".sidebar-collapse-button");
const projects_header = document.querySelector(".projects-header");
const projects_section = document.querySelector(".projects-section");
const add_projects_btn = document.querySelector(".add-projects");
const mainProjectContainer = document.querySelector(".main-project-container");

export function getSVGElement(svg: string) {
    return parser.parseFromString(svg, "image/svg+xml").documentElement;
}
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
    btn.addEventListener("mouseenter", () => {
        const task = btn.closest(".project-task");
        task?.classList.add("hovered");
    });
    btn.addEventListener("mouseleave", () => {
        const task = btn.closest(".project-task");
        task?.classList.remove("hovered");
    });
    btn.addEventListener("click", () => {
        const task = btn.closest(".project-task") as HTMLElement;
        const taskID = parseInt(task.dataset.id as string);
        const headerID = btn.closest<HTMLElement>(".project-container")?.dataset.id;
        const projectHeader = getProjectHeader(headerID as string);
        const proj = Project.parse(projectHeader.dataset.projectInfo as string);
        proj?.removeTask(taskID);
        console.log(taskID);
        projectHeader.dataset.projectInfo = JSON.stringify(proj);
        task?.remove();
    });
}

export function setTaskLabelEventListeners(label: HTMLElement) {
    label.addEventListener("click", () => {
        (label.previousElementSibling as HTMLButtonElement)?.click();
    });
    label.addEventListener("mouseenter", () => {
        const task = label.closest(".project-task");
        task?.classList.add("hovered");
    });
    label.addEventListener("mouseleave", () => {
        const task = label.closest(".project-task");
        task?.classList.remove("hovered");
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
        nameField.autocomplete = "off";
        // nameField.autocomplete = "new-password";
        nameField.classList.add("task-name-input", "main-input-field");

        const tagInputContainer = document.createElement("div");
        tagInputContainer.classList.add("tag-input-container");

        const datePicker = document.createElement("input");
        datePicker.classList.add("date-picker", "main-input-field");
        datePicker.type = "datetime-local";
        datePicker.required = true;
        datePicker.name = "date";
        setDatePickerEventListeners(datePicker);

        const priorityPicker = document.createElement("select");
        priorityPicker.required = true;
        priorityPicker.classList.add("priority-picker", "main-input-field");
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

export function createTask(name: string, date: string, priority: Priority, project: string, id: number) {
    const taskElem = document.createElement("li");
    taskElem.classList.add("project-task");
    taskElem.dataset.id = "" + id;

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

    const editBtn = getSVGElement(editSVG);
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

        let projectName = "New Project";
        if (container.dataset.name) projectName = container.dataset.name;
        const formData = new FormData(form);
        const taskName = formData.get("taskName") as string;
        const date = formData.get("date") as string;
        const priority = strToPriority(formData.get("priority") as string);

        const projectHeader = getProjectHeader(container.dataset.id as string);
        const proj = Project.parse(projectHeader.dataset.projectInfo as string);

        const taskElem = createTask(taskName, date, priority, projectName, proj?.getNextID() as number);
        proj?.addTask(taskName, date, priority);

        form.remove();

        projectList?.append(taskElem);
        
        projectHeader.dataset.projectInfo = JSON.stringify(proj);
    });
}

export function getProjectHeader(id: string) {
    const nodeList = document.querySelectorAll<HTMLElement>(".project-task-header");
    const headers = Array.from(nodeList);
    return headers.filter(header => header.dataset.id === id)[0];
}

export function setEditBtnHeadingEventListeners(btn: HTMLElement) {
    btn.addEventListener("click", () => {
        const projectContainer = btn.closest(".project-container") as HTMLElement;
        const projectHeaderMain = btn.closest(".project-header-main") as HTMLElement;
        const headerText = projectHeaderMain?.firstChild as HTMLElement;
        const originalName = headerText?.textContent;
        const inputField = document.createElement("input");
        inputField.classList.add("main-header-input-field");
        inputField.placeholder = "Project Name";
        inputField.defaultValue = headerText?.textContent ? headerText?.textContent : "";
        inputField.addEventListener("keypress", e => {
            if (e.key !== "Enter") return;
            submitNewHeaderBtn.click();
        });
        headerText?.remove();

        const submitNewHeaderBtn = document.createElement("button");
        submitNewHeaderBtn.classList.add("edit-header-submit-btn");
        submitNewHeaderBtn.textContent = "Enter";
        submitNewHeaderBtn.addEventListener("click", () => {
            const newName = inputField.value === "" ? originalName : inputField.value;
            headerText.textContent = newName;
            submitNewHeaderBtn.remove();
            inputField.remove();
            const ID = projectHeaderMain.closest<HTMLElement>(".project-container")!.dataset.id;
            const sidebarHeader = getProjectHeader(ID as string);
            const originalInfo = Project.parse(sidebarHeader.dataset.projectInfo as string);
            originalInfo?.setTitle(newName);
            sidebarHeader.dataset.projectInfo = JSON.stringify(originalInfo);
            sidebarHeader.querySelector("label")!.textContent = newName;
            projectContainer.querySelectorAll(".project-tag").forEach(tag => tag.textContent = newName);
            projectContainer.dataset.name = newName;
            projectHeaderMain?.append(headerText, btn);
        });
        projectHeaderMain?.prepend(inputField, submitNewHeaderBtn);
        inputField.focus();
        btn.remove();
    });
}

// ── Render project ───────────────────────────────────────
export function addProject(projectInfo: Project, id: string) {
    const projectContainer = document.createElement("div");
    projectContainer.classList.add("project-container");
    projectContainer.dataset.id = id;
    projectContainer.dataset.name = projectInfo.getTitle();

    const heading = document.createElement("h2");
    heading.classList.add("project-header-main");
    const headingSpan = document.createElement("span");
    headingSpan.classList.add("project-header-text");
    headingSpan.textContent = projectInfo.getTitle();
    const editHeading = getSVGElement(editSVG);
    editHeading.classList.add("edit-btn");
    setEditBtnHeadingEventListeners(editHeading);
    heading.append(headingSpan, editHeading);
    const list = document.createElement("ul");
    list.classList.add("project-task-list");

    for (let i = 0; i < projectInfo.getTasks().length; i++) {
        const task = projectInfo.getTasks()[i];
        const taskElem = createTask(task.name, task.date, task.priority, projectInfo.getTitle(), task.id);
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
document.querySelectorAll<HTMLInputElement>(".project-task-header input").forEach(btn => {
    setProjHeaderCheckboxEventListeners(btn);
});
document.querySelectorAll<HTMLElement>(".delete-project").forEach(elem => {
    setDeleteProjectEventListeners(elem);
});
function setDeleteProjectEventListeners(elem: HTMLElement) {
    elem.addEventListener("click", () => {
        const projHeader = elem.closest(".project-task-header");
        const checkbox = projHeader?.querySelector("input") as HTMLInputElement;
        if (checkbox.checked) checkbox.click();
        projHeader?.remove();
    });
}
function setProjHeaderSubmitBtnEventListeners(btn: HTMLButtonElement) {
    btn.addEventListener("click", e => {
        e.preventDefault();
        const projHeaderContainer = document.querySelector(".projects-container");
        const addProjectsBtn = document.querySelector(".add-projects") as HTMLElement;
        const form = document.querySelector<HTMLFormElement>(".project-header-input-form");
        if (!form?.reportValidity()) {
            form?.remove();
            addProjectsBtn.dataset.canceled = "true";
            return;
        }
        addProjectsBtn.dataset.canceled = "true";
        const formData = new FormData(form);
        const projName = formData.get("name");
        const projInfo = new Project(projName as string, []);
        form?.remove();
        const newProjHeader = document.createElement("div");
        newProjHeader.classList.add("project-task-header");
        newProjHeader.dataset.projectInfo = JSON.stringify(projInfo);
        const allHeaders = document.querySelectorAll<HTMLElement>(".project-task-header");
        const newID = allHeaders.length > 0 ? Math.max(...Array.from(allHeaders).map(header => parseInt(header.dataset.id as string))) + 1 : 0;
        newProjHeader.dataset.id = "" + newID;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "checkbox" + newID;
        checkbox.name = "checkbox" + newID;
        setProjHeaderCheckboxEventListeners(checkbox);
        // checkbox.addEventListener("click", () => {
        //     if (!checkbox.checked) {
        //         Array.from(mainProjectContainer?.children ?? [])
        //             .filter(elem => elem instanceof HTMLElement && elem.dataset.id === "" + newID)
        //             .forEach(elem => mainProjectContainer?.removeChild(elem));
        //     } else {
        //         const raw = newProjHeader.dataset.projectInfo;
        //         const id = newProjHeader.dataset.id;
        //         const projectInfo = raw ? Project.parse(raw) : null;
        //         if (projectInfo && id) addProject(projectInfo, id);
        //     }
        // });

        const label = document.createElement("label");
        label.htmlFor = "checkbox" + newID;
        label.textContent = projName as string;

        const trash = getSVGElement(deleteProjectSVG);
        trash.classList.add("delete-project");
        setDeleteProjectEventListeners(trash);
        // trash.addEventListener("click", () => {
        //     if (checkbox.checked) checkbox.click();
        //     newProjHeader?.remove();
        // });

        newProjHeader.append(checkbox, label, trash);
        
        projHeaderContainer?.prepend(newProjHeader);
    });
}
function setProjHeaderCheckboxEventListeners(btn: HTMLInputElement) {
    btn.addEventListener("click", () => {
        if (!btn.checked) {
            const childID = btn.parentElement?.dataset.id;
            Array.from(mainProjectContainer?.children ?? [])
                .filter(elem => elem instanceof HTMLElement && elem.dataset.id === childID)
                .forEach(elem => mainProjectContainer?.removeChild(elem));
        } else {
            const container = btn.parentElement as HTMLElement;
            const raw = container.dataset.projectInfo;
            const id = container.dataset.id;
            const projectInfo = raw ? Project.parse(raw) : null;
            if (projectInfo && id) addProject(projectInfo, id);
        }
    })
}
document.querySelector<HTMLButtonElement>(".add-projects")?.addEventListener("click", e => {
    const btn = document.querySelector<HTMLButtonElement>(".add-projects") as HTMLButtonElement;
    if (btn?.dataset.canceled === "false") return;
    btn.dataset.canceled = "false";
    const projHeaderContainer = document.querySelector(".projects-container");
    const projHeaderInput = document.createElement("form");
    projHeaderInput.classList.add("project-header-input-form");
    const textField = document.createElement("input");
    textField.classList.add("project-header-input-field");
    textField.type = "text";
    textField.placeholder = "Project Name";
    textField.name = "name";
    textField.required = true;
    const submitBtn = document.createElement("button");
    submitBtn.classList.add("project-header-submit-btn");
    submitBtn.textContent = "Add";
    setProjHeaderSubmitBtnEventListeners(submitBtn);

    projHeaderInput.append(textField, submitBtn);
    projHeaderContainer?.prepend(projHeaderInput);
});
