const totalMoviesElement = document.getElementById("total-movies");
const totalBooksElement = document.getElementById("total-books");
const avgRatingElement = document.getElementById("avg-rating");
const insightTextElement = document.getElementById("insight-text");
const statsStatusElement = document.getElementById("stats-status");
const monthlyTrendCanvas = document.getElementById("monthly-trend-chart");
const categoryDistributionCanvas = document.getElementById("category-distribution-chart");
const categoryEmptyNoteElement = document.getElementById("category-empty-note");
const tagDistributionCanvas = document.getElementById("tag-distribution-chart");
const tagEmptyNoteElement = document.getElementById("tag-empty-note");

let monthlyTrendChart = null;
let categoryDistributionChart = null;
let tagDistributionChart = null;

const CATEGORY_COLOR_MAP = {
  movie: "#1f2937",
  tv: "#2563eb",
  anime: "#7c3aed",
  documentary: "#d97706",
  book: "#059669"
};

function setStatus(message, tone = "default") {
  const toneClassMap = {
    default: "text-zinc-500",
    success: "text-emerald-600",
    error: "text-rose-600",
    loading: "text-sky-600"
  };

  statsStatusElement.textContent = message;
  statsStatusElement.className = `text-sm ${toneClassMap[tone] || toneClassMap.default}`;
}

async function requestJson(url) {
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "统计数据加载失败");
  }

  return payload;
}

function formatMonthLabel(month) {
  const [year, numericMonth] = String(month).split("-");

  if (!year || !numericMonth) {
    return month;
  }

  return `${numericMonth}月`;
}

function renderSummary(summary) {
  totalMoviesElement.textContent = String(summary.total_movies ?? 0);
  totalBooksElement.textContent = String(summary.total_books ?? 0);
  avgRatingElement.textContent =
    summary.avg_rating === null || summary.avg_rating === undefined
      ? "--"
      : Number(summary.avg_rating).toFixed(1);
  insightTextElement.textContent =
    summary.insight || "你已经开始积累自己的观影和阅读记录，随着数据增加，会看到更清晰的兴趣轮廓。";
}

function destroyCharts() {
  if (monthlyTrendChart) {
    monthlyTrendChart.destroy();
    monthlyTrendChart = null;
  }

  if (categoryDistributionChart) {
    categoryDistributionChart.destroy();
    categoryDistributionChart = null;
  }

  if (tagDistributionChart) {
    tagDistributionChart.destroy();
    tagDistributionChart = null;
  }
}

function createMonthlyTrendChart(rows) {
  const labels = rows.map((row) => formatMonthLabel(row.month));
  const counts = rows.map((row) => row.count);

  monthlyTrendChart = new Chart(monthlyTrendCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "新增条目",
          data: counts,
          borderColor: "#0f766e",
          backgroundColor: "rgba(15, 118, 110, 0.10)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 5,
          pointBackgroundColor: "#0f766e",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          borderWidth: 2.5
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label(context) {
              return `新增 ${context.parsed.y} 条`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          border: {
            display: false
          },
          ticks: {
            color: "#71717a"
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#71717a"
          },
          border: {
            display: false
          },
          grid: {
            color: "rgba(113, 113, 122, 0.10)",
            drawTicks: false
          }
        }
      }
    }
  });
}

function createCategoryDistributionChart(rows) {
  const labels = rows.map((row) => row.label);
  const counts = rows.map((row) => row.count);
  const hasData = counts.some((count) => count > 0);

  categoryEmptyNoteElement.textContent = hasData
    ? "完整展示 5 类分类分布，0 数据类别也会继续保留。"
    : "当前还没有分类数据，但 5 个分类已经全部准备好。";

  categoryDistributionChart = new Chart(categoryDistributionCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "条目数",
          data: counts,
          backgroundColor: rows.map((row) => CATEGORY_COLOR_MAP[row.category] || "#71717a"),
          borderRadius: 10,
          maxBarThickness: 20
        }
      ]
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.label}: ${context.parsed.x} 条`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#71717a"
          },
          border: {
            display: false
          },
          grid: {
            color: "rgba(113, 113, 122, 0.10)",
            drawTicks: false
          }
        },
        y: {
          ticks: {
            color: "#3f3f46"
          },
          border: {
            display: false
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function createTagDistributionChart(rows) {
  const hasData = Array.isArray(rows) && rows.length > 0;
  const labels = hasData ? rows.map((row) => row.tag) : ["暂无标签"];
  const counts = hasData ? rows.map((row) => row.count) : [1];
  const colors = [
    "#0f766e",
    "#ea580c",
    "#2563eb",
    "#7c3aed",
    "#dc2626",
    "#0891b2",
    "#ca8a04",
    "#9333ea",
    "#16a34a",
    "#db2777"
  ];

  tagEmptyNoteElement.textContent = hasData
    ? "显示出现次数最多的 10 个标签。"
    : "暂无标签";

  tagDistributionChart = new Chart(tagDistributionCanvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: hasData ? colors.slice(0, counts.length) : ["#e4e4e7"],
          borderColor: "#ffffff",
          borderWidth: 4,
          hoverOffset: 6
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyle: "circle",
            color: "#3f3f46",
            padding: 18
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              if (!hasData) {
                return "暂无标签";
              }

              const total = counts.reduce((sum, current) => sum + current, 0);
              const currentValue = context.parsed;
              const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : "0.0";

              return `${context.label}: ${currentValue} 次 (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

async function loadStatsDashboard() {
  if (typeof Chart === "undefined") {
    setStatus("Chart.js 加载失败，无法渲染图表", "error");
    return;
  }

  setStatus("正在加载统计数据...", "loading");

  try {
    const [summary, monthlyTrend, categoryDistribution, tagDistribution] = await Promise.all([
      requestJson("/stats/summary"),
      requestJson("/stats/monthly-trend"),
      requestJson("/stats/category-distribution"),
      requestJson("/stats/tag-distribution")
    ]);

    renderSummary(summary);
    destroyCharts();
    createMonthlyTrendChart(Array.isArray(monthlyTrend) ? monthlyTrend : []);
    createCategoryDistributionChart(Array.isArray(categoryDistribution) ? categoryDistribution : []);
    createTagDistributionChart(Array.isArray(tagDistribution) ? tagDistribution : []);
    setStatus("统计数据已更新", "success");
  } catch (error) {
    console.error("Failed to load stats dashboard:", error);
    destroyCharts();
    setStatus(error.message || "统计数据加载失败", "error");
  }
}

loadStatsDashboard();
