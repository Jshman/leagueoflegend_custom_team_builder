// main.js
const totalLanes = ["Top", "Jungle", "Mid", "ADC", "Support"];
const tiers = [
  "I 4", "I 3", "I 2", "I 1", "B 4", "B 3", "B 2", "B 1",
  "S 4", "S 3", "S 2", "S 1", "G 4", "G 3", "G 2", "G 1",
  "P 4", "P 3", "P 2", "P 1", "E 4", "E 3", "E 2", "E 1",
  "D 4", "D 3", "D 2", "D 1", "M 0", "GM 0", "C 0"
];

const mmrMap = {
  I: 0, B: 500, S: 900, G: 1300, P: 1700,
  E: 2100, D: 2500, M: 2900, GM: 3000, C: 3100
};

const subTierOffset = { "4": 0, "3": 100, "2": 200, "1": 300, "0": 0 };

const tbody = document.querySelector("#player-table tbody");


for (let i = 0; i < 10; i++) {
  const tr = document.createElement("tr");
  ["name", "tier", "main", "sub"].forEach((type) => {
    const td = document.createElement("td");
    if (type === "tier") {
      const wrapper = document.createElement("div");
      wrapper.className = "dropdown-control";
      const select = document.createElement("select");
      tiers.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        opt.className = `tier-${t.split(" ")[0]}`;
        select.appendChild(opt);
      });
      const up = document.createElement("button");
      up.textContent = "▲";
      const down = document.createElement("button");
      down.textContent = "▼";
      up.onclick = () => shiftSelect(select, -1);
      down.onclick = () => shiftSelect(select, 1);
      wrapper.appendChild(select);
      wrapper.appendChild(up);
      wrapper.appendChild(down);
      td.appendChild(wrapper);
    } else if (type === "main" || type === "sub") {
      const wrapper = document.createElement("div");
      wrapper.className = "dropdown-control";
      const select = document.createElement("select");
      if (type === "sub") {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "-";
        select.appendChild(opt);
      }
      totalLanes.forEach((lane) => {
        const opt = document.createElement("option");
        opt.value = lane;
        opt.textContent = lane;
        select.appendChild(opt);
      });
      const up = document.createElement("button");
      up.textContent = "▲";
      const down = document.createElement("button");
      down.textContent = "▼";
      up.onclick = () => shiftSelect(select, -1);
      down.onclick = () => shiftSelect(select, 1);
      wrapper.appendChild(select);
      wrapper.appendChild(up);
      wrapper.appendChild(down);
      td.appendChild(wrapper);
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.style.width = "70%";

        // Tab 키로 다음 이름 input 이동
      input.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
            e.preventDefault();
            const allNames = document.querySelectorAll("#player-table input[type='text']");
            const currentIndex = [...allNames].indexOf(e.target);
            if (currentIndex >= 0 && currentIndex < allNames.length - 1) {
                allNames[currentIndex + 1].focus();
            }
            }
      });

      td.appendChild(input);
    }
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
}



function shiftSelect(select, direction) {
  const len = select.options.length;
  const next = (select.selectedIndex + direction + len) % len;
  select.selectedIndex = next;
}

function getMMR(tier) {
  const [t, s] = tier.split(" ");
  return (mmrMap[t] || 0) + (subTierOffset[s] || 0);
}

function getAvgTier(mmr) {
  const map = [
    [0, 500, "Iron"], [500, 900, "Bronze"], [900, 1300, "Silver"],
    [1300, 1700, "Gold"], [1700, 2100, "Platinum"], [2100, 2500, "Emerald"],
    [2500, 2900, "Diamond"], [2900, 3000, "Master"],
    [3000, 3100, "Grandmaster"], [3100, Infinity, "Challenger"]
  ];
  for (let [min, max, name] of map) {
    if (mmr >= min && mmr < max) return name;
  }
  return "Unknown";
}

document.getElementById("build-button").addEventListener("click", () => {
  const players = [];
  document.querySelectorAll("#player-table tbody tr").forEach((tr) => {
    const [name, tier, main, sub] = [...tr.querySelectorAll("td")].map(
      (td) => td.querySelector("select")?.value || td.querySelector("input")?.value.trim()
    );
    if (name && tier && main) {
      players.push({ name, tier, main, sub });
    }
  });

  if (players.length !== 10) {
    alert("10명 모두 입력해주세요!");
    return;
  }

  const result = assignPlayers(players);
  renderTeam(result.team1, 1);
  renderTeam(result.team2, 2);
});

function assignPlayers(players) {
  const all = [...players];
  const team1 = {}, team2 = {};
  const assigned = new Set();

  for (let team of [team1, team2]) {
    for (let lane of totalLanes) {
      let found = all.find(p => !assigned.has(p.name) && (p.main === lane));
      if (!found) found = all.find(p => !assigned.has(p.name) && (p.sub === lane));
      if (!found) found = all.find(p => !assigned.has(p.name));
      if (found) {
        team[lane] = found;
        assigned.add(found.name);
      }
    }
  }

  return { team1, team2 };
}

function renderTeam(team, teamNum) {
  const container = document.getElementById(`team${teamNum}-positions`);
  const mmrBox = document.getElementById(`team${teamNum}-mmr`);
  container.innerHTML = "";
  let totalMMR = 0;

  totalLanes.forEach((pos) => {
    const box = document.createElement("div");
    box.className = "position-box";

    const label = document.createElement("h4");
    label.textContent = pos;
    box.appendChild(label);

    const player = team[pos];
    if (player) {
      const mmr = getMMR(player.tier);
      totalMMR += mmr;

      const card = document.createElement("div");
      const tierKey = player.tier.split(" ")[0];
      card.className = `player-card tier-${tierKey}`;
      card.textContent = `${player.name} (${player.tier}, ${player.main})`;
      box.appendChild(card);
    }

    container.appendChild(box);
    Sortable.create(box, {
      group: "shared",
      animation: 150,
      filter: "h4",
      onEnd: () => updateMMR(teamNum)
    });
  });

  mmrBox.textContent = `평균 MMR: ${totalMMR / 5} (${getAvgTier(totalMMR / 5)})`;
}

function updateMMR(teamNum) {
  const mmrBox = document.getElementById(`team${teamNum}-mmr`);
  const cards = document.querySelectorAll(`#team${teamNum}-positions .player-card`);
  let total = 0;
  cards.forEach(card => {
    const tierText = card.textContent.split("(")[1]?.split(",")[0]?.trim();
    if (tierText) total += getMMR(tierText);
  });
  const avg = total / 5;
  mmrBox.textContent = `평균 MMR: ${avg.toFixed(0)} (${getAvgTier(avg)})`;
}
