//Classes
class Task {
	constructor(name, date) {
		this.name = name
		this.difficulty = 0
		this.completed = [false, true, false, false, false, false]
		this.frequency = [0, 1, 2, 3, 4, 5, 6]
		this.created = date
		this.start = '00:00' 
		this.end = '00:00'
	}
}
class Objective {
	constructor(name) {
		this.name = name
		this.difficulty = 1
		this.completed = false
		this.days = 0
	}
}
class User {
	constructor(name, date) {
		this.name = name
		this.level = 0
		this.experience = 0
		this.mana = 100
		this.points = 0
		this.theme = true
		this.health = 100
		this.created = date
	}
}

//Functions

function dateDiffInDays(date1Str, date2Str) {
  const date1 = new Date(date1Str);
  const date2 = new Date(date2Str);
  const diffInMs = Math.abs(date2 - date1);
  return Math.floor(diffInMs/1000);
}

function areDatesFromDifferentDays(date1, date2) {
  // Get the year, month, and day values for both dates
  const year1 = date1.getFullYear();
  const month1 = date1.getMonth();
  const day1 = date1.getDate();
  const year2 = date2.getFullYear();
  const month2 = date2.getMonth();
  const day2 = date2.getDate();

  // Compare the year, month, and day values of both dates
  if (year1 !== year2 || month1 !== month2 || day1 !== day2) {
    return true; // dates are from different days
  } else {
    return false; // dates are from the same day
  }
}

function getStreakColor(daysCompleted) {
  const colors = [
    '#E53935',
    '#FF8F00',
    '#4CAF50',
    '#1976D2',
  ];

  const numCompleted = daysCompleted.filter(Boolean).length;

  let streak = 0;
  for (let i = daysCompleted.length - 1; i >= 0; i--) {
    if (daysCompleted[i]) {
      streak++;
    } else {
      break;
    }
  }
  const adjustedNumCompleted = Math.min(
    daysCompleted.length,
    numCompleted + streak
  );
  const proportionCompleted = adjustedNumCompleted / daysCompleted.length;
  const colorIndex = Math.floor(proportionCompleted * colors.length);
  if (colorIndex<4) {
    return colors[colorIndex];
  }
  else {
  	return colors[3]
  }
}

//Stored values
localStorage = window.localStorage

let user
if (localStorage.getItem('user')) {
	user = JSON.parse(localStorage.getItem('user'))
}
else {
	var today = new Date();
	var newUser = new User('User', today)
	localStorage.setItem('user', JSON.stringify(newUser))
	user = JSON.parse(localStorage.getItem('user'))
}

let storedTasks
if (localStorage.getItem('tasks')) {
	storedTasks = JSON.parse(localStorage.getItem('tasks'))
	for (i=0; i<storedTasks.length; i++) {
		var today = new Date()
		if (areDatesFromDifferentDays(new Date(storedTasks[i].created), today)) {
			storedTasks[i].completed.unshift(false)
		}
	}
}
else {
	storedTasks = []
}

let storedObjectives
if (localStorage.getItem('objectives')) {
 	storedObjectives = JSON.parse(localStorage.getItem('objectives'))
}
else {
	storedObjectives = []
}

//Custom elements

const TaskCard = {
  props: ['text', 'taskIndex', 'difficulty', 'frequency', 'created', 'completed', 'start', 'end'],
  template: `
    <v-card width="95%" class="mt-1 d-flex align-center" flat outlined :style="{borderColor: levelColor}">
    	<v-checkbox dense hide-details class="ml-2  mb-2" v-model="computedCompleted" @click="changeState()"></v-checkbox>
      <v-card-text class="pa-2 text-body-1">{{ text }}</v-card-text>
      <v-text-field type="time" v-model="computedStart" hide-details hide-icon class="ma-0 pa-0 mb-2" color="secondary" @change="editTask()"></v-text-field>
      <p style="margin: 6px;"> - </p>
      <v-text-field type="time" v-model="computedEnd" hide-details hide-icon class="ma-0 pa-0 pr-2 mb-2" color="secondary" @change="editTask()"></v-text-field>
      <v-dialog width="400">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" small class="mr-1">
            <v-icon>mdi-pencil-outline</v-icon>
          </v-btn>
        </template>
        <template v-slot:default="dialog">
		      <v-card flat class="">
		      	<br>
		      	<v-card-text class="d-flex justify-center pa-0 ma-0 text-h6">Name</v-card-text>
		      	<v-row class="pa-2 ma-0 justify-center align-center">
		        	<div :contenteditable="editName" class="contenteditable" ref="taskName">{{ text }}</div>
		        	<v-btn @click="editName=!editName" icon><v-icon>mdi-pencil-outline</v-icon></v-btn>
		        	<div style="width: calc(50% + 36px)">
		        		<v-progress-linear indeterminate color="primary" height="1" v-show="editName"></v-progress-linear>
		        	</div>
		        </v-row>
		        <v-card-text class="d-flex justify-center pa-0 ma-0 text-h6">Difficulty</v-card-text>
		        <v-card-actions class="justify-center">
			        <v-btn-toggle v-model="computedDifficulty" dense>
				        <v-btn><v-icon color="primary">mdi-knife-military</v-icon></v-btn>
				        <v-btn><v-icon color="success">mdi-axe-battle</v-icon></v-btn>
				        <v-btn><v-icon  color="warning">mdi-magic-staff</v-icon></v-btn>
				        <v-btn><v-icon color="error">mdi-mace</v-icon></v-btn>
				      </v-btn-toggle>
			      </v-card-actions>
			      <v-card-text class="d-flex justify-center pa-0 ma-0 text-h6">Frequency</v-card-text>
			      <v-card-actions class="justify-center">
			        <v-btn-toggle v-model="computedFrequency" dense multiple>
				        <v-btn> L </v-btn>
				        <v-btn> M </v-btn>
				        <v-btn> X </v-btn>
				        <v-btn> J </v-btn>
				        <v-btn> V </v-btn>
				        <v-btn> S </v-btn>
				        <v-btn> D </v-btn>
				      </v-btn-toggle>
			      </v-card-actions>
			      <br>
		        <v-card-actions class="justify-center">
		        	<v-spacer></v-spacer>
		        	<v-btn color="error" outlined @click="dialog.value = false;deleteTask()" medium>Delete</v-btn>
		        	<v-spacer></v-spacer>
		        	<v-btn color="success" outlined @click="dialog.value = false;editTask()" medium>Change</v-btn>
		        	<v-spacer></v-spacer>
		        </v-card-actions>
		      </v-card>
        </template>
      </v-dialog>
    </v-card>
  `,
  data() {
  	return {
  		editName: false,
  		computedText: this.text,
  		computedFrequency: this.frequency,
  		computedStart: this.start,
  		computedEnd: this.end,
  		computedDifficulty: this.difficulty,
  		computedCompleted: this.completed[0],
  		levelColor: getStreakColor(this.completed),
  		colors: [
  			'red',
				'deep-orange',
				'orange',
				'amber',
				'yellow',
				'lime',
				'green',
				'teal',
				'cyan',
				'light-blue',
  		]
  	}
  },
  methods: {
    deleteTask() {
		this.$emit('delete-task', this.taskIndex);
    },
    editTask() {
    	console.log('hey')
    	this.editName = false
    	try {
    		this.computedText = this.$refs.taskName.innerHTML
    	}
    	catch {
    		this.computedText = this.text
    	}
    	this.$emit('edit-task', {
    		'text': this.computedText, 
    		'taskIndex': this.taskIndex,
    		'frequency': this.computedFrequency,
    		'difficulty': this.computedDifficulty,
    		'created': this.created,
    		'start': this.computedStart,
    		'end': this.computedEnd,
    	});
    },
    changeState() {
    	this.$emit('complete-task', this.taskIndex);
    	this.levelColor = getStreakColor(this.completed)
    }
  }
};
Vue.component('task', TaskCard);
const ObjectiveCard = {
  props: ['text', 'objectiveIndex', 'difficulty', 'frequency'],
  template: `
    <v-card width="95%" outlined class="mt-1 d-flex">
      <v-card-text class="pa-2">{{ text }}</v-card-text>
      <v-btn icon @click="deleteObjective()"><v-icon>mdi-delete</v-icon></v-btn>
      <v-dialog width="400">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-pencil-outline</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>Objective</v-card-title>
        </v-card>
      </v-dialog>
    </v-card>
  `,
  methods: {
    deleteObjective() {
		this.$emit('delete-objective', this.objectiveIndex);
    }
  }
};
Vue.component('objective', ObjectiveCard);

//The app
const vuetifyApp = new Vuetify({
	theme: {
    	dark: user.theme,
  	}
})

const vueApp = new Vue({
	el: '#app',
	vuetify: vuetifyApp,
	data: {
		experience: user.experience,
		mana: user.mana,
		health: user.health,
		points: user.points,
		username: user.name,
		theme: user.theme,
		tasks: storedTasks,
		objectives: storedObjectives,
		treats: [],
		settings: false,
		newTask: '',
		newObjective: '',
		newReward: '',
		days: 0,
	},
	methods: {
		switchTheme: function switchTheme() {
			this.$vuetify.theme.dark = !this.$vuetify.theme.dark
			user.theme = this.theme
			localStorage.setItem('user', JSON.stringify(user))
		},
		createTask: function createTask() {
			var today = new Date();
			var task = new Task(this.newTask, today)
			this.tasks.push(task)
			this.newTask = ''
			localStorage.setItem('tasks', JSON.stringify(this.tasks))
		},
		deleteTask: function deleteTask(taskIndex) {
			this.tasks.splice(taskIndex, 1);
			localStorage.setItem('tasks', JSON.stringify(this.tasks))
		},
		editTask: function editTask(values) {
			console.log(JSON.stringify(this.tasks))
			const task = this.tasks[values.taskIndex]
			task.name = values.text
			task.difficulty = values.difficulty
			task.frequency = values.frequency
			task.start = values.start
			task.end = values.end
			localStorage.setItem('tasks', JSON.stringify(this.tasks))
			console.log(JSON.stringify(this.tasks))
		},
		completeTask: function completeTask(taskIndex) {
			console.log('hey')
			const task = this.tasks[taskIndex]
			task.completed[0] = !task.completed[0]
			localStorage.setItem('tasks', JSON.stringify(this.tasks))
		},
		deleteAllTasks: function deleteAllTasks() {
			this.tasks = []
			localStorage.setItem('tasks', JSON.stringify(this.tasks))
		},
		createObjective: function createObjective() {
			var objective = new Objective(this.newObjective)
			this.objectives.push(objective)
			this.newObjective = ''
			localStorage.setItem('objectives', JSON.stringify(this.objectives))
		},
		deleteObjective: function deleteObjective(objectiveIndex) {
			this.objectives.splice(objectiveIndex, 1);
			localStorage.setItem('objectives', JSON.stringify(this.objectives))
		},
		createReward: function createReward() {

		},
		deleteReward: function deleteReward() {

		},
		updateDays: function updateDays() {
			var today = new Date();
			this.days = dateDiffInDays(today, user.created)
		}
	},
	created() {
		var today = new Date();
		this.days = dateDiffInDays(today, user.created)

		setInterval(this.updateDays, 3000);
	}
})
