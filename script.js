const banner = {
  width: 1104,
  height: 306,
  leftWidth: 406,
  leftPadding: 40,
  leftBg: "#F0F3F6",
  rightColor: "#5fc5c3",
  rightTextInset: 42,
  rightTextEndPadding: 64,
  factoidEyebrowMinY: 32,
  factoidMetricBaseline: 264,
  factoidMetricLayoutAscent: 0.72,
  factoidMetricLetterSpacing: -0.04,
  factoidTextGap: 16,
  quoteBottomPadding: 40,
  mindboxLogo: {
    src: "assets/brand/mindbox-black.svg",
    x: 40,
    y: 22,
    width: 146,
    height: 29,
  },
  partnerLogo: {
    x: 40,
    y: 74,
    maxWidth: 270,
    maxHeight: 88,
  },
  speakerAvatar: {
    size: 118,
    strokeColor: "#C8D0DA",
    strokeWidth: 4,
  },
  eyebrow: "к конверсии в заказ из рекламных\nкампаний",
  metric: "+0,44 п. п.",
};

const templates = {
  factoid: {
    rightColor: "#5fc5c3",
    eyebrow: "к конверсии в заказ из рекламных\nкампаний",
    eyebrowColor: "#FFFFFF",
    metric: "+0,44 п. п.",
    metricColor: "#FFFFFF",
    eyebrowSize: 29,
    metricSize: 111,
    personName: "Маргарита Громова",
    personTitle: "CMO, Mindbox",
  },
  speaker: {
    rightColor: "#5fc5c3",
    eyebrow: "",
    metric: "",
    quote: "«Минут десять-пятнадцать минут, пять-десять пятого четыре пять-десять пятого утра»",
    quoteSize: 32,
    personName: "Маргарита Громова",
    personTitle: "CMO, Mindbox",
  },
};

const templateState = {
  factoid: { ...templates.factoid },
  speaker: { ...templates.speaker },
};

const canvas = document.querySelector("#banner-canvas");
const ctx = canvas.getContext("2d");
const form = document.querySelector("#banner-form");
const templateControls = document.querySelector("#template-controls");
const rightColor = document.querySelector("#right-color");
const rightColorHex = document.querySelector("#right-color-hex");
const eyebrowText = document.querySelector("#eyebrow-text");
const eyebrowSize = document.querySelector("#eyebrow-size");
const metricText = document.querySelector("#metric-text");
const metricSize = document.querySelector("#metric-size");
const quoteText = document.querySelector("#quote-text");
const quoteSize = document.querySelector("#quote-size");
const logoLibraryField = document.querySelector("#logo-library-field");
const logoLibrary = document.querySelector("#logo-library");
const logoFile = document.querySelector("#logo-file");
const logoScale = document.querySelector("#logo-scale");
const logoScaleValue = document.querySelector("#logo-scale-value");
const logoPreserveColorsField = document.querySelector("#logo-preserve-colors-field");
const logoPreserveColors = document.querySelector("#logo-preserve-colors");
const logoColorField = document.querySelector("#logo-color-field");
const logoColor = document.querySelector("#logo-color");
const logoColorHex = document.querySelector("#logo-color-hex");
const personFile = document.querySelector("#person-file");
const personZoom = document.querySelector("#person-zoom");
const personZoomValue = document.querySelector("#person-zoom-value");
const personOffsetX = document.querySelector("#person-offset-x");
const personOffsetXValue = document.querySelector("#person-offset-x-value");
const personOffsetY = document.querySelector("#person-offset-y");
const personOffsetYValue = document.querySelector("#person-offset-y-value");
const personName = document.querySelector("#person-name");
const personTitle = document.querySelector("#person-title");
const factoidFields = document.querySelector("#factoid-fields");
const speakerFields = document.querySelector("#speaker-fields");
const resetMedia = document.querySelector("#reset-media");
const download = document.querySelector("#download");
const eyedropperButtons = document.querySelectorAll("[data-eyedropper-target]");
const factoidColorButtons = document.querySelectorAll("[data-text-color-target]");

let currentTemplate = "factoid";
let partnerLogo = null;
let personPhoto = null;
let exportUrl = "";
const mindboxLogo = new Image();
mindboxLogo.addEventListener("load", drawBanner);
mindboxLogo.src = banner.mindboxLogo.src;

const fontFamily = '"CoFo Sans", "CoFo Sans Variable", Arial, Helvetica, sans-serif';
const hangingWords = new Set([
  "а",
  "без",
  "в",
  "во",
  "до",
  "для",
  "за",
  "и",
  "из",
  "изо",
  "к",
  "ко",
  "меж",
  "на",
  "над",
  "не",
  "но",
  "о",
  "об",
  "обо",
  "от",
  "перед",
  "по",
  "под",
  "при",
  "про",
  "с",
  "со",
  "у",
  "через",
]);

function fitFontSize(text, baseSize, maxWidth, fontWeight, family, minSize = 34) {
  let size = baseSize;
  ctx.font = `${fontWeight} ${size}px ${family}`;

  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `${fontWeight} ${size}px ${family}`;
  }

  return size;
}

function measureTrackedTextWidth(text, letterSpacing) {
  const characters = Array.from(text);
  const textWidth = characters.reduce((width, character) => width + ctx.measureText(character).width, 0);

  return textWidth + Math.max(0, characters.length - 1) * letterSpacing;
}

function fitFontSizeWithLetterSpacing(text, baseSize, maxWidth, fontWeight, family, spacingRatio, minSize = 34) {
  let size = baseSize;
  ctx.font = `${fontWeight} ${size}px ${family}`;

  while (measureTrackedTextWidth(text, size * spacingRatio) > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `${fontWeight} ${size}px ${family}`;
  }

  return size;
}

function drawTrackedText(text, x, y, letterSpacing) {
  let currentX = x;

  Array.from(text).forEach((character) => {
    ctx.fillText(character, currentX, y);
    currentX += ctx.measureText(character).width + letterSpacing;
  });
}

function getNumber(input, fallback, min, max) {
  const value = Number.parseFloat(input.value);
  if (Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function updateLogoScaleLabel() {
  logoScaleValue.value = `${Math.round(getNumber(logoScale, 100, 40, 220))}%`;
}

function updatePersonCropLabels() {
  personZoomValue.value = `${Math.round(getNumber(personZoom, 100, 100, 300))}%`;
  personOffsetXValue.value = `${Math.round(getNumber(personOffsetX, 0, -100, 100))}`;
  personOffsetYValue.value = `${Math.round(getNumber(personOffsetY, 0, -100, 100))}`;
}

function normalizeHexColor(value) {
  const preparedValue = value.trim().replace(/^#?/, "#");

  if (/^#[0-9a-f]{3}$/i.test(preparedValue)) {
    return `#${preparedValue
      .slice(1)
      .split("")
      .map((character) => `${character}${character}`)
      .join("")}`.toUpperCase();
  }

  if (/^#[0-9a-f]{6}$/i.test(preparedValue)) {
    return preparedValue.toUpperCase();
  }

  return null;
}

function syncHexFromColor(colorInput, hexInput) {
  hexInput.value = colorInput.value.toUpperCase();
  hexInput.setCustomValidity("");
}

function syncColorFromHex(colorInput, hexInput) {
  const normalizedColor = normalizeHexColor(hexInput.value);

  if (!normalizedColor) {
    hexInput.setCustomValidity("Введите HEX в формате #RRGGBB");
    return;
  }

  hexInput.setCustomValidity("");
  hexInput.value = normalizedColor;
  colorInput.value = normalizedColor;
  colorInput.dispatchEvent(new Event("input", { bubbles: true }));
  colorInput.dispatchEvent(new Event("change", { bubbles: true }));
}

function syncColorHexInputs() {
  syncHexFromColor(rightColor, rightColorHex);
  syncHexFromColor(logoColor, logoColorHex);
}

function getFactoidTextColor(target) {
  return templateState.factoid[`${target}Color`] || "#FFFFFF";
}

function setFactoidTextColor(target, color) {
  const normalizedColor = normalizeHexColor(color);

  if (!normalizedColor || !templateState.factoid[`${target}Color`]) {
    return;
  }

  templateState.factoid[`${target}Color`] = normalizedColor;
  syncFactoidColorButtons();
}

function syncFactoidColorButtons() {
  factoidColorButtons.forEach((button) => {
    const target = button.dataset.textColorTarget;
    const buttonColor = normalizeHexColor(button.dataset.color);
    button.classList.toggle("is-active", buttonColor === getFactoidTextColor(target));
  });
}

function drawFittedLine(text, x, y, maxWidth, baseSize, minSize, weight, color) {
  const value = text.trim();
  const fontSize = fitFontSize(value, baseSize, maxWidth, weight, fontFamily, minSize);

  ctx.fillStyle = color;
  ctx.font = `${weight} ${Math.max(fontSize, minSize)}px ${fontFamily}`;
  ctx.textBaseline = "top";
  ctx.fillText(value, x, y);
}

function wrapText(text, maxWidth, font) {
  ctx.font = font;
  const sourceLines = text.split(/\n/);
  const wrapped = [];

  function normalizeHangingCandidate(word) {
    return word
      .toLowerCase()
      .replace(/^[([{«"“„]+/, "")
      .replace(/[)\]}»"”.,:;!?]+$/, "");
  }

  function isHangingWord(word) {
    return hangingWords.has(normalizeHangingCandidate(word));
  }

  function bindHangingWords(words) {
    const units = [];
    let pending = [];

    words.forEach((word) => {
      if (isHangingWord(word)) {
        pending.push(word);
        return;
      }

      if (pending.length > 0) {
        units.push([...pending, word].join("\u00a0"));
        pending = [];
        return;
      }

      units.push(word);
    });

    if (pending.length > 0) {
      units.push(pending.join("\u00a0"));
    }

    return units;
  }

  function splitLongWord(word) {
    const parts = [];
    let part = "";

    Array.from(word).forEach((char) => {
      const candidate = `${part}${char}`;

      if (part && ctx.measureText(candidate).width > maxWidth) {
        parts.push(part);
        part = char;
        return;
      }

      part = candidate;
    });

    if (part) {
      parts.push(part);
    }

    return parts;
  }

  sourceLines.forEach((sourceLine) => {
    const words = bindHangingWords(sourceLine.trim().split(/\s+/).filter(Boolean)).flatMap((word) => {
      if (ctx.measureText(word).width <= maxWidth) {
        return word;
      }

      return splitLongWord(word);
    });

    if (words.length === 0) {
      wrapped.push("");
      return;
    }

    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;

      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
        return;
      }

      if (line) {
        wrapped.push(line);
      }

      line = word;
    });

    wrapped.push(line);
  });

  return wrapped;
}

function drawWrappedText(text, options) {
  const {
    color,
    fontSize,
    lineHeight,
    maxLines,
    maxWidth,
    weight,
    x,
    y,
  } = options;
  const font = `${weight} ${fontSize}px ${fontFamily}`;
  const allLines = wrapText(text, maxWidth, font);
  const lines = Number.isFinite(maxLines) ? allLines.slice(0, maxLines) : allLines;

  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textBaseline = "top";

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return {
    endY: y + lines.length * lineHeight,
    lineCount: lines.length,
    lines,
  };
}

function drawMindboxLogo() {
  if (!mindboxLogo.complete || mindboxLogo.naturalWidth === 0) {
    return;
  }

  ctx.drawImage(
    mindboxLogo,
    banner.mindboxLogo.x,
    banner.mindboxLogo.y,
    banner.mindboxLogo.width,
    banner.mindboxLogo.height,
  );
}

function drawLogoBlock() {
  if (!partnerLogo) {
    return;
  }

  const scale = getNumber(logoScale, 100, 40, 220) / 100;
  const ratio = Math.min(
    banner.partnerLogo.maxWidth / partnerLogo.width,
    banner.partnerLogo.maxHeight / partnerLogo.height,
  ) * scale;
  const width = partnerLogo.width * ratio;
  const height = partnerLogo.height * ratio;

  ctx.drawImage(partnerLogo.image, banner.partnerLogo.x, banner.partnerLogo.y, width, height);
}

function drawPersonBlock() {
  const avatarSize = banner.speakerAvatar.size;
  const avatarX = banner.leftPadding;
  const textX = banner.leftPadding;
  const textMaxWidth = banner.leftWidth - banner.leftPadding * 2;
  const rawName = personName.value.trim() || "Маргарита Громова";
  const rawTitle = personTitle.value.trim() || "CMO, Mindbox";
  const defaultAvatarY = 78;
  const groupTopPadding = 18;
  const groupBottomPadding = 34;
  const avatarTextGap = 18;
  const textGap = 5;
  const singleLineNameFont = `500 28px ${fontFamily}`;
  const nameNeedsWrap = wrapText(rawName, textMaxWidth, singleLineNameFont).length > 1;
  const nameFontSize = nameNeedsWrap ? 24 : 28;
  const nameLineHeight = nameNeedsWrap ? 26 : 30;
  const nameFont = `500 ${nameFontSize}px ${fontFamily}`;
  const titleFontSize = 18;
  const titleLineHeight = 20;
  const titleFont = `400 ${titleFontSize}px ${fontFamily}`;
  const nameLines = wrapText(rawName, textMaxWidth, nameFont);
  const titleLines = wrapText(rawTitle, textMaxWidth, titleFont);
  const textBlockHeight = nameLines.length * nameLineHeight + textGap + titleLines.length * titleLineHeight;
  const groupHeight = avatarSize + avatarTextGap + textBlockHeight;
  const availableGroupHeight = banner.height - groupTopPadding - groupBottomPadding;
  const minAvatarY = groupHeight > availableGroupHeight ? 0 : groupTopPadding;

  const avatarY = Math.max(
    minAvatarY,
    Math.min(defaultAvatarY, banner.height - groupBottomPadding - groupHeight),
  );

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();

  if (personPhoto) {
    const zoom = getNumber(personZoom, 100, 100, 300) / 100;
    const ratio = Math.max(avatarSize / personPhoto.width, avatarSize / personPhoto.height) * zoom;
    const width = personPhoto.width * ratio;
    const height = personPhoto.height * ratio;
    const maxOffsetX = Math.max(0, (width - avatarSize) / 2);
    const maxOffsetY = Math.max(0, (height - avatarSize) / 2);
    const offsetX = (getNumber(personOffsetX, 0, -100, 100) / 100) * maxOffsetX;
    const offsetY = (getNumber(personOffsetY, 0, -100, 100) / 100) * maxOffsetY;

    ctx.drawImage(
      personPhoto,
      avatarX - (width - avatarSize) / 2 + offsetX,
      avatarY - (height - avatarSize) / 2 + offsetY,
      width,
      height,
    );
  } else {
    ctx.fillStyle = "#bfc6d1";
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
  }

  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2 - banner.speakerAvatar.strokeWidth / 2,
    0,
    Math.PI * 2,
  );
  ctx.lineWidth = banner.speakerAvatar.strokeWidth;
  ctx.strokeStyle = banner.speakerAvatar.strokeColor;
  ctx.stroke();
  ctx.restore();

  const nameY = avatarY + avatarSize + avatarTextGap;
  const nameBlock = drawWrappedText(rawName, {
    color: "#292B32",
    fontSize: nameFontSize,
    lineHeight: nameLineHeight,
    maxLines: Infinity,
    maxWidth: textMaxWidth,
    weight: "500",
    x: textX,
    y: nameY,
  });
  const titleY = nameBlock.endY + textGap;

  drawWrappedText(rawTitle, {
    color: "#757987",
    fontSize: titleFontSize,
    lineHeight: titleLineHeight,
    maxLines: Infinity,
    maxWidth: textMaxWidth,
    weight: "400",
    x: textX,
    y: titleY,
  });
}

function drawLeftContent() {
  if (currentTemplate === "speaker") {
    drawPersonBlock();
    return;
  }

  drawLogoBlock();
}

function drawMetricText(left, maxWidth) {
  const metric = metricText.value.trim() || banner.metric;
  const metricBaseSize = getNumber(metricSize, templates.factoid.metricSize, 54, 128);
  const fittedMetricSize = fitFontSizeWithLetterSpacing(
    metric,
    metricBaseSize,
    maxWidth,
    "400",
    fontFamily,
    banner.factoidMetricLetterSpacing,
    34,
  );
  const metricFont = `400 ${fittedMetricSize}px ${fontFamily}`;
  const metricLetterSpacing = fittedMetricSize * banner.factoidMetricLetterSpacing;
  ctx.font = metricFont;

  const metricBaseline = banner.factoidMetricBaseline;
  const metricTop = metricBaseline - fittedMetricSize * banner.factoidMetricLayoutAscent;
  const eyebrowBottomY = metricTop - banner.factoidTextGap;

  let eyebrowFontSize = getNumber(eyebrowSize, templates.factoid.eyebrowSize, 18, 44);
  let eyebrowFont = `500 ${eyebrowFontSize}px ${fontFamily}`;
  let eyebrowLines = wrapText(eyebrowText.value, maxWidth, eyebrowFont).slice(0, 4);
  let eyebrowLineHeight = Math.round(eyebrowFontSize * 1.15);
  let eyebrowY = eyebrowBottomY - eyebrowLines.length * eyebrowLineHeight;

  while (eyebrowY < banner.factoidEyebrowMinY && eyebrowFontSize > 16) {
    eyebrowFontSize -= 1;
    eyebrowFont = `500 ${eyebrowFontSize}px ${fontFamily}`;
    eyebrowLines = wrapText(eyebrowText.value, maxWidth, eyebrowFont).slice(0, 4);
    eyebrowLineHeight = Math.round(eyebrowFontSize * 1.15);
    eyebrowY = eyebrowBottomY - eyebrowLines.length * eyebrowLineHeight;
  }

  if (eyebrowY < banner.factoidEyebrowMinY) {
    const maxVisibleEyebrowLines = Math.max(
      1,
      Math.floor((eyebrowBottomY - banner.factoidEyebrowMinY) / eyebrowLineHeight),
    );
    eyebrowLines = eyebrowLines.slice(0, maxVisibleEyebrowLines);
    eyebrowY = eyebrowBottomY - eyebrowLines.length * eyebrowLineHeight;
  }

  eyebrowY = Math.max(banner.factoidEyebrowMinY, eyebrowY);

  ctx.fillStyle = getFactoidTextColor("metric");
  ctx.font = metricFont;
  ctx.textBaseline = "alphabetic";
  drawTrackedText(metric, left, metricBaseline, metricLetterSpacing);

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, 0, maxWidth, eyebrowBottomY);
  ctx.clip();
  ctx.fillStyle = getFactoidTextColor("eyebrow");
  ctx.textBaseline = "top";
  ctx.font = eyebrowFont;

  let y = eyebrowY;
  eyebrowLines.forEach((line) => {
    ctx.fillText(line, left, y);
    y += eyebrowLineHeight;
  });
  ctx.restore();
}

function drawQuoteText(left, maxWidth) {
  const quote = quoteText.value.trim() || templates.speaker.quote;
  const fontSize = getNumber(quoteSize, templates.speaker.quoteSize, 32, 44);
  const font = `500 ${fontSize}px ${fontFamily}`;
  const lineHeight = Math.round(fontSize * 1.18);
  const topPadding = 32;
  const availableHeight = banner.height - topPadding - banner.quoteBottomPadding;
  const maxVisibleLines = Math.max(1, Math.floor(availableHeight / lineHeight));
  const quoteLines = wrapText(quote, maxWidth, font);

  ctx.fillStyle = "#ffffff";
  ctx.font = font;
  ctx.textBaseline = "top";

  const visibleLines = quoteLines.slice(0, maxVisibleLines);
  const textBlockHeight = visibleLines.length * lineHeight;
  let y = banner.height - banner.quoteBottomPadding - textBlockHeight;

  visibleLines.forEach((line) => {
    ctx.fillText(line, left, y);
    y += lineHeight;
  });
}

function drawRightText() {
  const left = banner.leftWidth + banner.rightTextInset;
  const maxWidth = banner.width - left - banner.rightTextEndPadding;

  if (currentTemplate === "speaker") {
    drawQuoteText(left, maxWidth);
    return;
  }

  drawMetricText(left, maxWidth);
}

function drawBanner() {
  banner.rightColor = rightColor.value;

  ctx.clearRect(0, 0, banner.width, banner.height);
  ctx.fillStyle = banner.leftBg;
  ctx.fillRect(0, 0, banner.leftWidth, banner.height);
  ctx.fillStyle = banner.rightColor;
  ctx.fillRect(banner.leftWidth, 0, banner.width - banner.leftWidth, banner.height);

  if (currentTemplate === "factoid") {
    drawMindboxLogo();
  }

  drawLeftContent();
  drawRightText();
}

function syncVisibleFields() {
  const isSpeaker = currentTemplate === "speaker";
  factoidFields.hidden = isSpeaker;
  speakerFields.hidden = !isSpeaker;
}

function saveCurrentTemplateState() {
  const state = templateState[currentTemplate];

  if (!state) {
    return;
  }

  state.rightColor = rightColor.value;

  if (currentTemplate === "factoid") {
    state.eyebrow = eyebrowText.value;
    state.eyebrowSize = eyebrowSize.value;
    state.metric = metricText.value;
    state.metricSize = metricSize.value;
    return;
  }

  state.quote = quoteText.value;
  state.quoteSize = quoteSize.value;
  state.personName = personName.value;
  state.personTitle = personTitle.value;
}

function restoreTemplateState(templateName) {
  const state = templateState[templateName];

  if (!state) {
    return;
  }

  rightColor.value = state.rightColor;
  syncHexFromColor(rightColor, rightColorHex);

  if (templateName === "factoid") {
    eyebrowText.value = state.eyebrow;
    eyebrowSize.value = state.eyebrowSize;
    metricText.value = state.metric;
    metricSize.value = state.metricSize;
    syncFactoidColorButtons();
    return;
  }

  quoteText.value = state.quote;
  quoteSize.value = state.quoteSize;
  personName.value = state.personName;
  personTitle.value = state.personTitle;
}

function loadImage(file, onLoad) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const image = new Image();
    image.addEventListener("load", () => {
      onLoad(image);
      drawBanner();
    });
    image.src = reader.result;
  });
  reader.readAsDataURL(file);
}

function createLogoRecord(image, kind, originalSvg = "", dimensions = null) {
  return {
    height: dimensions?.height || image.naturalHeight || image.height,
    image,
    kind,
    originalSvg,
    width: dimensions?.width || image.naturalWidth || image.width,
  };
}

function isSvgFile(file) {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}

function svgToDataUrl(svgText) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

function dataUrlToBlob(dataUrl) {
  const [header, payload] = dataUrl.split(",");
  const mime = header.match(/data:([^;]+)/)?.[1] || "image/png";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

function setExportUrl(blob) {
  if (exportUrl) {
    URL.revokeObjectURL(exportUrl);
  }

  exportUrl = URL.createObjectURL(blob);
}

function clearExport() {
  if (exportUrl) {
    URL.revokeObjectURL(exportUrl);
  }

  exportUrl = "";
}

function clickDownloadLink() {
  const link = document.createElement("a");
  link.download = "mindbox-banner.png";
  link.href = exportUrl;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

function tryClickDownloadLink() {
  try {
    clickDownloadLink();
  } catch (error) {
    console.warn("Automatic PNG download was blocked.", error);
  }
}

function exportPng() {
  drawBanner();

  if (!canvas.toBlob) {
    setExportUrl(dataUrlToBlob(canvas.toDataURL("image/png")));
    tryClickDownloadLink();
    return;
  }

  canvas.toBlob((blob) => {
    if (!blob) {
      setExportUrl(dataUrlToBlob(canvas.toDataURL("image/png")));
      tryClickDownloadLink();
      return;
    }

    setExportUrl(blob);
    tryClickDownloadLink();
  }, "image/png");
}

function syncEyedropperButtons() {
  const isSupported = "EyeDropper" in window;

  eyedropperButtons.forEach((button) => {
    button.hidden = !isSupported;
  });
}

async function pickColor(targetId) {
  const targetInput = document.querySelector(`#${targetId}`);

  if (!targetInput || !("EyeDropper" in window)) {
    return;
  }

  try {
    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();

    if (!result?.sRGBHex) {
      return;
    }

    targetInput.value = result.sRGBHex;
    targetInput.dispatchEvent(new Event("input", { bubbles: true }));
    targetInput.dispatchEvent(new Event("change", { bubbles: true }));
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.warn("Could not pick a color.", error);
    }
  }
}

function sanitizeSvg(svgText) {
  const parser = new DOMParser();
  const documentSvg = parser.parseFromString(svgText, "image/svg+xml");
  const svg = documentSvg.querySelector("svg");

  if (!svg) {
    return svgText;
  }

  svg.querySelectorAll("script").forEach((script) => script.remove());
  return new XMLSerializer().serializeToString(svg);
}

function parseSvgDimensions(svgText) {
  const parser = new DOMParser();
  const documentSvg = parser.parseFromString(svgText, "image/svg+xml");
  const svg = documentSvg.querySelector("svg");

  if (!svg) {
    return null;
  }

  const width = Number.parseFloat(svg.getAttribute("width"));
  const height = Number.parseFloat(svg.getAttribute("height"));

  if (width && height) {
    return { height, width };
  }

  const viewBox = svg.getAttribute("viewBox")?.trim().split(/\s+/).map(Number);
  if (viewBox?.length === 4 && viewBox[2] && viewBox[3]) {
    return { height: viewBox[3], width: viewBox[2] };
  }

  return null;
}

function replacePaintInStyle(style, property, color) {
  const propertyPattern = new RegExp(`${property}\\s*:\\s*[^;]+`, "i");
  const nonePattern = new RegExp(`${property}\\s*:\\s*none`, "i");

  if (nonePattern.test(style)) {
    return style;
  }

  if (propertyPattern.test(style)) {
    return style.replace(propertyPattern, `${property}: ${color}`);
  }

  return style;
}

function colorizeSvg(svgText, color) {
  const parser = new DOMParser();
  const documentSvg = parser.parseFromString(svgText, "image/svg+xml");
  const svg = documentSvg.querySelector("svg");

  if (!svg) {
    return svgText;
  }

  svg.querySelectorAll("script").forEach((script) => script.remove());
  svg.querySelectorAll("*").forEach((element) => {
    const fill = element.getAttribute("fill");
    const stroke = element.getAttribute("stroke");
    const style = element.getAttribute("style") || "";
    const styleHasFillNone = /fill\s*:\s*none/i.test(style);
    const styleHasStrokeNone = /stroke\s*:\s*none/i.test(style);
    const updatedStyle = replacePaintInStyle(replacePaintInStyle(style, "fill", color), "stroke", color);

    if (updatedStyle !== style) {
      element.setAttribute("style", updatedStyle);
    }

    if ((!fill || fill !== "none") && !styleHasFillNone) {
      element.setAttribute("fill", color);
      element.style.fill = color;
    }

    if (stroke && stroke !== "none" && !styleHasStrokeNone) {
      element.setAttribute("stroke", color);
      element.style.stroke = color;
    }
  });

  return new XMLSerializer().serializeToString(svg);
}

function setSvgLogo(svgText, selectedButton = null) {
  const dimensions = parseSvgDimensions(svgText);
  const image = new Image();
  image.addEventListener("load", () => {
    partnerLogo = createLogoRecord(image, "svg", svgText, dimensions);
    logoPreserveColorsField.hidden = false;
    logoColorField.hidden = logoPreserveColors.checked;
    clearLogoLibrarySelection();

    if (selectedButton) {
      selectedButton.classList.add("is-active");
    }

    drawBanner();
  });
  image.src = svgToDataUrl(logoPreserveColors.checked ? sanitizeSvg(svgText) : colorizeSvg(svgText, logoColor.value));
}

function applyTemplate(templateName) {
  if (!templateState[templateName]) {
    return;
  }

  clearExport();
  saveCurrentTemplateState();
  currentTemplate = templateName;
  restoreTemplateState(templateName);

  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.template === templateName);
  });

  syncVisibleFields();
  drawBanner();
}

function clearLogoLibrarySelection() {
  logoLibrary.querySelectorAll(".logo-choice").forEach((button) => {
    button.classList.remove("is-active");
  });
}

async function setPartnerLogo(src, selectedButton) {
  if (src.toLowerCase().endsWith(".svg")) {
    try {
      const response = await fetch(src, { cache: "no-store" });
      if (response.ok) {
        setSvgLogo(await response.text(), selectedButton);
        return;
      }
    } catch (error) {
      logoColorField.hidden = true;
    }
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.addEventListener("load", () => {
    partnerLogo = createLogoRecord(image, "raster");
    logoPreserveColorsField.hidden = true;
    logoColorField.hidden = true;
    clearLogoLibrarySelection();

    if (selectedButton) {
      selectedButton.classList.add("is-active");
    }

    drawBanner();
  });
  image.src = src;
}

async function loadLogoLibrary() {
  try {
    const response = await fetch("logos/logos.json", { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const logos = await response.json();
    if (!Array.isArray(logos) || logos.length === 0) {
      return;
    }

    logoLibrary.replaceChildren();
    logos.forEach((logo) => {
      if (!logo.name || !logo.src) {
        return;
      }

      const button = document.createElement("button");
      const image = document.createElement("img");
      button.className = "logo-choice";
      button.type = "button";
      button.setAttribute("aria-label", logo.name);
      image.src = logo.src;
      image.alt = logo.name;
      button.append(image);
      button.addEventListener("click", () => {
        setPartnerLogo(logo.src, button);
      });
      logoLibrary.append(button);
    });

    logoLibraryField.hidden = logoLibrary.children.length === 0;
  } catch (error) {
    logoLibraryField.hidden = true;
  }
}

form.addEventListener("input", () => {
  clearExport();
  saveCurrentTemplateState();
  drawBanner();
});

form.addEventListener("change", () => {
  clearExport();
  saveCurrentTemplateState();
  drawBanner();
});

[
  [rightColor, rightColorHex],
  [logoColor, logoColorHex],
].forEach(([colorInput, hexInput]) => {
  colorInput.addEventListener("input", () => {
    syncHexFromColor(colorInput, hexInput);
  });

  hexInput.addEventListener("input", () => {
    syncColorFromHex(colorInput, hexInput);
  });

  hexInput.addEventListener("blur", () => {
    if (!normalizeHexColor(hexInput.value)) {
      syncHexFromColor(colorInput, hexInput);
      return;
    }

    syncColorFromHex(colorInput, hexInput);
  });
});

templateControls.addEventListener("click", (event) => {
  const button = event.target.closest("[data-template]");
  if (!button) {
    return;
  }

  applyTemplate(button.dataset.template);
});

factoidColorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    clearExport();
    saveCurrentTemplateState();
    setFactoidTextColor(button.dataset.textColorTarget, button.dataset.color);
    drawBanner();
  });
});

logoFile.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  if (isSvgFile(file)) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setSvgLogo(reader.result);
    });
    reader.readAsText(file);
    return;
  }

  loadImage(file, (image) => {
    partnerLogo = createLogoRecord(image, "raster");
    logoPreserveColorsField.hidden = true;
    logoColorField.hidden = true;
    clearLogoLibrarySelection();
  });
});

logoScale.addEventListener("input", () => {
  updateLogoScaleLabel();
  drawBanner();
});

logoColor.addEventListener("input", () => {
  if (partnerLogo?.kind === "svg" && partnerLogo.originalSvg) {
    setSvgLogo(partnerLogo.originalSvg);
  }
});

logoPreserveColors.addEventListener("change", () => {
  logoColorField.hidden = logoPreserveColors.checked;

  if (partnerLogo?.kind === "svg" && partnerLogo.originalSvg) {
    setSvgLogo(partnerLogo.originalSvg);
  }
});

eyedropperButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pickColor(button.dataset.eyedropperTarget);
  });
});

personFile.addEventListener("change", (event) => {
  loadImage(event.target.files[0], (image) => {
    personPhoto = image;
  });
});

[personZoom, personOffsetX, personOffsetY].forEach((input) => {
  input.addEventListener("input", () => {
    updatePersonCropLabels();
    drawBanner();
  });
});

resetMedia.addEventListener("click", () => {
  clearExport();
  partnerLogo = null;
  personPhoto = null;
  logoFile.value = "";
  personFile.value = "";
  logoScale.value = "100";
  logoColor.value = "#292b32";
  syncColorHexInputs();
  logoPreserveColors.checked = true;
  logoPreserveColorsField.hidden = true;
  logoColorField.hidden = true;
  personZoom.value = "100";
  personOffsetX.value = "0";
  personOffsetY.value = "0";
  updateLogoScaleLabel();
  updatePersonCropLabels();
  clearLogoLibrarySelection();
  drawBanner();
});

download.addEventListener("click", () => {
  exportPng();
});

restoreTemplateState(currentTemplate);
syncVisibleFields();
syncEyedropperButtons();
syncColorHexInputs();
syncFactoidColorButtons();
updateLogoScaleLabel();
updatePersonCropLabels();
loadLogoLibrary();

async function loadCanvasFonts() {
  if (!document.fonts) {
    drawBanner();
    return;
  }

  await Promise.all([
    document.fonts.load(`400 111px ${fontFamily}`),
    document.fonts.load(`500 31px ${fontFamily}`),
    document.fonts.load(`500 29px ${fontFamily}`),
    document.fonts.load(`500 28px ${fontFamily}`),
    document.fonts.load(`400 18px ${fontFamily}`),
  ]);
  await document.fonts.ready;
  drawBanner();
}

loadCanvasFonts().catch(drawBanner);
drawBanner();
