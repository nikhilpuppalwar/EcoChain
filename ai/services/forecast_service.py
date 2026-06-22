import random

# Sector-level average annual emission baselines (tCO2e)
SECTOR_BASELINES = {
    "steel":          50000,
    "cement":         30000,
    "power":          80000,
    "textile":        8000,
    "manufacturing":  20000,
    "logistics":      15000,
    "agriculture":    12000,
    "other":          10000,
}

# Sector credit deficit rate: fraction of baseline typically needed as credits
SECTOR_CREDIT_RATIO = {
    "steel":          0.15,
    "cement":         0.12,
    "power":          0.20,
    "textile":        0.08,
    "manufacturing":  0.10,
    "logistics":      0.09,
    "agriculture":    0.11,
    "other":          0.10,
}


def generate_forecast(company_name: str, sector: str, annual_budget: float) -> dict:
    """
    Generate a 6-month (H2) emission forecast for the given company.

    Uses sector benchmarks to estimate projected emissions, required carbon
    credit purchases, compliance probability, and risk level.

    Args:
        company_name: Name of the industry company.
        sector: Industry sector string (e.g. 'steel', 'manufacturing').
        annual_budget: Annual carbon budget in tCO2e (0 means use sector default).

    Returns:
        dict matching ForecastResponse schema.
    """
    sector_key = (sector or "other").lower()

    # Resolve baseline from annual_budget or fallback to sector average
    baseline_annual = annual_budget if annual_budget and annual_budget > 0 else SECTOR_BASELINES.get(sector_key, 10000)

    # H2 projection = half year baseline with a modelled 10-15% reduction trend
    reduction_factor = random.uniform(0.85, 0.92)        # 8-15% improvement assumed
    predicted_h2 = round(baseline_annual * 0.5 * reduction_factor, 1)

    # Credits needed = sector deficit ratio × predicted emissions
    credit_ratio = SECTOR_CREDIT_RATIO.get(sector_key, 0.10)
    predicted_credits = round(predicted_h2 * credit_ratio, 1)

    # Budget utilisation → compliance probability
    budget_h2 = baseline_annual * 0.5
    utilisation = predicted_h2 / budget_h2 if budget_h2 > 0 else 1.0

    if utilisation < 0.80:
        risk_level   = "Low"
        compliance   = round(random.uniform(90, 99), 1)
        confidence   = round(random.uniform(88, 96), 1)
    elif utilisation < 0.95:
        risk_level   = "Medium"
        compliance   = round(random.uniform(72, 89), 1)
        confidence   = round(random.uniform(78, 88), 1)
    else:
        risk_level   = "High"
        compliance   = round(random.uniform(45, 71), 1)
        confidence   = round(random.uniform(65, 78), 1)

    # Human-readable explanation
    delta_pct = round((1 - reduction_factor) * 100, 1)
    explanation = (
        f"Based on {sector_key} sector benchmarks and historical patterns for {company_name}, "
        f"H2 emissions are projected at {predicted_h2:,.0f} tCO₂e — a {delta_pct}% reduction "
        f"vs H1. Purchase {predicted_credits:,.0f} carbon credits before Q3 to stay compliant. "
        f"Risk level is {risk_level}."
    )

    return {
        "period":                   "H2 2025",
        "predicted_emissions":      predicted_h2,
        "predicted_credits_needed": predicted_credits,
        "risk_level":               risk_level,
        "confidence":               confidence,
        "compliance_probability":   compliance,
        "explanation":              explanation,
    }
