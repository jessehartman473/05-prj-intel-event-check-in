const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCountDisplay = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const teamStats = document.querySelector(".team-stats");
const maximumAttendees = 50;
const storageKey = "intelSummitCheckInData";
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};
const teamColors = {
  water: "#e8f7fc",
  zero: "#ecfdf3",
  power: "#fff7ed",
};
const teamCountDisplays = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};
const greetingMessages = [
  "Welcome",
  "Great to have you",
  "Thanks for joining us",
];

let attendees = [];
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};

const attendeeListSection = document.createElement("div");
attendeeListSection.style.marginTop = "30px";
attendeeListSection.style.textAlign = "left";

const attendeeListHeading = document.createElement("h3");
attendeeListHeading.textContent = "Checked-in Attendees (0)";
attendeeListHeading.style.color = "#64748b";
attendeeListHeading.style.fontSize = "16px";
attendeeListHeading.style.marginBottom = "12px";

const attendeeList = document.createElement("ul");
attendeeList.style.listStyle = "none";
attendeeList.style.padding = "0";
attendeeList.style.margin = "0";

attendeeListSection.appendChild(attendeeListHeading);
attendeeListSection.appendChild(attendeeList);
teamStats.appendChild(attendeeListSection);

function showMessage(message) {
  greeting.textContent = message;
  greeting.classList.add("success-message");
  greeting.style.display = "block";
}

function showGoalCelebration(counts) {
  const highestCount = Math.max(counts.water, counts.zero, counts.power);
  const winningTeams = [];

  if (counts.water === highestCount) {
    winningTeams.push(teamNames.water);
  }
  if (counts.zero === highestCount) {
    winningTeams.push(teamNames.zero);
  }
  if (counts.power === highestCount) {
    winningTeams.push(teamNames.power);
  }

  greeting.textContent = "";
  greeting.appendChild(document.createTextNode("🎉 Attendance goal reached! "));

  for (let index = 0; index < winningTeams.length; index += 1) {
    if (index > 0) {
      const separator =
        index === winningTeams.length - 1 ? " and " : ", ";
      greeting.appendChild(document.createTextNode(separator));
    }

    const teamName = document.createElement("strong");
    teamName.textContent = winningTeams[index];
    teamName.style.color = "#0071c5";
    greeting.appendChild(teamName);
  }

  greeting.appendChild(
    document.createTextNode(
      ` ${winningTeams.length > 1 ? "are tied for the lead" : "is the winning team"} with ${highestCount} attendees!`
    )
  );
  greeting.classList.add("success-message");
  greeting.style.display = "block";
}

function updateAttendanceDisplay() {
  attendeeCountDisplay.textContent = attendees.length;
  progressBar.style.width = `${(attendees.length / maximumAttendees) * 100}%`;

  teamCountDisplays.water.textContent = teamCounts.water;
  teamCountDisplays.zero.textContent = teamCounts.zero;
  teamCountDisplays.power.textContent = teamCounts.power;

  attendeeListHeading.textContent = `Checked-in Attendees (${attendees.length})`;
  attendeeList.textContent = "";

  for (let index = 0; index < attendees.length; index += 1) {
    const attendee = attendees[index];
    const attendeeItem = document.createElement("li");
    const attendeeName = document.createElement("span");
    const attendeeTeam = document.createElement("span");

    attendeeItem.style.display = "flex";
    attendeeItem.style.justifyContent = "space-between";
    attendeeItem.style.alignItems = "center";
    attendeeItem.style.gap = "12px";
    attendeeItem.style.padding = "12px 14px";
    attendeeItem.style.borderBottom = "1px solid #f1f5f9";

    attendeeName.textContent = attendee.name;
    attendeeName.style.color = "#334155";
    attendeeName.style.fontWeight = "600";

    attendeeTeam.textContent = teamNames[attendee.team];
    attendeeTeam.style.backgroundColor = teamColors[attendee.team];
    attendeeTeam.style.borderRadius = "12px";
    attendeeTeam.style.color = "#475569";
    attendeeTeam.style.fontSize = "14px";
    attendeeTeam.style.padding = "4px 10px";

    attendeeItem.appendChild(attendeeName);
    attendeeItem.appendChild(attendeeTeam);
    attendeeList.appendChild(attendeeItem);
  }
}

function isValidSavedData(savedData) {
  if (
    !savedData ||
    !Array.isArray(savedData.attendees) ||
    !savedData.teamCounts ||
    savedData.totalCount !== savedData.attendees.length ||
    savedData.attendees.length > maximumAttendees
  ) {
    return false;
  }

  const verifiedCounts = {
    water: 0,
    zero: 0,
    power: 0,
  };

  for (let index = 0; index < savedData.attendees.length; index += 1) {
    const attendee = savedData.attendees[index];

    if (
      !attendee ||
      typeof attendee.name !== "string" ||
      attendee.name.trim() === "" ||
      !teamNames[attendee.team]
    ) {
      return false;
    }

    verifiedCounts[attendee.team] += 1;
  }

  return (
    savedData.teamCounts.water === verifiedCounts.water &&
    savedData.teamCounts.zero === verifiedCounts.zero &&
    savedData.teamCounts.power === verifiedCounts.power
  );
}

function saveAttendanceData(updatedAttendees, updatedTeamCounts) {
  const attendanceData = {
    totalCount: updatedAttendees.length,
    teamCounts: updatedTeamCounts,
    attendees: updatedAttendees,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(attendanceData));
    return true;
  } catch (error) {
    showMessage(
      "Unable to save this check-in in your browser. Please check your browser storage settings and try again."
    );
    return false;
  }
}

function loadAttendanceData() {
  let savedDataText;

  try {
    savedDataText = localStorage.getItem(storageKey);
  } catch (error) {
    showMessage(
      "Saved attendance data could not be accessed in this browser. Check your browser storage settings."
    );
    return;
  }

  if (!savedDataText) {
    return;
  }

  let savedData;

  try {
    savedData = JSON.parse(savedDataText);
  } catch (error) {
    showMessage(
      "Saved attendance data is unreadable. The stored check-ins were not loaded."
    );
    return;
  }

  if (!isValidSavedData(savedData)) {
    showMessage(
      "Saved attendance data is invalid. The stored check-ins were not loaded."
    );
    return;
  }

  attendees = savedData.attendees;
  teamCounts = savedData.teamCounts;
}

loadAttendanceData();
updateAttendanceDisplay();

if (attendees.length >= maximumAttendees) {
  showGoalCelebration(teamCounts);
}

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const attendeeName = attendeeNameInput.value.trim();
  const teamValue = teamSelect.value;
  const teamName = teamSelect.options[teamSelect.selectedIndex].text;

  if (attendeeName === "") {
    showMessage("Please enter the attendee's name before checking in.");
    return;
  }

  if (!teamNames[teamValue]) {
    showMessage("Please select a team before checking in.");
    return;
  }

  if (attendees.length >= maximumAttendees) {
    showMessage(`Check-in is full. We have reached ${maximumAttendees} attendees.`);
    return;
  }

  const updatedAttendees = attendees.concat({
    name: attendeeName,
    team: teamValue,
  });
  const updatedTeamCounts = {
    water: teamCounts.water,
    zero: teamCounts.zero,
    power: teamCounts.power,
  };

  updatedTeamCounts[teamValue] += 1;

  if (!saveAttendanceData(updatedAttendees, updatedTeamCounts)) {
    return;
  }

  attendees = updatedAttendees;
  teamCounts = updatedTeamCounts;
  updateAttendanceDisplay();

  if (attendees.length === maximumAttendees) {
    showGoalCelebration(teamCounts);
  } else {
    const messageIndex = (attendees.length - 1) % greetingMessages.length;
    showMessage(
      `${greetingMessages[messageIndex]}, ${attendeeName}! Welcome to ${teamName}.`
    );
  }

  checkInForm.reset();
  attendeeNameInput.focus();
});
