import * as React from 'react';
import { useState, useEffect } from 'react';
import { useStopwatch } from 'react-timer-hook';
import './Uptimer.css';

export function LogItem({ task, header }) {
  return (
    <li key={task.id} className={header ? "logItem logHeader" : "logItem"}>
      <span className="logTime">{task.time}</span>
      <span className="logGoal">{task.goal}</span>
      <span className="logNote">{task.note}</span>
    </li>
  )
}

export default function Uptimer() {
  const [goalInput, setGoal] = useState('');
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

  // Fetch log data from main process
  const handleClick = async () => {
    const data = await window.electronAPI.readLogData()
    const dataLog = JSON.parse(data);
    const logArray = dataLog.taskLog;
    console.log(logArray);
    setLogData(logArray);
  }

  const handlePrintData = async () => {
    logData.forEach((task) => {
      console.log(task);
    });
  }

  function handleGoalChange(e) {
    setGoal(e.target.value);
  }

  function handleStart() {
    start();
    console.log(goalInput);
  }

  const handleStop = async () => {
    pause();

    console.log(logData);

    // save new task to log data file
    const totalTime = `${hours}hrs ${minutes}mins ${seconds}sec`;
    const newLog = 
      {'id': nextIndex, 'time': totalTime, 'goal': goalInput, 'note': 'testing'};
    const saveReply = await window.electronAPI.saveData(newLog);

    // tell app to fetch new data
    setFetch(true);

    // reset rendered data
    setNextIndex(nextIndex+1);
    setGoal('');
  }

  return (
    <div className="Uptimer">
      <div className="titleZone">
        <h2>Uptimer</h2>
        <span><i>A small app for Forms & Foundations</i></span>
        <br/><span>• • •</span><br/>
      </div>
      <div className="goalZone">
        <h3>Set Goal:</h3>
        <input
          placeholder="Task Goal"
          type="text"
          className="taskGoal"
          value={goalInput}
          onChange={handleGoalChange}
        />
        <div className="goalButtons">
          <button id="start-button" onClick={handleStart}>Go!</button>
          <button type="button" onClick={isRunning ? handleStop : null} 
            id={isRunning ? "regBtn" : "grayBtn"}>
              Stop
          </button>
        </div>
      </div>
      <div className="timerZone">
        <div style={{ fontSize: '35px' }}>
          <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
        </div>
      </div>
      <div id="logzone">
        <h3>Task Log</h3>
        <LogItem 
          task={{'id': 'header', 'time': 'Time', 'goal': 'Goal', 'note': 'Note'}} 
          header={true}
        />
        <ul>
          {logData.map((task) => (
            <LogItem task={task} />
          ))}
        </ul>
      </div>
    </div>
  )
}