(() => {
  const METRICS_JSON_PATH = '../../assets/data/typing-metrics.json';

  const status = document.getElementById('typing-detail-status');
  const detailGrid = document.getElementById('typing-detail-grid');

  if (!status || !detailGrid) {
    return;
  }

  let validationWarnings = [];

  const getTargetDate = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('date');
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

    return { history, warnings };
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

  const buildStatusMessage = (baseMessage) => {
    if (validationWarnings.length === 0) {
      return baseMessage;
    }
    return `${baseMessage}（警告: ${validationWarnings.length}件の不整合データを除外）`;
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
      const validated = validateMetrics(rawData);
      const history = validated.history;
      validationWarnings = validated.warnings;
      const sessionMinutes = parseSessionMinutes(rawData);
      const selected = history.find((item) => item.date === targetDate);

      if (!selected) {
        status.textContent = buildStatusMessage('ステータス: 指定日のデータが見つかりません。');
        return;
      }

      const totalKeys = selected.correctKeys + selected.errorKeys;
      const correctRate = selected.correctKeys / totalKeys;
      const errorRate = selected.errorKeys / totalKeys;
      const kpm = selected.correctKeys / sessionMinutes;
      const wpm = selected.totalChars / sessionMinutes;

      appendDetailRow('計測日', selected.date);
      appendDetailRow('入力文字数', String(selected.totalChars));
      appendDetailRow('正タイプ数', String(selected.correctKeys));
      appendDetailRow('誤タイプ数', String(selected.errorKeys));
      appendDetailRow('総タイプ数', String(totalKeys));
      appendDetailRow('正タイプ率', toPercent(correctRate));
      appendDetailRow('誤タイプ率', toPercent(errorRate));
      appendDetailRow('WPM', wpm.toFixed(1));
      appendDetailRow('KPM', kpm.toFixed(1));

      detailGrid.hidden = false;
      status.textContent = buildStatusMessage(`ステータス: ${selected.date} の計測結果（${sessionMinutes}分計測）`);
    } catch {
      status.textContent = 'ステータス: JSONの読み込みに失敗しました。';
    }
  };

  loadAndRenderDetail();
})();
