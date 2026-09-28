import { BranchCode, StudyPlanConfig, TimetableTask } from '../types';
import { INITIAL_SYLLABUS_MAP } from '../data/branchesData';

export function generatePersonalizedTimetable(config: StudyPlanConfig): TimetableTask[] {
  const branchSyllabus = INITIAL_SYLLABUS_MAP[config.branchCode] || INITIAL_SYLLABUS_MAP.CS;
  const subjects = [...branchSyllabus.subjects];

  // Sort subjects based on weightage, or prioritize user preference if provided
  if (config.preferredSubjectsFirst && config.preferredSubjectsFirst.length > 0) {
    subjects.sort((a, b) => {
      const aPreferred = config.preferredSubjectsFirst?.includes(a.id);
      const bPreferred = config.preferredSubjectsFirst?.includes(b.id);
      if (aPreferred && !bPreferred) return -1;
      if (!aPreferred && bPreferred) return 1;
      return b.weightagePercentage - a.weightagePercentage;
    });
  } else {
    subjects.sort((a, b) => b.weightagePercentage - a.weightagePercentage);
  }

  // Flatten all subtopics with subject reference
  interface TaskUnit {
    subjectId: string;
    subjectName: string;
    topicId: string;
    topicName: string;
    type: 'Theory & Concept' | 'Practice PYQ' | 'Revision & Notes' | 'Mock Test' | 'Doubt Solving';
    hours: number;
  }

  const taskQueue: TaskUnit[] = [];

  subjects.forEach(subject => {
    // 1. General theory + practice for each subtopic
    subject.subtopics.forEach(sub => {
      taskQueue.push({
        subjectId: subject.id,
        subjectName: subject.name,
        topicId: sub.id,
        topicName: sub.title,
        type: 'Theory & Concept',
        hours: config.prepLevel === 'Beginner' ? 3 : 2,
      });

      taskQueue.push({
        subjectId: subject.id,
        subjectName: subject.name,
        topicId: sub.id,
        topicName: `PYQs & Exercises: ${sub.title.split(':')[0]}`,
        type: 'Practice PYQ',
        hours: 2,
      });
    });

    // 2. Add Subject Revision & Formula Consolidation
    taskQueue.push({
      subjectId: subject.id,
      subjectName: subject.name,
      topicId: `${subject.id}-rev`,
      topicName: `Comprehensive Revision & Short Notes: ${subject.name}`,
      type: 'Revision & Notes',
      hours: 3,
    });

    // 3. Subject-level Sectional Mock Test
    taskQueue.push({
      subjectId: subject.id,
      subjectName: subject.name,
      topicId: `${subject.id}-test`,
      topicName: `Sectional Test & Mistake Analysis: ${subject.name}`,
      type: 'Mock Test',
      hours: 2,
    });
  });

  // Calculate start date (tomorrow or today)
  const today = new Date();
  const tasks: TimetableTask[] = [];

  let currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let queueIndex = 0;
  // Generate a robust schedule for up to 90 days or until queue completes
  const totalDays = 90;

  for (let dayOffset = 0; dayOffset < totalDays && queueIndex < taskQueue.length; dayOffset++) {
    const taskDate = new Date(currentDate);
    taskDate.setDate(currentDate.getDate() + dayOffset);

    const dayName = daysOfWeek[taskDate.getDay()];
    const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
    const dayTargetHours = isWeekend ? config.weekendHours : config.dailyHours;

    let dayAllocatedHours = 0;

    // Sunday special: weekly revision & mock review
    if (dayName === 'Sunday' && queueIndex > 4) {
      tasks.push({
        id: `task-${taskDate.toISOString().slice(0, 10)}-sun-rev`,
        date: taskDate.toISOString().slice(0, 10),
        dayOfWeek: dayName,
        subjectId: 'general-rev',
        subjectName: 'Weekly Revision & Full Mock',
        topicId: `mock-weekly-${dayOffset}`,
        topicName: '3-Hour GATE Speed Mock & Detailed Error Analysis',
        type: 'Mock Test',
        durationHours: 3,
        completed: false,
        notes: 'Simulate CBT environment using Virtual Calculator. Record silly errors in mistake book.',
      });
      dayAllocatedHours += 3;

      if (dayTargetHours > 3) {
        tasks.push({
          id: `task-${taskDate.toISOString().slice(0, 10)}-sun-formulas`,
          date: taskDate.toISOString().slice(0, 10),
          dayOfWeek: dayName,
          subjectId: 'formulas',
          subjectName: 'Formulas & Short Notes',
          topicId: `formula-rev-${dayOffset}`,
          topicName: 'Weekly Formula Book Recall & General Aptitude Brush-up',
          type: 'Revision & Notes',
          durationHours: Math.min(dayTargetHours - 3, 3),
          completed: false,
        });
      }
      continue;
    }

    // Allocate tasks for the day according to target hours
    while (queueIndex < taskQueue.length && dayAllocatedHours < dayTargetHours) {
      const currentUnit = taskQueue[queueIndex];
      const hoursToAssign = Math.min(currentUnit.hours, dayTargetHours - dayAllocatedHours);

      tasks.push({
        id: `task-${taskDate.toISOString().slice(0, 10)}-${queueIndex}`,
        date: taskDate.toISOString().slice(0, 10),
        dayOfWeek: dayName,
        subjectId: currentUnit.subjectId,
        subjectName: currentUnit.subjectName,
        topicId: currentUnit.topicId,
        topicName: currentUnit.topicName,
        type: currentUnit.type,
        durationHours: hoursToAssign > 0 ? hoursToAssign : 1,
        completed: false,
        notes: `Target: Complete core theory and at least 15 GATE PYQs.`,
      });

      dayAllocatedHours += hoursToAssign;
      queueIndex++;
    }
  }

  return tasks;
}

export function rebalanceMissedTasks(tasks: TimetableTask[]): TimetableTask[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  const updatedTasks = [...tasks];

  // Find tasks that were scheduled prior to today and NOT completed
  const missedTasks = updatedTasks.filter(t => t.date < todayStr && !t.completed);

  if (missedTasks.length === 0) return updatedTasks;

  // Mark them as missed
  missedTasks.forEach(t => {
    t.isMissed = true;
  });

  // Re-schedule missed tasks to upcoming available dates starting from tomorrow
  let futureIndex = 0;
  const futureDates: string[] = [];
  const curr = new Date();

  for (let i = 1; i <= 30; i++) {
    const nextD = new Date(curr);
    nextD.setDate(curr.getDate() + i);
    futureDates.push(nextD.toISOString().slice(0, 10));
  }

  missedTasks.forEach(missed => {
    const targetDate = futureDates[futureIndex % futureDates.length];
    futureIndex++;

    // Add a reschedule item
    updatedTasks.push({
      id: `rebal-${missed.id}-${Date.now().toString().slice(-4)}`,
      date: targetDate,
      dayOfWeek: new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long' }),
      subjectId: missed.subjectId,
      subjectName: missed.subjectName,
      topicId: missed.topicId,
      topicName: `[Catch-up] ${missed.topicName}`,
      type: missed.type,
      durationHours: missed.durationHours,
      completed: false,
      notes: 'Rescheduled from missed study session. High priority.',
    });
  });

  return updatedTasks;
}
