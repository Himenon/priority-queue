import pandas as pd
import matplotlib.pyplot as plt

plt.style.use("seaborn-v0_8-muted")

df = pd.read_csv("stats.csv")

operations = ["enqueue", "dequeue", "drain", "memory"]

for op in operations:
    fig, ax = plt.subplots(figsize=(10, 5))
    for queue_type in ["priority", "yocto"]:
        sub = df[(df["operation"] == op) & (df["queueType"] == queue_type)]
        if sub.empty:
            continue

        y = sub["mean"]
        x = sub["heapSize"]
        lower = (sub["mean"] - sub["p25"]).abs()
        upper = (sub["p75"] - sub["mean"]).abs()
        yerr = [lower, upper]

        ax.errorbar(
            x,
            y,
            yerr=yerr,
            fmt='-o',
            capsize=5,
            label=f"{queue_type} (mean ± p25–p75)"
        )

    ax.set_title(f"{op.capitalize()} Comparison")
    ax.set_xlabel("Heap Size")
    ax.set_ylabel("Time (ms)" if op != "memory" else "Memory (MB)")
    ax.legend()
    ax.grid(True)
    fig.tight_layout()
    fig.savefig(f"compare-{op}.png")
    print(f"✅ Saved compare-{op}.png")
