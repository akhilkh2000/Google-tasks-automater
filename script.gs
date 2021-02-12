function myFunction() {
	//this is the entry function where the google script starts running
	// Check's Today  task list for tasks and updates them to current day
	addDateToToday();
	// listTaskLists(); // Use to log task lists and IDs
}
function convertTZ(date, tzString) {
	//convert time to timezone as google script uses european time not indian
	return new Date(
		(typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
			timeZone: tzString,
		})
	);
}

// Checks whether a task is overdue, returns true or false
function isOverdue(task) {
	if (!task.due) return false;

	var today = new Date(new Date().setHours(0, 0, 0, 0));
	var taskDueDate = new Date(
		new Date(parseDate_RFC3339(task.due)).setHours(0, 0, 0, 0)
	);
	return taskDueDate < today;
}

// parse function to return task.due string to a proper date object (with correct day!)
function parseDate_RFC3339(string) {
	var refStr = new Date().toString();
	var tzOffset = Number(refStr.substr(refStr.indexOf("GMT") + 4, 2));
	var parts = string.split("T");
	parts[0] = parts[0].replace(/-/g, "/");
	var t = parts[1].split(":");
	return new Date(new Date(parts[0]).setHours(+t[0] + tzOffset, +t[1], 0));
}

function addDateToToday() {
	var taskLists = Tasks.Tasklists.list();
	if (taskLists.items) {
		for (var i = 0; i < taskLists.items.length; i++) {
			var taskList = taskLists.items[i];
			if (taskList.title == "Today") {
				Logger.log("Checking List: %s", taskList.title);

				addDateToTasks(getTasks(taskList), taskList.id);
			}
		}
	} else {
		Logger.log("No task lists found.");
	}
}

// Returns all tasks in a given list
function getTasks(taskList) {
	return Tasks.Tasks.list(taskList.id);
}

// Check's if current time is the range of google's notification time to avoid notifications stacking up for tasks
function checkIfTimeInRange() {
	var startTime = "08:59:00";
	var endTime = "9:01:00";

	currentDate = new Date();
	currentDate = convertTZ(currentDate, "Asia/Calcutta");

	startDate = new Date(currentDate.getTime());
	startDate.setHours(startTime.split(":")[0]);
	startDate.setMinutes(startTime.split(":")[1]);
	startDate.setSeconds(startTime.split(":")[2]);

	endDate = new Date(currentDate.getTime());
	endDate.setHours(endTime.split(":")[0]);
	endDate.setMinutes(endTime.split(":")[1]);
	endDate.setSeconds(endTime.split(":")[2]);

	return startDate < currentDate && endDate > currentDate;
}
function addDateToTasks(taskList, taskListID) {
	if (taskList.items) {
		//if tasks exist
		for (var i = 0; i < taskList.items.length; i++) {
			var task = taskList.items[i]; //get each task
			const removeDate = checkIfTimeInRange();

			// Logger.log(currentDate +"hellp" + valid);
			// Logger.log(startDate);
			// Logger.log(endDate);

			if (removeDate) {
				//remove date from every task for time being
				var newTask = {
					due: null,
				};
				Tasks.Tasks.patch(newTask, taskListID, task.id);
			} else {
				if (!task.due || isOverdue(task)) {
					Logger.log("found some tasks without date or overdue!");
					var now = new Date();
					//today is the deadline
					var deadline = new Date(
						Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
					);
					var newTask = {
						due: Utilities.formatDate(
							deadline,
							"GMT",
							"yyyy-MM-dd'T'HH:mm:ss'Z'"
						),
					};
					// partial update so we use patch()
					Tasks.Tasks.patch(newTask, taskListID, task.id);
				}
			}
		}
	} else {
		Logger.log("No tasks found.");
	}
}

//STRAY FUNCTIONS FOR LATER

// function showTasksToday(){
//   var taskLists = Tasks.Tasklists.list();
//    if (taskLists.items) {
//     for (var i = 0; i < taskLists.items.length; i++) {
//       var taskList = taskLists.items[i];
//       if(taskList.title == 'Today'){
//          Logger.log('Checking List: %s', taskList.title);

//         var tasks = getTasks(taskList);
//         Logger.log(tasks);
//       }

//     }
//   }

// }
// function showEvents(){
//   // Determines how many events are happening today.
// var today = new Date();
// var events = CalendarApp.getDefaultCalendar().getEventsForDay(today);
// Logger.log('Number of events: ' + events);
// for(var i = 0; i<events.length;i++){
//   Logger.log(events[i].getDescription());
// }

// }

// // Logs all task lists
// function listTaskLists() {
//   var taskLists = Tasks.Tasklists.list();
//   if (taskLists.items) {
//     for (var i = 0; i < taskLists.items.length; i++) {
//       var taskList = taskLists.items[i];
//       Logger.log('Task list with title "%s" and ID "%s" was found.',
//                  taskList.title, taskList.id);
//     }
//   } else {
//     Logger.log('No task lists found.');
//   }
// }

// var builder = ScriptApp.newTrigger("myFunction").forUserCalendar("akhilkhubchandani@gmail.com").onEventUpdated()
// builder.create()
//  var triggers = ScriptApp.getProjectTriggers();
//  for (var i = 0; i < triggers.length; i++) {
//    ScriptApp.deleteTrigger(triggers[i]);
//  }
