(() => {
  const basePath = document.body?.dataset?.basePath || './';
  const METRICS_JSON_PATH = `${basePath}assets/data/typing-metrics.json`;

  const status = document.getElementById('typing-status');
  const chartCanvas = document.getElementById('typing-metrics-chart');
  const periodSelect = document.getElementById('typing-period-select');

  if (!status || !chartCanvas || !periodSelect || !window.Chart) {
    return;
  }

  let chart = null;
  let allHistory = [];
  let sessionMinutes = 5;
  let validationWarnings = [];

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

  const isNonNegativeNumber = (value) => Number.isFinite(value) && value >= 0;

  const validateMetrics = (data) => {
    const historyRaw = Array.isArray(data) ? data : data?.history;
    if (!Array.isArray(historyRaw)) {
      return { history: [], warnings: ['history が配列ではありません。'] };
    }

    const warnings = [];
    const history = historyRaw.filter((item, index) => {
      const hasRequiredFields =
        item &&
        typeof item.date === 'string' &&
        isNonNegativeNumber(item.totalChars) &&
        isNonNegativeNumber(item.correctKeys) &&
        isNonNegativeNumber(item.errorKeys);

      if (!hasRequiredFields) {
        warnings.push(`index ${index}: 必須項目不足または数値が不正のため除外しました。`);
        return false;
      }

      const parsedDate = parseDate(item.date);
      if (!parsedDate) {
        warnings.push(`index ${index}: date が不正なため除外しました。`);
        return false;
      }

      const totalKeys = item.correctKeys + item.errorKeys;
      if (totalKeys <= 0) {
        warnings.push(`index ${index}: 総タイプ数(correctKeys + errorKeys)が0以下のため除外しました。`);
        return false;
      }

      if (item.totalChars > item.correctKeys) {
        warnings.push(`index ${index}: totalChars が correctKeys を超えているため除外しました。`);
        return false;
      }

      return true;
    });

    history.sort((a, b) => (a.date > b.date ? 1 : -1));
    return { history, warnings };
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

  const detailBasePath = chartCanvas.dataset.detailBasePath || './';

  const toDetailUrl = (item) => {
    const params = new URLSearchParams({ date: item.date });
    return `${detailBasePath}detail.html?${params.toString()}`;
  };

  const calcCorrectRate = (item) => {
    const totalKeys = item.correctKeys + item.errorKeys;
    return totalKeys > 0 ? (item.correctKeys / totalKeys) * 100 : 0;
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
            data: history.map((item) => item.correctKeys),
            yAxisID: 'yType',
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46,204,113,0.2)',
            tension: 0.2,
            fill: false,
          },
          {
            label: '総タイプ数',
            data: history.map((item) => item.correctKeys + item.errorKeys),
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

  const buildStatusMessage = (baseMessage) => {
    if (validationWarnings.length === 0) {
      return baseMessage;
    }
    return `${baseMessage}（警告: ${validationWarnings.length}件の不整合データを除外）`;
  };

  const updateByPeriod = () => {
    const filtered = filterByPeriod(allHistory, periodSelect.value);
    if (filtered.length === 0) {
      if (chart) {
        chart.destroy();
        chart = null;
      }
      status.textContent = buildStatusMessage('ステータス: 現在日付基準で対象なし（選択期間に表示できる計測データがありません）。');
      return;
    }

    renderChart(filtered);
    status.textContent = buildStatusMessage(`ステータス: ${filtered.length}件のデータを表示中（${sessionMinutes}分計測）`);
  };

  const loadAndRender = async () => {
    try {
      const response = await window.fetch(METRICS_JSON_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawData = await response.json();
      const validated = validateMetrics(rawData);
      allHistory = validated.history;
      validationWarnings = validated.warnings;
      sessionMinutes = parseSessionMinutes(rawData);

      if (allHistory.length === 0) {
        status.textContent = buildStatusMessage('ステータス: 表示できる計測データがありません。');
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
