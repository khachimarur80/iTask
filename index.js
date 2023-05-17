//Functions

function getRandomVuetifyColor(givenColors) {
  const randomIndex = Math.floor(Math.random() * givenColors.length);
  const randomColor = givenColors[randomIndex];

  return randomColor
}

function generateId() {
  let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let idLength = 8;
  let id = '';

  for (let i = 0; i < idLength; i++) {
    let randomIndex = Math.floor(Math.random() * randomChars.length);
    id += randomChars.charAt(randomIndex);
  }

  return id;
}

//Stored data
let storedProjects = [];
if (localStorage.getItem('projects')) {
	storedProjects = JSON.parse(localStorage.getItem('projects'));
}
let storedTasks = [];
for (let i=0; i<storedProjects.length; i++) {
	storedTasks = storedTasks.concat(storedProjects[i].tasks)
}
let storedRemainders = [];
for (let i=0; i<storedProjects.length; i++) {
	storedRemainders = storedRemainders.concat(storedProjects[i].remainders)
}

for (let i=0; i<storedTasks.length; i++) {
	var currentDate = new Date();
	var day = currentDate.getDate().toString().padStart(2, '0');
	var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
	var year = currentDate.getFullYear().toString();
	var formattedDate = `${day}/${month}/${year}`;
	if (storedTasks[i].history[storedTasks[i].history.length-1]!=formattedDate) {
		storedTasks[i].completed = false
	}
}
const colors = [
	"#607D8B", "#795548", "#FF5722", "#FF9800", "#009688",
	"#00BCD4", "#03A9F4", "#2196F3", "#3F51B5", "#673AB7", "#9C27B0", "#E91E63", "#F44336"
];


//Classes
class Project {
	constructor(name, description, colors, tasks, deadline = 0) {
		this.deadline = deadline;
		this.name = name;
		this.description = description;
		this.color = getRandomVuetifyColor(colors);
		this.tasks = tasks ;
		this.completed = false;
		this.remainders = [];
	}
}

class Task {
	constructor(name) {
		this.name = name;
		this.pk = generateId();
		this.color = '';
		this.frequency = [0, 1, 2, 3, 4, 5, 6];
		this.completed = false;
		this.history = [];
		this.duration = 30;
	}
}

class Remainder {
	constructor(name, deadline='') {
		this.name = name;
		this.deadline = deadline;
		this.description = '';
		this.color = '';
		this.showDescription = false;
	}
}

//Custom elements

const vuetifyApp = new Vuetify({
	theme: {
  	}
})

const vueApp = new Vue({
	el: '#app',
	vuetify: vuetifyApp,
	data: {
		creatingProject: false,
		editingProject: false,
		editingTask: false,
		projects: storedProjects,
		projectName: '',
		projectDeadline: '',
		projectDescription: '',
		projectTasks: [],
		removedProjectTasks: [],
		editProjectTarget: [],
		newProjectName: '',
		newProjectDeadline: '',
		newProjectTasks: [],
		newProjectRemovedTasks: [],
		newProjectDescription: '',
		newProjectRemainders: [],
		newTask: '',
		tasks: storedTasks,
		currentTime: null,
		newTaskName: '',
		editTaskTarget: [],
		newTaskFrequency: [],
		newTaskDuration: 0,
		editProjectColor: '#ddd',
		newRemainder: '',
		newProjectRemovedRemainders: [],
		remainders: storedRemainders,

	},
	computed: {
      projectForm () {
        return {
          projectName: this.projectName,
          projectDeadline: this.projectDeadline,
        }
      },
    },
	methods: {
		cancelProject: function cancelProject() {
			this.creatingProject = false;
			this.projectDeadline = '';
			this.projectName = '';
			this.projectDescription = ''

			Object.keys(this.projectForm).forEach(f => {
          		this.$refs[f].reset();
        	})
		},
		saveProject: function saveProject() {
			var valid = true
			Object.keys(this.projectForm).forEach(f => {
	        	if (!this.projectForm[f])
				this.$refs[f].validate(true);
				valid *= this.$refs[f].validate(true);
	        })
	        if (valid===1) {
	        	var remainingColors = colors.filter(color => {
	        		return !this.projects.some(obj => obj.color === color)
	        	})

	        	if (this.projectDeadline=='') {
	        		var newProject = new Project(this.projectName, this.projectDescription, remainingColors, this.projectTasks);
	        	}
	        	else {
	        		var newProject = new Project(this.projectName, this.projectDescription, remainingColors, this.projectTasks, this.projectDeadline);
	        	}
	        	this.projects.push(newProject);
	        	this.tasks.push(...this.projectTasks.filter(item => {
	        		item.color = newProject.color
					return !this.tasks.some(targetItem => targetItem.pk === item.pk);
				}));

	        	this.creatingProject = false;
	        	this.projectTasks = [];
	        	this.projectDescription = ''

		        Object.keys(this.projectForm).forEach(f => {
	          		this.$refs[f].reset();
	        	})
	        }
	        localStorage.setItem('projects', JSON.stringify(this.projects));
		},
		projectsRight: function projectsRight() {
			var first = this.projects.shift();
			this.projects.push(first);
			localStorage.setItem('projects', JSON.stringify(this.projects))
		},
		projectsLeft: function projectsLeft() {
			var last = this.projects.pop();
			this.projects.unshift(last);
			localStorage.setItem('projects', JSON.stringify(this.projects))
		},
		editProject: function editProject(project) {
			this.editingProject = true;
			this.editProjectTarget = project;
			this.newProjectName = project.name;
			this.newProjectDeadline = project.deadline;
			this.newProjectTasks = Array.from(project.tasks);
			this.newProjectRemainders = Array.from(project.remainders);
			this.newProjectDescription = project.description;
			this.editProjectColor = project.color
		},
		addTaskProject: function addTaskProject() {
			if (this.newTask) {
				var newTaskObj = new Task(this.newTask)
				this.projectTasks.push(newTaskObj)
			}
			this.newTask = ''
		},
		removeTask(index) {
      		this.tasks.splice(this.tasks.indexOf(this.projectTasks[index]),1)
      		this.projectTasks.splice(index, 1)
    	},
		cancelProjectEdit: function cancelProjectEdit() {
			this.editingProject = false;
			this.newProjectName = '';
			this.newProjectDeadline = '';
			this.newProjectTasks = [];
			this.editProjectTarget = [];
			this.newProjectRemovedTasks = [];
			this.newProjectDescription = ''
			this.editProjectColor = '#ddd';
		},
		saveProjectEdit: function saveProjectEdit() {
			this.editProjectTarget.name = this.newProjectName;
			this.editProjectTarget.deadline = this.newProjectDeadline;
			this.editProjectTarget.tasks = this.newProjectTasks;
			this.editProjectTarget.description = this.newProjectDescription;
			this.editProjectTarget.remainders = this.newProjectRemainders;

			this.tasks.push(...this.newProjectTasks.filter(item => {
				item.color = this.editProjectTarget.color
				return !this.tasks.some(targetItem => targetItem.pk === item.pk);
			}));

			this.remainders.push(...this.newProjectRemainders.filter(item => {
				item.color = this.editProjectTarget.color;
				return !this.remainders.some(targetItem => targetItem.pk === item.pk);
			}));

			this.tasks = this.tasks.filter((element) => !this.newProjectRemovedTasks.includes(element));
			this.remainders = this.remainders.filter((element) => !this.newProjectRemovedRemainders.includes(element));

			this.editingProject = false;
			this.newProjectName = '';
			this.newProjectDeadline = '';
			this.newProjectTasks = [];
			this.editProjectTarget = [];
			this.editProjectColor = '#ddd';
			this.newProjectRemovedTasks = [];
			this.newProjectRemovedRemainders = [];
			this.newProjectRemainders = [];

			localStorage.setItem('projects', JSON.stringify(this.projects));
		},
		deleteProjectEdit: function deleteProjectEdit() {
			this.tasks = this.tasks.filter((element) => !this.editProjectTarget.tasks.includes(element));
			this.remainders = this.remainders.filter((element) => !this.editProjectTarget.remainders.includes(element));

			this.projects.splice(this.projects.indexOf(this.editProjectTarget),1);
			localStorage.setItem('projects', JSON.stringify(this.projects));

			this.editingProject = false;
			this.newProjectName = '';
			this.newProjectDeadline = '';
			this.newProjectTasks = [];
			this.editProjectTarget = [];
			this.editProjectColor = '#ddd';
		},
		removeEditTask: function removeEditTask(index) {
			this.newProjectRemovedTasks.push(this.newProjectTasks[index])
			this.newProjectTasks.splice(index, 1)
		},
		removeEditRemainder: function removeEditRemainder(index) {
			this.newProjectRemovedRemainders.push(this.newProjectRemainders[index])
			this.newProjectRemainders.splice(index, 1)
		},
		editTaskProject: function editTaskProject() {
			if (this.newTask) {
				var newTaskObj = new Task(this.newTask);
				this.newProjectTasks.push(newTaskObj);
			}
			this.newTask = '';
		},
		editRemainderProject: function editRemainderProject() {
			if (this.newRemainder) {
				var newTaskObj = new Task(this.newRemainder);
				this.newProjectRemainders.push(newTaskObj);
			}
			this.newRemainder = '';
		},
		updateTime: function updateTime() {
			const now = new Date();
			this.currentTime = now.toLocaleTimeString();
		},
		editTask: function editTask(task) {
			this.editingTask = true;
			this.editTaskTarget = task;

			this.newTaskName = task.name;
			this.newTaskDuration = task.duration
			this.newTaskFrequency = task.frequency
		},
		deleteTaskEdit: function deleteTaskEdit() {
			var project = this.projects.find(obj => obj.color === this.editTaskTarget.color);

			this.tasks.splice(this.tasks.indexOf(this.editTaskTarget),1);
			project.tasks.splice(project.tasks.indexOf(this.editTaskTarget),1);

			this.newTaskName = '';
			this.editTaskTarget = [];
			this.editingTask = false;

			localStorage.setItem('projects', JSON.stringify(this.projects));
		},
		cancelTaskEdit: function cancelTaskEdit() {
			this.newTaskName = '';
			this.editTaskTarget = [];
			this.editingTask = false;
		},
		saveTaskEdit: function saveTaskEdit() {
			this.editTaskTarget.name = this.newTaskName
			this.editTaskTarget.duration = this.newTaskDuration
			this.editTaskTarget.frequency = this.newTaskFrequency

			this.newTaskName = '';
			this.newTaskDuration = 0;
			this.newTaskFrequency = [];
			this.editTaskTarget = [];
			this.editingTask = false;

			localStorage.setItem('projects', JSON.stringify(this.projects));
		},
		isDisabled: function isDisabled(frequency) {
			var dayOfWeek = new Date().getDay() - 1;
      		return !frequency.includes(dayOfWeek);
		},
		completeTask: function completeTask(task) {
			if (task.completed) {
				var currentDate = new Date();
				var day = currentDate.getDate().toString().padStart(2, '0');
				var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
				var year = currentDate.getFullYear().toString();
				var formattedDate = `${day}/${month}/${year}`;
				task.history.push(formattedDate)
			}
			else {
				task.history.pop();
			}
			localStorage.setItem('projects', JSON.stringify(this.projects));
		},
		dismissReminder: function dismissReminder(remainder) {
			var project = this.projects.find(obj => obj.color === remainder.color);
			this.remainders.splice(this.remainders.indexOf(remainder),1);
			project.remainders.splice(project.remainders.indexOf(remainder),1);
			localStorage.setItem('projects', JSON.stringify(this.projects));
		},
		showReminderDescription: function showReminderDescription(remainder) {
			remainder.showDescription = !remainder.showDescription;
		}

	},
	created() {
	    this.updateTime();
	    setInterval(this.updateTime, 1000);
	},
})
