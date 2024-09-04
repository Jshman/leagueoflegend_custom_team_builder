import MMR
import random
from collections import defaultdict

def build_team():
    # 포지션을 담을 리스트
    positions = defaultdict(list)
    for lane in total_lane:
        positions[lane]

    # 포지션 리스트 채우기
    for player in players:
        name, tier, primary_pos, *secondary_pos = player
        mmr = MMR.tier_to_mmr(tier)
        positions[primary_pos].append((name, mmr, primary_pos))
        for pos in secondary_pos:
            positions[pos].append((name, mmr, pos))

    tmp_positions = sorted([(lane, len(positions[lane])) for lane in total_lane], key=lambda x: x[1])
    # >> 포지션 별로 몰리는 라인도 생기고, 그렇지 않은 라인도 있을 것이다
    # 인원이 적은 라인에서 먼저 배정을 해주자.

    tm1, tm2 = {}, {}
    assigned_players = set()

    for pos, n in tmp_positions:
        random.shuffle(positions[pos])

        for i in range(min(2, len(positions[pos]))):
            player = positions[pos].pop()  # player = (name, mmr, position)
            if player[0] in assigned_players:
                continue
            # Todo: random하게 팀 배정해야 됨. 순서대로가 아니라.
            if len(tm1) <= len(tm2):
                tm1[pos] = (player[0], player[1])
            else:
                tm2[pos] = (player[0], player[1])

            assigned_players.add(player[0]) # 팀 배정을 받은 유저로 추가

    # 배정을 받지 못한 플레이어들 처리
    remaining_players = []
    for pos in total_lane:
        for player in positions[pos]:
            if player[0] not in assigned_players:
                remaining_players.append(player)

    random.shuffle(remaining_players)

    # 빈 자리에 남은 플레이어 배정
    for pos in total_lane:
        if pos not in tm1 and remaining_players:
            p = remaining_players.pop()
            tm1[pos] = (p[0], p[1])
        if pos not in tm2 and remaining_players:
            p = remaining_players.pop()
            tm2[pos] = (p[0], p[1])

    print_team(tm1, tm2)

def calculate_team_mmr(team):
    mmr = 0
    for i in range(5):
        mmr += team[total_lane[i]][1]
    return mmr


def print_team(p, b):
    purple_mmr = calculate_team_mmr(p)
    blue_mmr = calculate_team_mmr(b)

    print(f"\tpurple\tblue\n"
          f"team mmr:\t{purple_mmr}\t{blue_mmr}\n"
          f"avr tier:\t{MMR.get_avr_tier(purple_mmr)}\t{MMR.get_avr_tier(blue_mmr)}\n"
          f"Top:\t{p['Top'][0]}\t{b['Top'][0]}\n"
          f"Jng:\t{p['Jungle'][0]}\t{b['Jungle'][0]}\n"
          f"Mid:\t{p['Mid'][0]}\t{b['Mid'][0]}\n"
          f"ADC:\t{p['ADC'][0]}\t{b['ADC'][0]}\n"
          f"Sup:\t{p['Support'][0]}\t{b['Support'][0]}\n"
          )

# 예시 입력
players = [
    ("P1", "M 0", "Jungle", "Mid"),
    ("P2", "D 2", "Support", "Mid"),
    ("P3", "E 2", "Mid", "Top"),
    ("P4", "P 4", "Support", "Top"),
    ("P5", "B 2", "ADC", "Top"),
    ("P6", "G 4", "Support", "Jungle"),
    ("P7", "S 4", "ADC"),
    ("P8", "G 3", "Top", "Mid", "Jungle"),
    ("P9", "I 4", "Top"),
    ("P10", "S 1", "Jungle", "Mid")
]

total_lane = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']

if __name__ == "__main__":
    print("app.py를 실행합니다.")
    while 1:
        build_team()
        input()
