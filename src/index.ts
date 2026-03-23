import "./styles.css"

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