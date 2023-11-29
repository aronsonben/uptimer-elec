import * as React from 'react';
import { useState, useEffect } from 'react';
import { useStopwatch } from 'react-timer-hook';
import './Uptimer.css';

export function LogItem(
  { task, header, handleEdit, editMode, editTarget, 
      goalText, noteText, handleGoal, handleNote }) {
  return (
    <li className={header ? "logItem logHeader" : "logItem"}>
      <span className="logTime">{task.time}</span>
      { editMode && (editTarget == task.id) ? (
        <input 
          className="logTime" 
          value={goalText} 
          onChange={(e) => handleGoal(e)}/>
        ) : 
        (<span className="logGoal">{task.goal}</span>)
      }
      { editMode && (editTarget == task.id) ? (
        <input 
          className="logTime" 
          value={noteText} 
          onChange={(e) => handleNote(e)} />
        ) : 
        (<span className="logNote">{task.note}</span>)
      }
      {!header ? (
        <span className="logEdit">
          <button 
            type="button" 
            className="goalButtons" 
            onClick={() => handleEdit(task)} >
              {!editMode ? 'edit' : 'save'}
          </button>
        </span>
      ) : ''}
    </li>
  )
}

export default function Uptimer() {
  const [goalInput, setGoal] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(-1);
  const [goalEditTxt, setGoalEditTxt] = useState('');
  const [noteEditTxt, setNoteEditTxt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logData, setLogData] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [fetchIfTrue, setFetch] = useState(false);
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });
  
  // Fetch log data on mount
  useEffect(() => {
    console.log('on mount');
    async function startFetching() {
      const data = await window.electronAPI.readLogData();
      const logData = JSON.parse(data)
      const logArray = logData.taskLog;
      setLogData(logArray);
      setNextIndex(logData.taskLog.length+1);
    }
    startFetching();
  }, []);

  // Fetch log data on update 
  useEffect(() => {
    console.log('on update');

    async function startFetching() {
      const data = await window.electronAPI.readLogData();
      const logArray = JSON.parse(data).taskLog;
      setLogData(logArray);
    }
    
    if (fetchIfTrue) {
      startFetching();
    }

    return () => {
      setFetch(false);
    }
  }, [fetchIfTrue]);

  // === State Handlers === \\//

  function handleGoalChange(e) {
    setGoal(e.target.value);
  }

  function handleGoalEdit(e) {
    setGoalEditTxt(e.target.value);
  }
  
  function handleNoteEdit(e) {
    setNoteEditTxt(e.target.value);
  }

  // === State Handlers === //\\

  // Clear the entire log data of all tasks. 
  const handleClearLog = async () => {
    try {
      const clearedLogData = await window.electronAPI.clearLogData();
      setLogData(clearedLogData.taskLog);
    } catch(error) {
      console.log('an error occurred');
    }
  }

  // Edit the contents of a single task in the log
  const handleEditLog = async (task) => {
    console.log('editing log with id: ' + task.id);

    if(editMode) {
      // when turning off editMode (aka saving edits)...
      setEditMode(false);

      // fetch log file
      let logData = await window.electronAPI.readLogData();
      let taskLog = JSON.parse(logData).taskLog;
      console.log(taskLog);

      // find specific task to be edited
      //   -- this is not efficient!
      let editTask = '';
      taskLog.forEach(element => {
        if(element.id == task.id) {
          editTask = element;
          return;
        }
      });
      console.log(editTask);

      // edit specified task
      editTask.goal = goalEditTxt;
      editTask.note = noteEditTxt;
      console.log(editTask);

      // save task
      console.log(taskLog);
      const saveReply = await window.electronAPI.saveData(editTask, true);

      // update current state of taskLog
      //   -- might want to do this via hook
      setLogData(taskLog);
    } else {
      setEditMode(true);
      setEditTarget(task.id);
      setGoalEditTxt(task.goal);
      setNoteEditTxt(task.note);
    } 
  }

  // Start a new task
  function handleStart(e) {
    reset();
    e.preventDefault();
    if (!goalInput) {
      console.log('You must enter a task goal.');
      setIsSubmitting(true);
      return null;
    }
    start();
  }

  // Stop timing the current task
  const handleStop = async (e) => {
    e.preventDefault();
    pause();

    // save new task to log data file
    const totalTime = `${hours}:${minutes}:${seconds}`;
    const newLog = 
      {'id': nextIndex, 'time': totalTime, 'goal': goalInput, 'note': 'testing'};
    const saveReply = await window.electronAPI.saveData(newLog);

    // tell app to fetch new data
    setFetch(true);

    // reset rendered data
    setNextIndex(nextIndex+1);
    setGoal('');
    setIsSubmitting(false);
    pause();
  }

  return (
    <div className="Uptimer">
      <div className="titleZone">
        <h2 id="mainHdr">Uptimer</h2>
      </div>
      <div className="goalZone">
        <h3>Set Goal:</h3>
        <form action={(e) => handleStart(e)}>
          <input
            placeholder="Task Goal"
            type="text"
            className="taskGoal"
            value={goalInput}
            onChange={handleGoalChange}
          />
          <div className="goalButtons">
            <button id="start-button" onClick={isRunning ? 
              (e) => handleStop(e) : 
              (e) => handleStart(e)} >
              {isRunning ? "Stop" : "Go!" }
            </button>
          </div>
        </form>
        { !goalInput && isSubmitting ? 
            (<span className="goalInputErrorMsg">
              You should specify what the goal for your task is. <br />
              For now, the task will be logged as undefined.
            </span>)
            :
            ''}
      </div>
      <div className="timerZone">
        <span id="timerTitle">Task Timer</span>
        <div style={{ fontSize: '35px' }}>
          <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
        </div>
      </div>
      <div id="logzone">
        <div className="logHeadZone">
          <h2>Task Log</h2>
          <div className="clearBtnDiv goalButtons">
            <button type="button" id="clearBtn" onClick={handleClearLog}>Clear Log</button>
          </div>
        </div>
        <LogItem
          task={{'id': 'header', 'time': 'Time', 'goal': 'Goal', 'note': 'Note'}} 
          header={true}
        />
        <ul className="logList">
          {logData.map((task) => (
            <LogItem key={task.id} 
              task={task} 
              handleEdit={handleEditLog} 
              editMode={editMode}
              editTarget={editTarget}
              goalText={goalEditTxt}
              noteText={noteEditTxt}
              handleGoal={handleGoalEdit}
              handleNote={handleNoteEdit}
                />
          ))}
        </ul>
      </div>
    </div>
  )
}