// To-Do List App
class TodoApp {
    constructor() {
        this.tasks = this.loadFromStorage();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheDom();
        this.bindEvents();
        this.render();
    }

    cacheDom() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.allCount = document.getElementById('allCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e.target.dataset.filter));
        });

        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    }

    addTask() {
        const text = this.taskInput.value.trim();
        
        if (text === '') {
            this.showError('Please enter a task first!');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.taskInput.value = '';
        this.saveToStorage();
        this.render();
        this.showSuccess('Task added successfully!');
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveToStorage();
        this.render();
        this.showSuccess('Task deleted successfully!');
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.render();
        }
    }

    filterTasks(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.render();
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            this.showError('No completed tasks!');
            return;
        }

        if (confirm(`Delete ${completedCount} completed tasks?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveToStorage();
            this.render();
            this.showSuccess('Completed tasks cleared successfully!');
        }
    }

    getFilteredTasks() {
        switch(this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    updateCounts() {
        const allTasks = this.tasks.length;
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;

        this.allCount.textContent = allTasks;
        this.activeCount.textContent = activeTasks;
        this.completedCount.textContent = completedTasks;

        // Disable clear button if no completed tasks
        this.clearCompletedBtn.disabled = completedTasks === 0;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        this.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.renderEmptyState();
        } else {
            filteredTasks.forEach(task => {
                this.renderTask(task);
            });
        }

        this.updateCounts();
    }

    renderTask(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-checkbox"></div>
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <button class="btn-delete">🗑️</button>
        `;

        // Event listeners
        const checkbox = li.querySelector('.task-checkbox');
        const deleteBtn = li.querySelector('.btn-delete');

        checkbox.addEventListener('click', () => this.toggleTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        this.taskList.appendChild(li);
    }

    renderEmptyState() {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        
        let message = '';
        switch(this.currentFilter) {
            case 'active':
                message = '🎉 No active tasks!';
                break;
            case 'completed':
                message = '📭 No completed tasks yet!';
                break;
            default:
                message = '📝 No tasks yet. Add your first task!';
        }

        emptyDiv.innerHTML = `
            <div class="icon">📋</div>
            <p>${message}</p>
        `;

        this.taskList.appendChild(emptyDiv);
    }

    // Storage methods
    saveToStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('todoTasks');
        return stored ? JSON.parse(stored) : [];
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Simple notification using input border color change
        if (type === 'error') {
            this.taskInput.style.borderColor = 'var(--danger-color)';
            this.taskInput.placeholder = message;
            setTimeout(() => {
                this.taskInput.style.borderColor = '';
                this.taskInput.placeholder = 'Add new task...';
            }, 2000);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
