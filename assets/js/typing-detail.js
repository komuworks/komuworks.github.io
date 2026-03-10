(() => {
  const METRICS_JSON_PATH = '../assets/data/typing-metrics.json';

  const status = document.getElementById('typing-detail-status');
  const detailGrid = document.getElementById('typing-detail-grid');

  if (!status || !detailGrid) {
    return;
  }

  const getTargetDate = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('date');
  };

  const validateMetrics = (data) => {
    const historyRaw = Array.isArray(data) ? data : data?.history;
    if (!Array.isArray(historyRaw)) {
      return [];
    }

    return historyRaw.filter(
      (item) =>
        item &&
        typeof item.date === 'string' &&
        Number.isFinite(item.totalChars) &&
        Number.isFinite(item.correctChars) &&
        Number.isFinite(item.errorChars),
    );
  };

  const parseSessionMinutes = (data) => {
    const rawMinutes = Array.isArray(data) ? 5 : data?.sessionMinutes;
    return Number.isFinite(rawMinutes) && rawMinutes > 0 ? rawMinutes : 5;
  };

  const toPercent = (value) => `${(value * 100).toFixed(1)}%`;

  const appendDetailRow = (label, value) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    detailGrid.append(dt, dd);
  };

  const loadAndRenderDetail = async () => {
    const targetDate = getTargetDate();
    if (!targetDate) {
      status.textContent = 'ステータス: 日付が指定されていません。';
      return;
    }

    try {
      const response = await window.fetch(METRICS_JSON_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawData = await response.json();
      const history = validateMetrics(rawData);
      const sessionMinutes = parseSessionMinutes(rawData);
      const selected = history.find((item) => item.date === targetDate);

      if (!selected) {
        status.textContent = 'ステータス: 指定日のデータが見つかりません。';
        return;
      }

      const totalTypes = selected.correctChars + selected.errorChars;
      const correctRate = totalTypes > 0 ? selected.correctChars / totalTypes : 0;
      const errorRate = totalTypes > 0 ? selected.errorChars / totalTypes : 0;
      const kpm = selected.correctChars / sessionMinutes;
      const wpm = selected.totalChars / sessionMinutes;

      appendDetailRow('計測日', selected.date);
      appendDetailRow('入力文字数', String(selected.totalChars));
      appendDetailRow('正タイプ数', String(selected.correctChars));
      appendDetailRow('誤タイプ数', String(selected.errorChars));
      appendDetailRow('正タイプ率', toPercent(correctRate));
      appendDetailRow('誤タイプ率', toPercent(errorRate));
      appendDetailRow('WPM', wpm.toFixed(1));
      appendDetailRow('KPM', kpm.toFixed(1));

      detailGrid.hidden = false;
      status.textContent = `ステータス: ${selected.date} の計測結果（${sessionMinutes}分計測）`;
    } catch {
      status.textContent = 'ステータス: JSONの読み込みに失敗しました。';
    }
  };

  loadAndRenderDetail();
})();
