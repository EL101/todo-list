import "./styles.css"

const sidebar = document.querySelector(".sidebar");
const sidebar_collapse_button = document.querySelector(".sidebar-collapse-button");
sidebar_collapse_button?.addEventListener("click", e => {
    sidebar?.classList.toggle("collapsed");
});

const projects_header = document.querySelector(".projects-header");
const projects_section = document.querySelector(".projects-section");
const projects_container = document.querySelector<HTMLDivElement>(".projects-container");
projects_header?.addEventListener("click", e => {
    projects_section?.classList.toggle("collapsed");
    
});