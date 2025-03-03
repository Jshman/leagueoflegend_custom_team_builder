
def tier_to_mmr(Rank):
    tier, sub_tier = Rank.split()
    if tier in base_mmr and sub_tier in sub_tier_offset:
        return base_mmr[tier] + sub_tier_offset[sub_tier]
    else:
        raise ValueError("올바른 티어로 입력해주십쇼")

# 팀 mmr로 평균 티어 구해내기
def get_avr_tier(team_mmr):
    mmr = team_mmr//5
    mmr_list = list(base_mmr.values())
    idx = -1
    for i in range(len(mmr_list)-1):
        if mmr_list[i] <= mmr and mmr < mmr_list[i+1]:
            idx = i
    return list(base_mmr.keys())[idx]


base_mmr = {
        "I": 0,
        "B": 500,
        "S": 900,
        "G": 1300,
        "P": 1700,
        "E": 2100,
        "D": 2500,
        "M": 2900,
        "GM": 3000,
        "C": 3100
    }

sub_tier_offset = {
    "4": 0,
    "3": 100,
    "2": 200,
    "1": 300,
    "0": 0,
}

if __name__ == "__main__":
    # 예시 입력
    players_tiers = [
        ("Player1", "D", "1"),
        ("Player2", "P", "2"),
        ("Player3", "G", "3"),
        ("Player4", "S", "4"),
        ("Player5", "B", "1"),
        ("Player6", "I", "2"),
        ("Player7", "M", "0"),
        ("Player8", "G", "0"),
        ("Player9", "C", "0"),
        ("Player10", "D", "3")
    ]

    # 각 플레이어의 MMR 계산
    players_mmr = [(player[0], tier_to_mmr(player[1]+" "+player[2])) for player in players_tiers]
    # print(players_mmr)