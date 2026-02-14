import fs from 'fs';

function parseAnkiCardTxt(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  const cards = [];

  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') {
      continue;
    }

    let front, back;

    if (line.startsWith('"')) {
      const endQuote = line.indexOf('"\t');
      if (endQuote === -1) {
        continue;
      }
      front = line.slice(1, endQuote);
      const rest = line.slice(endQuote + 2);
      back = rest.startsWith('"') && rest.endsWith('"')
        ? rest.slice(1, -1)
        : rest;
    } else {
      const tabIndex = line.indexOf('\t');
      if (tabIndex === -1) {
        continue;
      }
      front = line.slice(0, tabIndex);
      back = line.slice(tabIndex + 1);
    }

    // Strip the html tags
    const stripHtml = (html) =>
      html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&nbsp;/gi, ' ')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .trim();

    cards.push({
      id: cards.length + 1,
      front: stripHtml(front),
      back: stripHtml(back),
      frontHtml: front.trim(),
      backHtml: back.trim(),
    });
  }

  return cards;
}

function parseAnkiNoteTxt(filePath) {

}

export { parseAnkiCardTxt, parseAnkiNoteTxt };
