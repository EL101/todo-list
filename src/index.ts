import "./styles.css"

const sidebar = document.querySelector(".sidebar");
const sidebar_collapse_button = document.querySelector(".sidebar-collapse-button");
sidebar_collapse_button?.addEventListener("click", e => {
    sidebar?.classList.toggle("collapsed");
});