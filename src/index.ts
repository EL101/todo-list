import "./styles.css"
import "./sidebar.css"
import "./main.css"

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

document.querySelectorAll('.task-complete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.project-task')?.classList.toggle('done');
    });
});

document.querySelectorAll('.task-label').forEach(label => {
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
        }
    });
    label.addEventListener("mouseleave", () => {
        if (label.previousElementSibling != null) {
            const btn = label.previousElementSibling as HTMLButtonElement;
            btn.classList.remove("hovered");
        }
    });
});