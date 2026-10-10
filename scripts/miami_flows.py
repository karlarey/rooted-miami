"""Miami-Dade tech worker in/out migration from ACS 1-year PUMS (national person files).

Usage: python -I miami_flows.py <pums_dir> <out_dir> [MIGPUMA_CODE]
Without MIGPUMA_CODE, prints the candidate migration-PUMA code for Miami-Dade and exits.
"""
import sys, zipfile, pathlib
import pandas as pd

pums_dir, out_dir = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
MD_MIG = int(sys.argv[3]) if len(sys.argv) > 3 else None
out_dir.mkdir(parents=True, exist_ok=True)

MD_PUMAS = set(range(8601, 8626))  # 2020 PUMAs 08601-08625 in Miami-Dade (FIPS 12086)
TECH = {110} | set(range(1005, 1109)) | {1240}  # IT mgrs, computer occupations, data scientists
COLS = ["ST", "PUMA", "MIGSP", "MIGPUMA", "OCCP", "SEX", "AGEP", "PWGTP", "WAGP", "ESR"]

frames = []
for zp in sorted(pums_dir.glob("pus*.zip")):
    year = int(zp.stem[3:])
    with zipfile.ZipFile(zp) as z:
        for name in z.namelist():
            if not name.endswith(".csv"):
                continue
            for ch in pd.read_csv(z.open(name), usecols=lambda c: c in COLS or c == "STATE", chunksize=500_000, low_memory=False):
                ch = ch.rename(columns={"STATE": "ST"}).apply(pd.to_numeric, errors="coerce")
                live_md = (ch.ST == 12) & ch.PUMA.isin(MD_PUMAS)
                from_fl = ch.MIGSP == 12
                if MD_MIG is None:
                    keep = live_md & from_fl
                else:
                    keep = live_md | (from_fl & (ch.MIGPUMA == MD_MIG))
                frames.append(ch[keep].assign(YEAR=year))
            print("read", zp.name, name, flush=True)

df = pd.concat(frames, ignore_index=True)

if MD_MIG is None:
    print(df.groupby("MIGPUMA").PWGTP.sum().sort_values(ascending=False).head(5))
    sys.exit()

nyears = df.YEAR.nunique()
df["live_md"] = (df.ST == 12) & df.PUMA.isin(MD_PUMAS)
df["was_md"] = (df.MIGSP == 12) & (df.MIGPUMA == MD_MIG)
df["moved_in"] = df.live_md & df.MIGSP.notna() & ~df.was_md
df["moved_out"] = df.was_md & ~df.live_md
df["tech"] = df.OCCP.isin(TECH)
df["sex"] = df.SEX.map({1: "Male", 2: "Female"})
df["age"] = pd.cut(df.AGEP, [17, 24, 34, 44, 54, 200], labels=["18-24", "25-34", "35-44", "45-54", "55+"])
df["origin"] = df.MIGSP.apply(lambda s: "Abroad" if s >= 100 else ("Other Florida" if s == 12 else "Other US state"))


def flows(d, by=None):
    """Annual average weighted counts (and unweighted sample n) by group."""
    g = [by] if by else []
    agg = lambda m: d[m].groupby(g, observed=True).PWGTP.sum() / nyears if g else d[m].PWGTP.sum() / nyears
    cnt = lambda m: d[m].groupby(g, observed=True).size() if g else d[m].shape[0]
    t = pd.DataFrame({
        "residents": agg(d.live_md), "moved_in": agg(d.moved_in), "moved_out": agg(d.moved_out),
        "n_in": cnt(d.moved_in), "n_out": cnt(d.moved_out),
    }, index=None if g else ["All"])
    t["net"] = t.moved_in - t.moved_out
    t["in_rate_%"] = 100 * t.moved_in / t.residents
    t["out_rate_%"] = 100 * t.moved_out / (t.residents - t.moved_in + t.moved_out)
    return t.round(1)


tech = df[df.tech & (df.AGEP >= 18)]
work = df[df.OCCP.notna() & (df.AGEP >= 18)]
out = {
    "summary_tech_vs_all": pd.concat({"Tech": flows(tech), "All workers": flows(work)}),
    "tech_by_sex": flows(tech, "sex"),
    "tech_by_age": flows(tech, "age"),
    "tech_by_sex_age": flows(tech.assign(grp=tech.sex + " " + tech.age.astype(str)), "grp"),
    "tech_in_origin": (tech[tech.moved_in].groupby("origin").PWGTP.sum() / nyears).round(),
    "tech_out_dest_state": (tech[tech.moved_out].groupby("ST").PWGTP.sum() / nyears).sort_values(ascending=False).head(10).round(),
    "tech_median_wage": tech[tech.WAGP > 0].groupby(
        pd.Series(["stayer"] * len(tech), index=tech.index).where(~tech.moved_in, "moved_in").where(~tech.moved_out, "moved_out")
    ).WAGP.median(),
}
for k, v in out.items():
    print(f"\n=== {k} ===\n{v.to_string()}")
    v.to_csv(out_dir / f"{k}.csv")
