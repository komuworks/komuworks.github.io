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
  let sessionMinutes = 5;

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
    const historyRaw = Array.isArray(data) ? data : data?.history;

    if (!Array.isArray(historyRaw)) {
      return [];
    }

    return historyRaw
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

  const parseSessionMinutes = (data) => {
    const rawMinutes = Array.isArray(data) ? 5 : data?.sessionMinutes;
    return Number.isFinite(rawMinutes) && rawMinutes > 0 ? rawMinutes : 5;
  };

  const filterByPeriod = (history, periodValue) => {
    if (periodValue === 'all' || history.length === 0) {
      return history;
    }

    const days = Number(periodValue);
    if (!Number.isFinite(days) || days <= 0) {
      return history;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threshold = new Date(today);
    threshold.setDate(threshold.getDate() - (days - 1));

    return history.filter((item) => {
      const date = parseDate(item.date);
      return date ? date >= threshold : false;
    });
  };

  const toDetailUrl = (item) => {
    const params = new URLSearchParams({ date: item.date });
    return `./detail.html?${params.toString()}`;
  };

  const calcCorrectRate = (item) => {
    const totalTypes = item.correctChars + item.errorChars;
    return totalTypes > 0 ? (item.correctChars / totalTypes) * 100 : 0;
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
            label: '正タイプ数',
            data: history.map((item) => item.correctChars),
            yAxisID: 'yType',
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46,204,113,0.2)',
            tension: 0.2,
            fill: false,
          },
          {
            label: '総タイプ数',
            data: history.map((item) => item.correctChars + item.errorChars),
            yAxisID: 'yType',
            borderColor: '#3498db',
            backgroundColor: 'rgba(52,152,219,0.2)',
            tension: 0.2,
            fill: false,
          },
          {
            label: '正タイプ率(%)',
            data: history.map((item) => calcCorrectRate(item)),
            yAxisID: 'yRate',
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.2)',
            tension: 0.2,
            fill: false,
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
            radius: 3,
            hoverRadius: 5,
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
        onClick: (_event, elements) => {
          if (!elements || elements.length === 0) {
            return;
          }
          const clickedIndex = elements[0].index;
          const selected = history[clickedIndex];
          if (selected) {
            window.location.href = toDetailUrl(selected);
          }
        },
        scales: {
          yType: {
            type: 'linear',
            position: 'left',
            beginAtZero: false,
            title: {
              display: true,
              text: 'タイプ数',
            },
          },
          yRate: {
            type: 'linear',
            position: 'right',
            beginAtZero: false,
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: '正タイプ率(%)',
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
      status.textContent = 'ステータス: 現在日付基準で対象なし（選択期間に表示できる計測データがありません）。';
      return;
    }

    renderChart(filtered);
    status.textContent = `ステータス: ${filtered.length}件のデータを表示中（${sessionMinutes}分計測）`;
  };

  const loadAndRender = async () => {
    try {
      const response = await window.fetch(METRICS_JSON_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawData = await response.json();
      allHistory = validateMetrics(rawData);
      sessionMinutes = parseSessionMinutes(rawData);

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
