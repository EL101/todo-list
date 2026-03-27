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
    tasks: {
        name: string,
        date: string,
        priority: 0 | 1 | 2,
    }[]
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

const mainProjectContainer = document.querySelector(".main-project-container");

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

function setAddTaskEventListeners(btn: HTMLButtonElement, container: HTMLElement, elemAfter: HTMLElement) {
    btn.addEventListener("click", () => {
        if (btn.dataset.canceled === "false") return;
        btn.dataset.canceled = "false";
        const inputContainer = document.createElement("div");
        inputContainer.classList.add("task-input-container");
        const nameField = document.createElement("input");
        nameField.type = "text";
        nameField.required = true;
        nameField.placeholder = "Task name";
        nameField.classList.add("task-name-input");
        const tagInputContainer = document.createElement("div");
        tagInputContainer.classList.add("tag-input-container");
        const datePicker = document.createElement("input");
        datePicker.classList.add("date-picker");
        datePicker.type = "date";
        const priorityPicker = document.createElement("select");
        priorityPicker.classList.add("priority-picker");
        tagInputContainer.append(datePicker, priorityPicker);

        const btnContainer = document.createElement("div");
        btnContainer.classList.add("task-input-btn-container");
        const submitTaskBtn = document.createElement("button");
        submitTaskBtn.textContent = "Add Task";
        submitTaskBtn.classList.add("submit-task-btn");
        const cancelButton = document.createElement("button");
        submitTaskBtn.textContent = "Cancel";
        submitTaskBtn.classList.add("cancel-task-btn");
        btnContainer.append(submitTaskBtn, cancelButton);

        inputContainer.append(nameField, tagInputContainer, btnContainer);
        container?.insertBefore(inputContainer, elemAfter);
    });
}
// document.querySelectorAll<HTMLInputElement>('.task-complete-btn').forEach(btn => {
//     setTaskCompleteBtnEventListeners(btn);
// });

// document.querySelectorAll<HTMLElement>('.task-label').forEach(label => {
//     setTaskLabelEventListeners(label);
// });

function priorityToStr(priority: 0 | 1 | 2) {
    if (priority === 0) return "Low";
    else if (priority === 1) return "Medium";
    else return "High";
}

function addProject(projectInfo: project, id:string) {
    const projectContainer = document.createElement("div");
    projectContainer.classList.add("project-container");
    
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

        const labelTagContainer = document.createElement("div");
        labelTagContainer.classList.add("label-tag-container");

        const btnLabelContainer = document.createElement("div");
        btnLabelContainer.classList.add("btn-label-container");

        const btn = document.createElement("button");
        btn.classList.add("task-complete-btn");
        setTaskCompleteBtnEventListeners(btn as HTMLInputElement);

        const label = document.createElement("span");
        label.classList.add("task-label");
        label.textContent = task.name;
        setTaskLabelEventListeners(label as HTMLElement);
        btnLabelContainer.append(btn, label);

        const tags = document.createElement("div");
        tags.classList.add("tags-container");
        const dateTag = document.createElement("div");
        dateTag.classList.add("date-tag")
        dateTag.textContent = task.date;
        const priorityTag = document.createElement("div");
        priorityTag.classList.add("priority-tag");
        priorityTag.textContent = priorityToStr(task.priority);
        priorityTag.classList.add(priorityToStr(task.priority).toLowerCase());
        const projectTag = document.createElement("div");
        projectTag.classList.add("project-tag");
        projectTag.textContent = projectInfo.title;
        tags.append(dateTag, priorityTag, projectTag);
        labelTagContainer.append(btnLabelContainer, tags);

        const editBtn = parser.parseFromString(editSVG, "image/svg+xml").documentElement;
        editBtn.classList.add("edit-btn");

        taskElem.append(labelTagContainer, editBtn);
        list.append(taskElem);
    }
    const addTaskContainer = document.createElement("div");
    addTaskContainer.classList.add("add-task-container");
    const addTaskButton = document.createElement("button");
    addTaskButton.classList.add("add-task-button");
    addTaskButton.id=id;
    addTaskButton.textContent = "+";
    addTaskButton.dataset.canceled = "true";
    setAddTaskEventListeners(addTaskButton, projectContainer, addTaskContainer);

    const addTaskButtonLabel = document.createElement("label");
    addTaskButtonLabel.classList.add("add-task-label");
    addTaskButtonLabel.htmlFor = id;
    addTaskButtonLabel.textContent = "Add Task";
    addTaskButtonLabel.addEventListener("click", () => addTaskButton.click());

    addTaskContainer.append(addTaskButton, addTaskButtonLabel);

    projectContainer.dataset.id = id;
    projectContainer.append(heading, list, addTaskContainer);
    mainProjectContainer?.append(projectContainer);
}

document.querySelectorAll<HTMLInputElement>(".project-task-header input").forEach(child => {
        child.addEventListener("click", e => {
            if (!child.checked) {
                if (mainProjectContainer?.children) {
                    const childID = child.parentElement?.dataset.id;
                    const children = Array.from(mainProjectContainer?.children);
                    const filtered = children.filter(elem => elem instanceof HTMLElement && elem.dataset.id === childID);
                    for (let c of filtered) {
                        mainProjectContainer.removeChild(c);
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