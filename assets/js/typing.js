(() => {
  const METRICS_JSON_PATH = '../assets/data/typing-metrics.json';

  const status = document.getElementById('typing-status');
  const chartCanvas = document.getElementById('typing-metrics-chart');
  const periodSelect = document.getElementById('typing-period-select');

  if (!status || !chartCanvas || !periodSelect || !window.Chart) {
    return;
  }

  let chart = null;
  let allHistory = [];

  const parseDate = (value) => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (value) => {
    const date = parseDate(value);
    if (!date) {
      return String(value);
    }
    return date.toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  const validateMetrics = (data) => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter(
        (item) =>
          item &&
          typeof item.date === 'string' &&
          Number.isFinite(item.totalChars) &&
          Number.isFinite(item.correctChars) &&
          Number.isFinite(item.errorChars),
      )
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  };

  const filterByPeriod = (history, periodValue) => {
    if (periodValue === 'all' || history.length === 0) {
      return history;
    }

    const days = Number(periodValue);
    if (!Number.isFinite(days) || days <= 0) {
      return history;
    }

    const latest = parseDate(history[history.length - 1].date);
    if (!latest) {
      return history;
    }

    const threshold = new Date(latest);
    threshold.setDate(threshold.getDate() - (days - 1));

    return history.filter((item) => {
      const date = parseDate(item.date);
      return date ? date >= threshold : false;
    });
  };

  const renderChart = (history) => {
    const labels = history.map((item) => formatDate(item.date));

    if (chart) {
      chart.destroy();
    }

    chart = new window.Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '入力文字数',
            data: history.map((item) => item.totalChars),
            yAxisID: 'yInput',
            borderColor: '#3498db',
            backgroundColor: 'rgba(52,152,219,0.2)',
            tension: 0.2,
            fill: false,
          },
          {
            label: '正タイプ数',
            data: history.map((item) => item.correctChars),
            yAxisID: 'yType',
            stack: 'typing',
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46,204,113,0.35)',
            tension: 0.2,
            fill: true,
          },
          {
            label: '誤タイプ数',
            data: history.map((item) => item.errorChars),
            yAxisID: 'yType',
            stack: 'typing',
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231,76,60,0.35)',
            tension: 0.2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 4,
          },
        },
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              pointStyle: 'line',
            },
          },
        },
        scales: {
          yInput: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: '入力文字数',
            },
          },
          yType: {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            stacked: true,
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: 'タイプ数（正 + 誤の積み上げ）',
            },
          },
          x: {
            title: {
              display: true,
              text: '日付',
            },
          },
        },
      },
    });
  };

  const updateByPeriod = () => {
    const filtered = filterByPeriod(allHistory, periodSelect.value);
    if (filtered.length === 0) {
      if (chart) {
        chart.destroy();
        chart = null;
      }
      status.textContent = 'ステータス: 選択期間に表示できる計測データがありません。';
      return;
    }

    renderChart(filtered);
    status.textContent = `ステータス: ${filtered.length}件のデータを表示中`;
  };

  const loadAndRender = async () => {
    try {
      const response = await window.fetch(METRICS_JSON_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawData = await response.json();
      allHistory = validateMetrics(rawData);

      if (allHistory.length === 0) {
        status.textContent = 'ステータス: 表示できる計測データがありません。';
        return;
      }

      updateByPeriod();
    } catch {
      status.textContent = 'ステータス: JSONの読み込みに失敗しました。';
    }
  };

  periodSelect.addEventListener('change', updateByPeriod);
  loadAndRender();
})();
