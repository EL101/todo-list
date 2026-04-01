import { format, isToday, compareAsc } from "date-fns";
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
const add_projects_btn = document.querySelector(".add-projects");
const mainProjectContainer = document.querySelector(".main-project-container");
const allSection = document.querySelector(".all-section") as HTMLElement;
const todaySection = document.querySelector(".today-section") as HTMLElement;

export function getSVGElement(svg: string) {
    return parser.parseFromString(svg, "image/svg+xml").documentElement;
}
// ── Sidebar ──────────────────────────────────────────────
sidebar_collapse_button?.addEventListener("click", () => {
    sidebar?.classList.toggle("collapsed");
});

document.querySelector(".projects-header")?.addEventListener("click", () => {
    allSection.dataset.clicked = "false";
    todaySection.dataset.clicked = "false";
    const projectsSection = document.querySelector(".projects-section");
    projectsSection?.classList.toggle("collapsed");
    if (!projectsSection?.classList.contains("collapsed")) {
        allSection.dataset.clicked = "false";
        todaySection.dataset.clicked = "false";

        document.querySelectorAll(".project-container[data-id='-1']").forEach(elem => elem.remove());
        document.querySelectorAll(".project-container[data-id='-2']").forEach(elem => elem.remove());

        if (document.querySelectorAll(".project-container").length === 0) {
            document.querySelectorAll<HTMLInputElement>("input[type='checkbox']").forEach(elem => {
                if (elem.checked) {
                    elem.dispatchEvent(new Event("click"));
                }
            });
        }
    }
    const addProjectsBtn = document.querySelector<HTMLElement>(".add-projects") as HTMLElement;
    addProjectsBtn.dataset.canceled = "true";
    document.querySelector(".project-header-input-form")?.remove();
    populateStorage();
});

add_projects_btn?.addEventListener("click", e => e.stopPropagation());

export function exitAllEditing() {
    document.querySelectorAll<HTMLButtonElement>(".cancel-task-btn").forEach(b => b.click());
    document.querySelectorAll<HTMLButtonElement>(".edit-header-submit-btn").forEach(b => {
        b.value = "";
        b.click();
    });
        
}
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
        const fullID = task.dataset.id as string;
        const taskID = parseInt((task.dataset.id as string).split("-")[1]);
        const headerID = fullID?.split('-')[0];
        const projectHeader = getProjectHeader(headerID as string);
        const proj = Project.parse(projectHeader.dataset.projectInfo as string);
        proj?.removeTask(taskID);
        projectHeader.dataset.projectInfo = JSON.stringify(proj);
        document.querySelectorAll(`.project-task[data-id='${fullID}']`).forEach(x => x.remove());
        populateStorage();
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

export function createTaskInputForm(container?: HTMLElement, btn?: HTMLButtonElement, name?: string, description?: string, date?: string, priority?: string) {
    const inputForm = document.createElement("form");
    inputForm.classList.add("task-input-form");

    const nameField = document.createElement("input");
    nameField.type = "text";
    nameField.required = true;
    nameField.placeholder = "Task name";
    nameField.name = "taskName";
    nameField.autocomplete = "off";
    nameField.defaultValue = name ? name : "";
    nameField.classList.add("task-name-input", "main-input-field");

    const descriptionField = document.createElement("textarea");
    descriptionField.classList.add("task-description-input", "main-input-field");
    descriptionField.placeholder = "Task Description";
    descriptionField.name = "description";
    // console.log(description);
    descriptionField.defaultValue = description ? description : "";
    descriptionField.addEventListener("input", () => {
        descriptionField.style.height = "auto";
        descriptionField.style.height = descriptionField.scrollHeight + "px";
    })
    const tagInputContainer = document.createElement("div");
    tagInputContainer.classList.add("tag-input-container");

    const datePicker = document.createElement("input");
    datePicker.classList.add("date-picker", "main-input-field");
    datePicker.type = "datetime-local";
    datePicker.required = true;
    datePicker.name = "date";
    datePicker.defaultValue = date ?? "";
    setDatePickerEventListeners(datePicker);

    const priorityPicker = document.createElement("select");
    priorityPicker.required = true;
    priorityPicker.classList.add("priority-picker", "main-input-field");
    for (const op of ["", "Low", "Medium", "High"]) {
        const option = document.createElement("option");
        option.value = op;
        option.textContent = op === "" ? "Select priority" : op;
        if (op === "") { 
            if (!priority) option.selected = true; 
            option.disabled = true; 
        }
        else if (priority === op) { 
            option.selected = true;
        }
        priorityPicker.append(option);
    }
    priorityPicker.name = "priority";
    tagInputContainer.append(datePicker, priorityPicker);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("task-input-btn-container");

    const submitTaskBtn = document.createElement("button");
    submitTaskBtn.textContent = "Add Task";
    submitTaskBtn.classList.add("submit-task-btn");
    if (container && btn) setSubmitTaskEventListeners(submitTaskBtn, inputForm, container, btn);
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.classList.add("cancel-task-btn");
    if (container && btn) {
        cancelButton.addEventListener("click", () => {
            container.removeChild(inputForm);
            btn.dataset.canceled = "true";
        });
    }
    btnContainer.append(submitTaskBtn, cancelButton);
    inputForm.append(nameField, descriptionField, tagInputContainer, btnContainer);
    return inputForm;
}

export function setAddTaskEventListeners(btn: HTMLButtonElement, container: HTMLElement, elemAfter: HTMLElement) {
    btn.addEventListener("click", () => {
        if (btn.dataset.canceled === "false") return;
        btn.dataset.canceled = "false";
        exitAllEditing();
        const inputForm = createTaskInputForm(container, btn);
        container.insertBefore(inputForm, elemAfter);
    });
}

export function createTask(name: string, description: string, date: string, priority: Priority, project: string, id: string, editable=true) {
    const taskElem = document.createElement("li");
    taskElem.classList.add("project-task");
    taskElem.dataset.id = id;

    const labelTagContainer = document.createElement("div");
    labelTagContainer.classList.add("label-tag-container");

    const btnLabelContainer = document.createElement("div");
    btnLabelContainer.classList.add("btn-label-container");

    const btn = document.createElement("button");
    btn.classList.add("task-complete-btn");
    if (editable) setTaskCompleteBtnEventListeners(btn);

    const label = document.createElement("span");
    label.classList.add("task-label");
    label.textContent = name;
    if (editable) setTaskLabelEventListeners(label);
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
    if (editable) {
        const editBtn = getSVGElement(editSVG);
        editBtn.classList.add("edit-btn");
        editBtn.addEventListener("click", () => {
            exitAllEditing();
            
            const inputForm = createTaskInputForm(undefined, undefined, name, description, date, priorityToStr(priority));
            taskElem.replaceWith(inputForm);

            inputForm.querySelector(".cancel-task-btn")?.addEventListener("click", () => {
                inputForm.replaceWith(taskElem);
            });

            inputForm.querySelector(".submit-task-btn")?.addEventListener("click", e => {
                e.preventDefault();
                if (!inputForm.reportValidity()) return;
                const projectContainer = inputForm.closest(".project-container") as HTMLElement;
                const data = new FormData(inputForm);
                const newName = data.get("taskName") as string;
                const newDescription = data.get("description") as string;
                const newDate = data.get("date") as string;
                const newPriority = strToPriority(data.get("priority") as string);
                const containerID = projectContainer?.dataset.id;
                const projID = id.split("-")[0];
                const sidebarHeader = getProjectHeader(projID as string);
                const projInfo = Project.parse(sidebarHeader.dataset.projectInfo as string);
                const newTaskObj = {name: newName, description: newDescription, date: newDate, project: projInfo?.getTitle(), priority: newPriority, id} as Task;
                projInfo?.updateTask(id, newTaskObj);
                sidebarHeader.dataset.projectInfo = JSON.stringify(projInfo);
                if (containerID !== "-1" && containerID !== "-2") {
                    
                    projectContainer?.replaceWith(createProject(projInfo as Project, projID, editable, projInfo?.getSortOrder()));
                } else if (containerID === "-1") {
                    const allProjInfo = getAllProjectInfo();
                    const newTaskObj = {name: newName, description: newDescription, date: newDate, project, priority: newPriority, id} as Task;
                    allProjInfo?.updateTask(id, newTaskObj);
                    const sortOrder = document.querySelector<HTMLSelectElement>(".sort-selector")?.value;
                    allProjInfo.setSortOrder(sortOrder as string);
                    projectContainer?.replaceWith(createProject(allProjInfo as Project, containerID, editable, allProjInfo?.getSortOrder()));
                } else {
                    const todayProjInfo = getTodayProjectInfo();
                    const newTaskObj = {name: newName, description: newDescription, date: newDate, project, priority: newPriority, id} as Task;
                    todayProjInfo?.updateTask(id, newTaskObj);
                    const sortOrder = document.querySelector<HTMLSelectElement>(".sort-selector")?.value;
                    todayProjInfo.setSortOrder(sortOrder as string);
                    projectContainer?.replaceWith(createProject(todayProjInfo as Project, containerID, editable, todayProjInfo?.getSortOrder()));
                }
            });
        });
        taskElem.append(labelTagContainer, editBtn);
    } else {
        taskElem.append(labelTagContainer);
    }
    taskElem.addEventListener("click", () => {
        console.log("yo");
        taskElem.classList.toggle("expanded");
        if (!taskElem.classList.contains("expanded")) {
            taskElem.querySelector(".task-description")?.remove();
            return;
        }
        const descriptionElem = document.createElement("div");
        descriptionElem.classList.add("task-description");
        descriptionElem.textContent = description;
        btnLabelContainer.after(descriptionElem);
    });

    return taskElem;
}

export function setSubmitTaskEventListeners(btn: HTMLButtonElement, form: HTMLFormElement, container: HTMLElement, addTaskBtn: HTMLButtonElement) {
    btn.addEventListener("click", e => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        addTaskBtn.dataset.canceled = "true";
        const projectContainer = container.closest(".project-container") as HTMLElement;
        const containerID = projectContainer.dataset.id as string;

        let projectName = "New Project";
        if (container.dataset.name) projectName = container.dataset.name;
        const formData = new FormData(form);
        const taskName = formData.get("taskName") as string;
        const description = formData.get("description") as string;
        console.log(description);
        const date = formData.get("date") as string;
        const priority = strToPriority(formData.get("priority") as string);

        const projectHeader = getProjectHeader(container.dataset.id as string);
        const proj = Project.parse(projectHeader.dataset.projectInfo as string) as Project;
        const nextID = proj?.getNextID() as string
        
        proj?.addTask(taskName, description, date, priority);
        form.remove();

        const editable = containerID !== "-1" && containerID !== "-2";
        projectContainer?.replaceWith(createProject(proj, containerID, editable, proj.getSortOrder()));
        projectHeader.dataset.projectInfo = JSON.stringify(proj);
        populateStorage();
    });
}

export function getProjectHeader(id: string) {
    const nodeList = document.querySelectorAll<HTMLElement>(".project-task-header");
    const headers = Array.from(nodeList);
    return headers.filter(header => header.dataset.id === id)[0];
}

export function setEditBtnHeadingEventListeners(btn: HTMLElement) {
    btn.addEventListener("click", () => {
        exitAllEditing();

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
            const originalInfo = Project.parse(sidebarHeader.dataset.projectInfo as string) as Project;
            originalInfo?.setTitle(newName);
            for (let task of originalInfo.getTasks()) {
                task.project = newName;
                originalInfo.updateTask(task.id, task);
            }
            sidebarHeader.dataset.projectInfo = JSON.stringify(originalInfo);
            sidebarHeader.querySelector("label")!.textContent = newName;
            projectContainer.querySelectorAll<HTMLElement>(".project-task").forEach(task => {
                document.querySelectorAll(`.project-task[data-id='${task.dataset.id}'] .project-tag`).forEach(elem => elem.textContent = newName);
            });
            projectContainer.dataset.name = newName;
            projectHeaderMain?.append(headerText, btn);
            populateStorage();
        });
        projectHeaderMain?.prepend(inputField, submitNewHeaderBtn);
        inputField.focus();
        btn.remove();
    });
}

export function createProject(projectInfo: Project, id: string, editable=true, sortOption="") {
    const projectContainer = document.createElement("div");
    projectContainer.classList.add("project-container");
    projectContainer.dataset.id = id;
    projectContainer.dataset.name = projectInfo.getTitle();

    const heading = document.createElement("h2");
    heading.classList.add("project-header-main");
    const headingSpan = document.createElement("span");
    headingSpan.classList.add("project-header-text");
    headingSpan.textContent = projectInfo.getTitle();
    if (editable) {
        const editHeading = getSVGElement(editSVG);
        editHeading.classList.add("edit-btn");
        setEditBtnHeadingEventListeners(editHeading);
        heading.append(headingSpan, editHeading);
    } else {
        heading.append(headingSpan);
    }
    
    const sortFilterContainer = document.createElement("div");
    sortFilterContainer.classList.add("sort-filter-container");
    const sortSelector = document.createElement("select");
    sortSelector.classList.add("sort-selector");
    const options = ["", "Date", "Priority"];
    for (let option of options) {
        const optionElem = document.createElement("option");
        optionElem.value = option;
        optionElem.textContent = "Sort By: " + option;
        if (option === sortOption) optionElem.selected = true;
        sortSelector.append(optionElem);
    }
    sortSelector.addEventListener("change", () => {
        let currProjectInfo;
        if (projectInfo.getProjectID() !== -1 && projectInfo.getProjectID() !== -2) {
            const projHeader = document.querySelector<HTMLElement>(`.project-task-header[data-id='${projectInfo.getProjectID()}']`);
            currProjectInfo = Project.parse(projHeader?.dataset.projectInfo as string) as Project;
            currProjectInfo.setSortOrder(sortSelector.value);
            projHeader!.dataset.projectInfo = JSON.stringify(currProjectInfo);
        } else {
            currProjectInfo = projectInfo;
            currProjectInfo.setSortOrder(sortSelector.value);
        }
        projectContainer.replaceWith(createProject(currProjectInfo, id, editable, sortSelector.value));
    });
    sortFilterContainer.append(sortSelector);

    const list = document.createElement("ul");
    list.classList.add("project-task-list");

    for (let i = 0; i < projectInfo.getTasks().length; i++) {
        const task = projectInfo.getTasks()[i];
        const taskElem = createTask(task.name, task.description, task.date, task.priority, task.project, task.id);
        list.append(taskElem);
    }
    if (editable) {
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
        projectContainer.append(heading, sortFilterContainer, list, addTaskContainer);
    } else {
        projectContainer.append(heading, sortFilterContainer, list);
    }
    return projectContainer;
}
// ── Render project ───────────────────────────────────────
export function addProject(projectInfo: Project, id: string, editable=true) {
    const projectContainer = createProject(projectInfo, id, editable, projectInfo.getSortOrder());
    mainProjectContainer?.append(projectContainer);
    populateStorage();
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
        const projHeader = elem.closest<HTMLElement>(".project-task-header");
        const checkbox = projHeader?.querySelector("input") as HTMLInputElement;
        if (checkbox.checked) checkbox.click();
        projHeader?.remove();
        const projectInfo = Project.parse(projHeader?.dataset.projectInfo as string) as Project;
        for (let task of projectInfo.getTasks()) {
            document.querySelectorAll<HTMLElement>(`.project-task[data-id='${task.id}']`).forEach(elem => elem.remove());
        }
        populateStorage();
    });
}

function addProjectHeader(projName: string, projInfo: string, id: number) {
    const projHeaderContainer = document.querySelector(".projects-container");
    const newProjHeader = document.createElement("div");
    newProjHeader.classList.add("project-task-header");
    newProjHeader.dataset.projectInfo = projInfo;
    newProjHeader.dataset.id = "" + id;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "checkbox" + id;
    checkbox.name = "checkbox" + id;
    setProjHeaderCheckboxEventListeners(checkbox);
    const label = document.createElement("label");
    label.htmlFor = "checkbox" + id;
    label.textContent = projName as string;

    const trash = getSVGElement(deleteProjectSVG);
    trash.classList.add("delete-project");
    setDeleteProjectEventListeners(trash);
    newProjHeader.append(checkbox, label, trash);
        
    projHeaderContainer?.prepend(newProjHeader);
}

function setProjHeaderSubmitBtnEventListeners(btn: HTMLButtonElement) {
    btn.addEventListener("click", e => {
        e.preventDefault();
        const addProjectsBtn = document.querySelector(".add-projects") as HTMLElement;
        const form = document.querySelector<HTMLFormElement>(".project-header-input-form");
        if (!form?.reportValidity()) {
            form?.remove();
            addProjectsBtn.dataset.canceled = "true";
            return;
        }
        addProjectsBtn.dataset.canceled = "true";
        const formData = new FormData(form);
        const projName = formData.get("name") as string;
        const allHeaders = document.querySelectorAll<HTMLElement>(".project-task-header");
        const newID = allHeaders.length > 0 ? Math.max(...Array.from(allHeaders).map(header => parseInt(header.dataset.id as string))) + 1 : 0;

        const projInfo = new Project(projName as string, [], newID);
        form?.remove();
        addProjectHeader(projName, JSON.stringify(projInfo), newID);
        populateStorage();
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
        populateStorage();
    });
}
document.querySelector<HTMLButtonElement>(".add-projects")?.addEventListener("click", e => {
    const btn = document.querySelector<HTMLButtonElement>(".add-projects") as HTMLButtonElement;
    if (btn?.dataset.canceled === "false") return;
    btn.dataset.canceled = "false";
    const projectsSection = document.querySelector<HTMLElement>(".projects-section");
    if (projectsSection?.classList.contains("collapsed")) {
        document.querySelector<HTMLElement>(".projects-header")?.click();
    }
    const projHeaderContainer = document.querySelector(".projects-container");
    const projHeaderInput = document.createElement("form");
    projHeaderInput.classList.add("project-header-input-form");
    projHeaderInput.autocomplete = "off";
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

function createDefaultProject() {
    document.querySelector<HTMLButtonElement>(".add-projects")?.click();
    document.querySelector<HTMLInputElement>(".project-header-input-field")!.value="My Projects";
    document.querySelector<HTMLInputElement>(".project-header-submit-btn")?.click();
    populateStorage();
}

function getSpecificProjectInfo(filter: (t: Task) => boolean, title: string) {
    const projects = Array.from(document.querySelectorAll<HTMLElement>(".project-task-header"));
    const projectInfos = projects.map(project => Project.parse(project.dataset.projectInfo as string)) as Project[];
    const combinedTasks = [];
    for (let project of projectInfos) {
        for (let task of project.getTasks()) {
            if (filter(task)) combinedTasks.push(task);
        }
    }
    const combinedProjectInfos = new Project(title, combinedTasks, -1);
    return combinedProjectInfos;
}

function getAllProjectInfo() {
    return getSpecificProjectInfo((t: Task) => true, "All");
}
function getTodayProjectInfo() {
    return getSpecificProjectInfo((t: Task) => isToday(t.date), "Today");
}

function allTodayEventListener(section: string) {
    let a = allSection;
    let b = todaySection;
    let id="-1";
    if (section === "Today") {
        b = allSection;
        a = todaySection;
        id="-2";
    }
    document.querySelectorAll(".project-container").forEach(elem => elem.remove());
    if (a.dataset.clicked === "true") {
        a.dataset.clicked = "false";
        return;
    }
    a.dataset.clicked = "true";
    b.dataset.clicked = "false";
    document.querySelector(".projects-section")?.classList.add("collapsed");
    if (section === "All") addProject(getAllProjectInfo(), id, false);
    else if (section === "Today") addProject(getTodayProjectInfo(), id, false);
}
allSection?.addEventListener("click", () => {
    allTodayEventListener("All");
    populateStorage();
});

todaySection?.addEventListener("click", () => {
    allTodayEventListener("Today");
    populateStorage();
});

function populateStorage() {
    const projects = JSON.stringify(
        Array.from(document.querySelectorAll<HTMLElement>(".project-task-header"))
        .map(elem => elem.dataset.projectInfo as string));
    localStorage.setItem("projects", projects);
    const selectedProjects = JSON.stringify(
        Array.from(document.querySelectorAll<HTMLElement>(".project-task-header"))
        .filter(elem => elem.querySelector<HTMLInputElement>("input")?.checked)
        .map(elem => elem.dataset.id));
    localStorage.setItem("selectedProjects", selectedProjects);
    const selectedTab = 
        allSection.dataset.clicked === "true" ? "All" :
        todaySection.dataset.clicked === "true" ? "Today" :
        "Projects"
    localStorage.setItem("selectedTab", selectedTab);
}

function storageAvailable(type: "localStorage" | "sessionStorage") {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === "QuotaExceededError" &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

function setup() {
    if (!storageAvailable("localStorage") || localStorage.length === 0) {
        createDefaultProject();
    } else {
        const projects = JSON.parse(localStorage.projects);
        console.log(projects);
        const selectedProjects = JSON.parse(localStorage.selectedProjects);
        const selectedTab = localStorage.selectedTab;
        for (const p of [...projects].reverse()) {
            const project = Project.parse(p) as Project;
            addProjectHeader(project.getTitle(), JSON.stringify(project), project.getProjectID());
        }
        for (const id of selectedProjects) {
            document.querySelector<HTMLElement>(`.project-task-header[data-id='${id}']`)
                ?.querySelector("input")?.click();
        }
        switch (selectedTab) {
            case "All":
                allSection.click();
                break;
            case "Today":
                todaySection.click();
                break;
        }
    }
}

setup();