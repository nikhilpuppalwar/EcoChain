def calculate_emissions(data):

    scope1 = data["diesel"]*2.68 + data["petrol"]*2.31 + data["coal"]*2.42

    scope2 = data["electricity"] * 0.708

    scope3 = data["transport_distance"] * data["cargo_weight"] * 0.00012

    total = scope1 + scope2 + scope3

    revenue = data["revenue"] or 1  # avoid division by zero
    carbon_intensity = total / revenue

    waste_generated = data["waste_generated"] or 1
    recycle_rate = data["waste_recycled"] / waste_generated

    employees = data["employees"] or 1
    female_ratio = data["female_employees"] / employees

    board_members = data["board_members"] or 1
    board_diversity = data["female_directors"] / board_members

    return {
        "scope1": scope1,
        "scope2": scope2,
        "scope3": scope3,
        "total": total,
        "carbon_intensity": carbon_intensity,
        "recycle_rate": recycle_rate,
        "female_ratio": female_ratio,
        "board_diversity": board_diversity
    }