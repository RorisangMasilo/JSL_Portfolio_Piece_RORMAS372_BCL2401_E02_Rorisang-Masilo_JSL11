// TASK: import helper functions from utils
import {
  getTasks,
  createNewTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  sideBar: document.getElementById("side-bar-div"),
  logo: document.getElementById("logo"),
  headerBoardName: document.getElementById("header-board-name"),
  editBoardBtn: document.getElementById("edit-board-btn"),
  editBoardDiv: document.getElementById("editBoardDiv"),
  columnDivs: document.querySelectorAll(".column-div"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window"),
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  statusInput: document.getElementById("select-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  editTaskModal: document.getElementsByClassName("edit-task-modal-window")[0],
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  filterDiv: document.getElementById("filterDiv"),
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; //bug fixed : used instead of ;
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  [...document.querySelectorAll(".board-btn")].map((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

//Adds a task to the UI
function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }
  // Create the task element
  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener("click", (event) => toggleTheme(event));

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  elements.editBoardBtn.addEventListener("click", () => {
    elements.editBoardDiv.style.display =
      elements.editBoardDiv.style.display === "flex" ? "none" : "flex";
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}
// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  // modal = (modal === null)? elements.modalWindow : modal;
  modal.style.display = show ? "block" : "none";
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
    title: elements.titleInput.value,
    discription: elements.descInput.value,
    status: elements.statusInput.value,
    board: activeBoard,
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  elements.showSideBarBtn.style.display = show ? "none" : "block";
  elements.sideBar.style.display = show ? "block" : "none";
}

function toggleTheme(event) {
  document.body.classList.toggle("light-theme");
  const isLightTheme = document.body.classList.contains("light-theme");

  localStorage.setItem("light-theme", isLightTheme ? "enabled" : "disabled");
  elements.themeSwitch.checked = isLightTheme;
  elements.logo.src = elements.logo.src
    .replace(window.location.origin, ".")
    .replace(isLightTheme ? "dark" : "light", isLightTheme ? "light" : "dark");
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  const selectedStatus = elements.editSelectStatus.querySelector(
    `option[value="${task.status}"]`
  );
  selectedStatus.selected = true;

  toggleModal(true, elements.editTaskModal);

  // Get button elements from the task modal
  const saveEditBtn = document.getElementById("save-task-changes-btn"),
    deleteTaskBtn = document.getElementById("delete-task-btn");

  // Call saveTaskChanges upon click of Save Changes button
  saveEditBtn.addEventListener("click", (event) => {
    event.preventDefault();
    saveTaskChanges(task.id);
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener("click", (event) => {
    event.preventDefault();

    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });
}

// Show the edit task modal

function saveTaskChanges(taskId) {
  // Get new user inputs
  const editTaskTitleInput = document.getElementById("edit-task-title-input"),
    editTaskDescInput = document.getElementById("edit-task-desc-input"),
    editSelectStatus = document.getElementById("edit-select-status");

  // Create an object with the updated task details
  const task = {
    id: taskId,
    title: editTaskTitleInput.value,
    description: editTaskDescInput.value,
    status: editSelectStatus.value,
    board: activeBoard,
  };

  // Update task using a hlper functoin
  putTask(taskId, task);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  elements.themeSwitch.checked = isLightTheme;
  elements.logo.src = elements.logo.src
    .replace(window.location.origin, ".")
    .replace(isLightTheme ? "dark" : "light", isLightTheme ? "light" : "dark");
  // refreshTasksUI(); // Initial display of boards and tasks
  fetchAndDisplayBoardsAndTasks();
}
