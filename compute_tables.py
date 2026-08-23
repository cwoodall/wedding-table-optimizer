#!/usr/bin/env python3
"""
Wedding table assignment generator
===================================

You describe how much each pair of guests wants (or does not want) to sit
together with a symmetric weight matrix.  The program then produces a few
distinct, optimized seatings that respect your available tables.

WEIGHT CONVENTION  (symmetric matrix W):

    W[i][j] >= 1.0    HARD constraint  -> i and j MUST sit at the same table.
    0 < W[i][j] < 1   soft "keep them together"   (bigger = stronger pull).
    W[i][j] == 0      neutral / no opinion.
    W[i][j] < 0       soft "keep them apart"       (more negative = stronger push).

The optimizer maximizes the total weight of every co-seated pair while:
    * seating every guest at exactly one table,
    * never exceeding a table's capacity,
    * always honoring the HARD "must sit together" constraints.

Run it:                     python wedding_seating.py
Load a matrix from CSV:     python wedding_seating.py guests.csv

An optional exact check runs automatically if you have `ortools` installed
(pip install ortools) so you can confirm the heuristic hit the true optimum.
"""

import sys
import csv
import math
import random
import itertools

import numpy as np

# ===========================================================================
# 1.  INPUT  --  edit this section to describe your wedding
# ===========================================================================

# The resource constraint: list every available table's capacity.
# Example: one 10-seat table and two 8-seat tables.
TABLE_CAPACITIES = [10] + [8] * 5 #[4]*9 + [5, 5]

NUM_OPTIONS = 3  # how many distinct seatings to print
RANDOM_SEED = None  # set to an int (e.g. 42) for reproducible runs

# Any weight >= this value is treated as a HARD "must sit together" link.
HARD_TOGETHER_THRESHOLD = 1.0

# --- Guests -----------------------------------------------------------------
NAMES = [
    "Danielle",
    "Seamus",
    "Abbey",
    "Colby",
    "Phil",
    "Ava",
    "Nicholas M",
    "Olivia",
    "Marcelle",
    "Michael",
    "Jeff",
    "Amy",
    "Thomas",
    "SJ",
    "Luke",
    "Dani",
    "Tom",
    "Patricia",
    "Timothy",
    "Rob",
    "Kimberly",
    "Cedar",
    "Frannie",
    "Steve",
    "Alexa",
    "Devon",
    "Dan West",
    "Joyelle",
    "Dan Riti",
    "Rosy",
    "Alice",
    "Nicholas T",
    "Joy",
    "Steven",
    "Abe",
    "Leia",
    "Ian",
    "Kellin",
    "Cailigh",
    "Ariana",
    "Dale",
    "Simon",
    # "Alexandra",
    "Gavin", "Juliana"
]


# --- Relationships ----------------------------------------------------------
# Instead of typing a full 20x20 matrix by hand, build it from small groups.
# `together(group, w)` links every pair inside `group` with weight `w`.
def together(group, w):
    return {tuple(sorted(pair)): w for pair in itertools.combinations(group, 2)}


PAIRS = {}
# Couples / families that MUST share a table (weight 1.0 = hard):
PAIRS.update(together(["Ian", "Kellin"], 1.0))
PAIRS.update(together(["Abe", "Leia"], 1.0))
PAIRS.update(together(["Joy", "Steven"], 1.0))
PAIRS.update(together(["Alice", "Nicholas T"], 1.0))
PAIRS.update(together(["Danielle", "Seamus"], 1.0))

PAIRS.update(
    together(
        [
            "Abbey",
            "Colby",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Phil",
            "Ava",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Nicholas M",
            "Olivia",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Marcelle",
            "Michael",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Jeff",
            "Amy",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Thomas",
            "SJ",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Luke",
            "Dani",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Tom",
            "Patricia",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Rob",
            "Kimberly",
            "Cedar",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Frannie",
            "Steve",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Alexa",
            "Devon",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Dan West",
            "Joyelle",
        ], 1.0
    )
)

PAIRS.update(
    together(
        [
            "Dan Riti",
            "Rosy",
        ], 1.0
    )
)

### Some clusters

# PAIRS.update(
#     together(
#         ["Timothy", "Rob", "Tom"], 
#     )
# )

PAIRS.update(
    together(
        ["Danielle", "Abbey"], .5
    )
)

PAIRS.update(
    together(
        ["Simon", "Dale"], .7
    )
)


PAIRS.update(
    together(
        ["Nicholas M", "Nicholas T"], .6
    )
)


PAIRS.update(
    together(
        ["Phil", "Nicholas M"], .6
    )
)


PAIRS.update(
    together(
        ["Jeff", "Thomas"], .8
    )
)

PAIRS.update(
    together(
        ["Luke", "Thomas"], .8
    )
)


PAIRS.update(
    together(
        ["Ian", "Cailigh"], .5
    )
)


PAIRS.update(
    together(
        ["Gavin", "Juliana"], 1
    )
)

PAIRS.update(
    together(
        ["Gavin", "Alice"], .6
    )
)


PAIRS.update(
    together(
        ["Ariana", "Rosy"], .8
))

PAIRS.update(together(["Ian", "Timothy"], .8))

PAIRS.update(together(["Leia", "Ariana"], .6))

PAIRS.update(together(["Abe", "Tom"], .2))
PAIRS.update(together(["Michael", "Gavin"], .8))
PAIRS.update(together(["Thomas", "Gavin"], .8))


PAIRS.update(together(["Cailigh", 
"Ian", 
"Kellin", 
"Timothy"],1))

PAIRS.update(together([
"Ava", 
"Nicholas M", 
"Olivia", 
"Phil"],1))
PAIRS.update(together([
"Dan West", 
"Frannie", 
"Joyelle", 
"Steve"],1))
PAIRS.update(together([
"Dani", 
"Luke", 
"SJ", 
"Thomas"],1))

PAIRS.update(together([
"Abbey", 
"Colby", 
"Danielle", 
"Seamus"],1))


PAIRS.update(together(["Abe", 
"Ariana", 
"Dan Riti", 
"Leia", 
"Rosy"],1))

PAIRS.update(together(["Cedar", 
"Kimberly", 
"Patricia", 
"Rob", 
"Tom"],1))

# PAIRS.update(
#     together(
#         ["Alexandra", "Joyelle", "Alice"],0
#     )
# )

# ===========================================================================
# 2.  Below here is the engine -- no need to edit for normal use
# ===========================================================================



def build_matrix(names, pairs):
    """Turn a {(nameA, nameB): weight} dict into a symmetric NumPy matrix."""
    idx = {name: i for i, name in enumerate(names)}
    n = len(names)
    W = np.zeros((n, n))
    for (a, b), w in pairs.items():
        if a not in idx or b not in idx:
            raise ValueError(f"Unknown guest in pair ({a!r}, {b!r}).")
        i, j = idx[a], idx[b]
        W[i, j] = W[j, i] = float(w)
    np.fill_diagonal(W, 0.0)
    return W


def load_csv(path):
    """
    Load names + symmetric weight matrix from a CSV.

    Format: first row is a header whose first cell is ignored (label) and whose
    remaining cells are the guest names.  Each following row starts with a guest
    name, then that guest's weights toward every other guest.  Blank cells = 0.
    """
    with open(path, newline="") as f:
        rows = [r for r in csv.reader(f) if any(c.strip() for c in r)]
    names = [c.strip() for c in rows[0][1:]]
    n = len(names)
    W = np.zeros((n, n))
    for r, row in enumerate(rows[1:]):
        for c, cell in enumerate(row[1:]):
            cell = cell.strip()
            if cell:
                W[r, c] = float(cell)
    # Symmetrize: for each pair keep the larger-magnitude entry.
    mask = np.abs(W) >= np.abs(W.T)
    W = np.where(mask, W, W.T)
    np.fill_diagonal(W, 0.0)
    return names, W


# ---- Hard "must sit together" groups (union-find) --------------------------

def hard_blocks(W):
    """Merge guests joined by a hard link into indivisible blocks."""
    n = W.shape[0]
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    # np.argwhere pulls out the hard edges in one vectorized shot.
    for i, j in np.argwhere(np.triu(W >= HARD_TOGETHER_THRESHOLD, k=1)):
        parent[find(i)] = find(j)

    groups = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)
    return list(groups.values())


def block_model(W, blocks):
    """
    Collapse guests onto blocks.

    Returns:
        sizes             (nb,)      number of guests in each block
        B                 (nb, nb)   cross-block weight, zero diagonal
        internal_constant scalar     weight of pairs inside blocks (always seated)
    """
    nb = len(blocks)
    sizes = np.array([len(b) for b in blocks])
    B = np.zeros((nb, nb))
    internal = 0.0
    for p in range(nb):
        # intra-block weight (constant: these people are always together)
        internal += W[np.ix_(blocks[p], blocks[p])].sum() / 2.0
        for q in range(p + 1, nb):
            w = W[np.ix_(blocks[p], blocks[q])].sum()
            B[p, q] = B[q, p] = w
    return sizes, B, internal


# ---- Feasibility checks ----------------------------------------------------

def check_feasible(names, blocks, sizes, caps):
    if sizes.sum() > sum(caps):
        raise SystemExit(
            f"Not enough seats: {int(sizes.sum())} guests but only "
            f"{sum(caps)} seats across {len(caps)} tables."
        )
    biggest = max(caps)
    for b in blocks:
        if len(b) > biggest:
            who = ", ".join(names[i] for i in b)
            raise SystemExit(
                f"A must-sit-together group has {len(b)} people ({who}) but the "
                f"largest table only seats {biggest}. Add a bigger table or "
                f"relax a hard link."
            )


# ---- Scoring ---------------------------------------------------------------

def score_assignment(B, internal, block_table, num_tables):
    """Full score as the quadratic form  internal + 0.5 * <B, A A^T>."""
    nb = len(block_table)
    A = np.zeros((nb, num_tables))
    A[np.arange(nb), block_table] = 1.0
    co_seated = A @ A.T                      # 1 where two blocks share a table
    return internal + 0.5 * float((B * co_seated).sum())


# ---- Local search (simulated annealing + random restarts) ------------------

def random_initial(sizes, caps, tries=500):
    """Randomly pack blocks into tables without exceeding capacity."""
    order = list(range(len(sizes)))
    for _ in range(tries):
        random.shuffle(order)
        load = [0] * len(caps)
        block_table = [-1] * len(sizes)
        ok = True
        for b in order:
            placed = False
            for t in sorted(range(len(caps)), key=lambda t: caps[t] - load[t],
                            reverse=True):                      # worst-fit
                if load[t] + sizes[b] <= caps[t]:
                    block_table[b] = t
                    load[t] += int(sizes[b])
                    placed = True
                    break
            if not placed:
                ok = False
                break
        if ok:
            return block_table, load
    raise SystemExit("Could not pack guests into tables; check capacities.")


def anneal(B, internal, sizes, caps, iters, t_start=1.0, t_end=0.01):
    nb = len(sizes)
    block_table, load = random_initial(sizes, caps)
    table_blocks = [set() for _ in caps]
    for b, t in enumerate(block_table):
        table_blocks[t].add(b)

    cur = score_assignment(B, internal, block_table, len(caps))
    best, best_assign = cur, list(block_table)

    alpha = (t_end / t_start) ** (1.0 / max(1, iters))
    T = t_start

    for _ in range(iters):
        if nb >= 2 and random.random() < 0.5:
            # --- swap two blocks between different tables ---
            p, q = random.sample(range(nb), 2)
            t1, t2 = block_table[p], block_table[q]
            if t1 == t2:
                T *= alpha
                continue
            if (load[t1] - sizes[p] + sizes[q] > caps[t1] or
                    load[t2] - sizes[q] + sizes[p] > caps[t2]):
                T *= alpha
                continue
            rest1 = list(table_blocks[t1] - {p})
            rest2 = list(table_blocks[t2] - {q})
            delta = (B[p, rest2].sum() + B[q, rest1].sum()
                     - B[p, rest1].sum() - B[q, rest2].sum())
            if delta >= 0 or random.random() < math.exp(delta / max(T, 1e-9)):
                table_blocks[t1].discard(p); table_blocks[t1].add(q)
                table_blocks[t2].discard(q); table_blocks[t2].add(p)
                block_table[p], block_table[q] = t2, t1
                load[t1] += int(sizes[q] - sizes[p])
                load[t2] += int(sizes[p] - sizes[q])
                cur += float(delta)
        else:
            # --- relocate one block to another table ---
            p = random.randrange(nb)
            s = block_table[p]
            d = random.randrange(len(caps))
            if d == s or load[d] + sizes[p] > caps[d]:
                T *= alpha
                continue
            rest_s = list(table_blocks[s] - {p})
            dblocks = list(table_blocks[d])
            delta = B[p, dblocks].sum() - B[p, rest_s].sum()
            if delta >= 0 or random.random() < math.exp(delta / max(T, 1e-9)):
                table_blocks[s].discard(p)
                table_blocks[d].add(p)
                block_table[p] = d
                load[s] -= int(sizes[p])
                load[d] += int(sizes[p])
                cur += float(delta)

        if cur > best:
            best, best_assign = cur, list(block_table)
        T *= alpha

    return best, best_assign


def canonical(names, blocks, block_table):
    """A label-independent signature of a seating (set of frozensets of names)."""
    tables = {}
    for b, t in enumerate(block_table):
        tables.setdefault(t, []).extend(blocks[b])
    return frozenset(
        frozenset(names[i] for i in guests) for guests in tables.values()
    )


def optimize(names, W, caps, num_options):
    blocks = hard_blocks(W)
    sizes, B, internal = block_model(W, blocks)
    check_feasible(names, blocks, sizes, caps)

    nb = len(blocks)
    iters = max(4000, 400 * nb)
    restarts = max(30, 12 * num_options)

    found = {}   # signature -> (score, block_table)
    for _ in range(restarts):
        score, assign = anneal(B, internal, sizes, caps, iters)
        sig = canonical(names, blocks, assign)
        if sig not in found or score > found[sig][0]:
            found[sig] = (score, assign)

    ranked = sorted(found.values(), key=lambda x: -x[0])
    return ranked[:num_options], blocks


# ---- Optional exact optimum via OR-Tools CP-SAT ----------------------------

def exact_optimum(names, W, caps, time_limit=10.0):
    try:
        from ortools.sat.python import cp_model
    except Exception:
        return None
    blocks = hard_blocks(W)
    sizes, B, internal = block_model(W, blocks)
    nb, T = len(blocks), len(caps)

    model = cp_model.CpModel()
    x = [[model.NewBoolVar(f"x_{p}_{t}") for t in range(T)] for p in range(nb)]
    for p in range(nb):
        model.AddExactlyOne(x[p])
    for t in range(T):
        model.Add(sum(int(sizes[p]) * x[p][t] for p in range(nb)) <= caps[t])

    scale = 1000
    obj = []
    for p in range(nb):
        for q in range(p + 1, nb):
            w = int(round(B[p, q] * scale))
            if w == 0:
                continue
            for t in range(T):
                z = model.NewBoolVar(f"z_{p}_{q}_{t}")
                model.AddBoolAnd([x[p][t], x[q][t]]).OnlyEnforceIf(z)
                model.AddBoolOr([x[p][t].Not(), x[q][t].Not()]).OnlyEnforceIf(z.Not())
                obj.append(w * z)
    model.Maximize(sum(obj))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = time_limit
    status = solver.Solve(model)
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        proven = status == cp_model.OPTIMAL
        return internal + solver.ObjectiveValue() / scale, proven
    return None


# ---- Reporting -------------------------------------------------------------

def describe(names, W, caps, blocks, block_table):
    tables = {}
    for b, t in enumerate(block_table):
        tables.setdefault(t, []).extend(blocks[b])

    lines = []
    for t in sorted(tables):
        guests = sorted(names[i] for i in tables[t])
        lines.append(f"  Table {t + 1} ({len(guests)}/{caps[t]} seats): "
                     + ", ".join(guests))

    same_table = {}
    for t, guests in tables.items():
        for i in guests:
            same_table[i] = t

    apart_violations, split_soft = [], []
    n = len(names)
    for i in range(n):
        for j in range(i + 1, n):
            w = W[i, j]
            same = same_table[i] == same_table[j]
            if w < 0 and same:
                apart_violations.append((names[i], names[j], w))
            elif 0 < w < HARD_TOGETHER_THRESHOLD and not same:
                split_soft.append((names[i], names[j], w))
    return lines, apart_violations, split_soft


def main():
    if RANDOM_SEED is not None:
        random.seed(RANDOM_SEED)
        np.random.seed(RANDOM_SEED)

    if len(sys.argv) > 1:
        names, W = load_csv(sys.argv[1])
    else:
        names, W = NAMES, build_matrix(NAMES, PAIRS)

    caps = TABLE_CAPACITIES
    options, blocks = optimize(names, W, caps, NUM_OPTIONS)

    print("=" * 70)
    print(f"{len(names)} guests | tables: {caps} ({sum(caps)} seats total)")
    hard = [b for b in blocks if len(b) > 1]
    if hard:
        print("Must-sit-together groups:")
        for b in hard:
            print("   - " + ", ".join(names[i] for i in b))
    print("=" * 70)

    exact = exact_optimum(names, W, caps)

    for rank, (score, assign) in enumerate(options, 1):
        print(f"\nOPTION {rank}   (score {score:+.2f})")
        lines, apart, split = describe(names, W, caps, blocks, assign)
        for ln in lines:
            print(ln)
        if apart:
            for a, b, w in apart:
                print(f"    ! seated together despite wanting apart: {a} & {b}")
        if split:
            for a, b, w in split:
                print(f"    . wanted together but split: {a} & {b} (w={w})")
        if not apart and not split:
            print("    (all soft preferences satisfied)")

    if exact is not None:
        opt, proven = exact
        tag = "proven optimum" if proven else "best found in time limit"
        best_heur = options[0][0]
        gap = opt - best_heur
        print("\n" + "-" * 70)
        print(f"Exact solver ({tag}): {opt:+.2f}   "
              f"| heuristic best: {best_heur:+.2f}   | gap: {gap:+.2f}")
        if abs(gap) < 1e-6:
            print("The top option is optimal.")
    else:
        print("\n(Install `ortools` to also compute a provably-optimal score.)")


if __name__ == "__main__":
    main()
