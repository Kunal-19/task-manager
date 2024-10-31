// DOM Element Selectors
const addBtn = document.querySelector(".header__action--add");
const delBtn = document.querySelector(".header__action--delete");
const card = document.querySelector(".card");
const textarea = document.querySelector("textarea");
const wrapper = document.querySelectorAll(".wrapper");
const emptyMessage = wrapper[1].querySelector(".empty");
const clrGroup = document.querySelectorAll(".header__color");
const cardClrGroup = document.querySelectorAll(".card__color");
const clrMap = {
    "pink": 0,
    "blue": 1,
    "green": 2,
    "black": 3,
}

const borderColor = "3px solid rgb(65,65,65)";
let isDeleteMode = false;
let currHeaderClr = null, currCardClr = null;

// Load tasks from sessionStorage and recreate them on page load
// Toggle visibility of the empty message
const toggleEmptyMessage = () => {
    emptyMessage.style.display = wrapper[1].querySelectorAll(".task-content").length ? "none" : "flex";
};

window.addEventListener("load", () => {
    const savedTasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    savedTasks.forEach(taskData => {
        createTask(taskData.id, taskData.desc, taskData.color);
    });
    toggleEmptyMessage();
});

window.addEventListener("beforeunload", () => saveTasks());

// Save tasks to sessionStorage
const saveTasks = () => {
    const tasks = Array.from(wrapper[1].querySelectorAll(".task-content")).map(task => ({
        id: task.id,
        desc: task.querySelector(".task-content__desc").textContent,
        color: task.classList[1]
    }));
    sessionStorage.setItem("tasks", JSON.stringify(tasks));
};

// Helper Functions
const generateToken = () => Array(6).fill(null)
    .map(() => Math.random().toString(36).substring(2))
    .join("").substring(0, 10);

const toggleVisibility = (element, isVisible) => {
    element.style.visibility = isVisible ? "visible" : "hidden";
};

const toggleOpacity = (element, isDimmed) => {
    element.style.opacity = isDimmed ? "0.3" : "1";
};

const applyBorder = (element, apply) => {
    element.style.border = apply ? borderColor : "none";
};

const resetTasksVisibility = (isVisible) => {
    document.querySelectorAll(".task-content").forEach(task => {
        task.style.display = isVisible ? "flex" : "none";
    });
};

// Toggle Delete Mode
const toggleDeleteMode = (isActive) => {
    delBtn.style.backgroundColor = isActive ? "#353535" : "#4d4d4d";
    toggleOpacity(wrapper[wrapper.length - 1], isActive);
    isDeleteMode = isActive;
};

// Toggle Color Selection
const toggleColorMode = (currentColor, newColor) => {
    if (currentColor !== newColor) {
        if (currentColor) applyBorder(currentColor, false);
        applyBorder(newColor, true);
        return newColor;
    } else {
        applyBorder(newColor, false);
        return null;
    }
};

// Toggle Card Visibility
const toggleCardVisibility = (show) => {
    toggleVisibility(card, show);
    addBtn.style.backgroundColor = show ? "#353535" : "#4d4d4d";
    toggleOpacity(wrapper[wrapper.length - 1], show);
    if (show) textarea.focus();
};

// Create Task with Deletion Capability
const createTask = (tokenId, taskDesc, taskColor) => {
    const task = document.createElement("div");
    const taskId = document.createElement("div");
    const taskDescDiv = document.createElement("div");

    task.setAttribute("id", tokenId);
    task.classList.add("task-content", taskColor);
    taskId.classList.add("task-content__id");
    taskDescDiv.classList.add("task-content__desc");
    taskId.textContent = `#${tokenId}`;
    taskDescDiv.textContent = taskDesc;

    task.append(taskId, taskDescDiv);

    // Deletion logic when in delete mode
    task.addEventListener("click", () => {
        console.log("Task clicked"); // Confirm event listener assignment
        console.log("Delete Mode:", isDeleteMode);
        if (isDeleteMode) {
            if (confirm("Are you sure you want to delete this task?")) {
                task.remove();
                toggleEmptyMessage();
                saveTasks(); // Save after deletion for persistence
            }
        }
    });
    console.log("Event listener added to task with ID:", tokenId);

    // Hide the empty message if there's at least one task
    wrapper[1].querySelector(".empty").style.display = "none";
    wrapper[1].appendChild(task);
};

// Event Handlers
// Toggle Add and Delete button classes instead of inline styles
addBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (isDeleteMode) toggleDeleteMode(isDeleteMode = false);

    addBtn.classList.toggle("active");
    delBtn.classList.remove("active"); // Ensure the delete button is not active

    toggleCardVisibility(card.style.visibility === "hidden" || !card.style.visibility);
    resetTasksVisibility(true);
});

delBtn.addEventListener("click", (event) => {
    event.preventDefault();
    addBtn.classList.remove("active"); // Ensure the add button is not active
    delBtn.classList.toggle("active");

    toggleCardVisibility(false);
    toggleDeleteMode(isDeleteMode = !isDeleteMode);
});

document.addEventListener("keypress", (event) => {
    if (card.style.visibility === "hidden" || !card.style.visibility) return;

    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        createTask(generateToken(), textarea.value, currCardClr?.classList[1] || "black");
        textarea.value = "";
        toggleCardVisibility(false);
    }
});

// Header and Card Color Selectors
clrGroup.forEach((clr) => {
    clr.addEventListener("click", () => {
        if (!(card.style.visibility === "hidden" || !card.style.visibility) || isDeleteMode) return;

        resetTasksVisibility(true);
        currHeaderClr = toggleColorMode(currHeaderClr, clr);
        if (!currHeaderClr) return;

        document.querySelectorAll(".task-content").forEach(task => {
            task.style.display = task.classList.contains(currHeaderClr.classList[1]) ? "flex" : "none";
        });
    });
});

cardClrGroup.forEach((clr) => {
    clr.addEventListener("click", () => {
        currCardClr = toggleColorMode(currCardClr, clr);
    });
});